const mongoose = require('mongoose');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// MongoDB Atlas Connection
let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.warn('⚠️ [MongoDB] MONGODB_URI not provided in .env, falling back to persistent file store.');
    return false;
  }

  try {
    await mongoose.connect(mongoURI);
    isMongoConnected = true;
    console.log(`🍃 [MongoDB Atlas] Connected successfully to host: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    console.error('❌ [MongoDB Atlas] Connection Error:', err.message);
    console.warn('⚠️ [MongoDB] Falling back to file-backed JSON store.');
    isMongoConnected = false;
    return false;
  }
};

// Persistent File Fallback Storage
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let memoryDb = { events: [], registrations: [] };

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      memoryDb = JSON.parse(data);
    }
  } catch (err) {
    console.error('[Database] Failed to load JSON fallback:', err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    console.error('[Database] Failed to save JSON fallback:', err);
  }
}

loadDb();

// Unified Database Interface for MongoDB Atlas & Fallback
const db = {
  connectDB,
  
  events: {
    find: async (filter = {}) => {
      if (isMongoConnected) {
        let query = {};

        if (filter.category && filter.category !== 'All') {
          query.category = { $regex: new RegExp(`^${filter.category}$`, 'i') };
        }
        if (filter.department && filter.department !== 'All') {
          query.department = { $regex: new RegExp(`^${filter.department}$`, 'i') };
        }
        if (filter.status && filter.status !== 'All') {
          query.status = filter.status;
        }
        if (filter.openOnly === 'true') {
          query.status = 'Published';
          query.$expr = { $lt: ['$registeredCount', '$capacity'] };
        }
        if (filter.search) {
          const q = filter.search;
          query.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { speaker: { $regex: q, $options: 'i' } },
            { location: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ];
        }
        if (filter.dateFilter) {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          if (filter.dateFilter === 'today') {
            query.date = { $regex: `^${todayStr}` };
          }
        }

        const events = await Event.find(query).sort({ date: 1 });
        return events.map(e => e.toObject());
      } else {
        // Fallback JSON DB
        let results = [...memoryDb.events];
        if (filter.category && filter.category !== 'All') {
          results = results.filter(e => e.category.toLowerCase() === filter.category.toLowerCase());
        }
        if (filter.department && filter.department !== 'All') {
          results = results.filter(e => e.department.toLowerCase() === filter.department.toLowerCase());
        }
        if (filter.search) {
          const q = filter.search.toLowerCase();
          results = results.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
        }
        return results;
      }
    },

    findById: async (id) => {
      if (isMongoConnected) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          const evt = await Event.findOne({ _id: id }).catch(() => null);
          return evt ? evt.toObject() : null;
        }
        const event = await Event.findById(id);
        return event ? event.toObject() : null;
      } else {
        return memoryDb.events.find(e => e.id === id || e._id === id) || null;
      }
    },

    create: async (data) => {
      if (isMongoConnected) {
        const newEvent = await Event.create(data);
        return newEvent.toObject();
      } else {
        const newEvent = {
          id: uuidv4(),
          _id: uuidv4(),
          ...data,
          registeredCount: 0,
          createdAt: new Date().toISOString()
        };
        memoryDb.events.push(newEvent);
        saveDb();
        return newEvent;
      }
    },

    update: async (id, updateData) => {
      if (isMongoConnected) {
        const event = await Event.findById(id);
        if (!event) return null;

        let updatedCount = updateData.registeredCount !== undefined ? updateData.registeredCount : event.registeredCount;
        let updatedStatus = updateData.status !== undefined ? updateData.status : event.status;

        if (updatedCount >= event.capacity && updatedStatus === 'Published') {
          updatedStatus = 'Sold Out';
        } else if (updatedCount < event.capacity && updatedStatus === 'Sold Out') {
          updatedStatus = 'Published';
        }

        const updated = await Event.findByIdAndUpdate(
          id,
          { ...updateData, registeredCount: updatedCount, status: updatedStatus },
          { new: true, runValidators: true }
        );
        return updated ? updated.toObject() : null;
      } else {
        const idx = memoryDb.events.findIndex(e => e.id === id || e._id === id);
        if (idx === -1) return null;
        memoryDb.events[idx] = { ...memoryDb.events[idx], ...updateData };
        saveDb();
        return memoryDb.events[idx];
      }
    },

    delete: async (id) => {
      if (isMongoConnected) {
        const res = await Event.findByIdAndDelete(id);
        if (res) {
          await Registration.deleteMany({ eventId: id });
          return true;
        }
        return false;
      } else {
        const idx = memoryDb.events.findIndex(e => e.id === id || e._id === id);
        if (idx === -1) return false;
        memoryDb.events.splice(idx, 1);
        saveDb();
        return true;
      }
    }
  },

  registrations: {
    find: async (filter = {}) => {
      if (isMongoConnected) {
        let query = {};
        if (filter.eventId) query.eventId = filter.eventId;
        if (filter.studentId) query.studentId = { $regex: new RegExp(`^${filter.studentId}$`, 'i') };
        if (filter.studentEmail) query.studentEmail = filter.studentEmail.toLowerCase();

        const regs = await Registration.find(query).sort({ registeredAt: -1 });
        return regs.map(r => r.toObject());
      } else {
        let results = [...memoryDb.registrations];
        if (filter.eventId) results = results.filter(r => r.eventId === filter.eventId);
        if (filter.studentId) results = results.filter(r => r.studentId.toLowerCase() === filter.studentId.toLowerCase());
        return results;
      }
    },

    findById: async (id) => {
      if (isMongoConnected) {
        const reg = await Registration.findById(id);
        return reg ? reg.toObject() : null;
      } else {
        return memoryDb.registrations.find(r => r.id === id || r._id === id) || null;
      }
    },

    create: async (data) => {
      const event = await db.events.findById(data.eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      if (event.registeredCount >= event.capacity) {
        throw new Error('Event is at maximum capacity (Sold Out)');
      }

      if (isMongoConnected) {
        // Check duplicate registration
        const existing = await Registration.findOne({
          eventId: data.eventId,
          $or: [
            { studentEmail: data.studentEmail.toLowerCase() },
            { studentId: data.studentId.trim() }
          ]
        });

        if (existing) {
          throw new Error('Student is already registered for this event');
        }

        const passCode = `EVT-${Math.floor(100000 + Math.random() * 900000)}`;

        const newReg = await Registration.create({
          eventId: event._id || event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: event.location,
          studentName: data.studentName,
          studentEmail: data.studentEmail,
          studentId: data.studentId,
          department: data.department || 'Computer Science',
          passCode
        });

        // Increment event registered count
        await db.events.update(event._id || event.id, {
          registeredCount: event.registeredCount + 1
        });

        return newReg.toObject();
      } else {
        const passCode = `EVT-${Math.floor(100000 + Math.random() * 900000)}`;
        const newReg = {
          id: uuidv4(),
          _id: uuidv4(),
          eventId: data.eventId,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: event.location,
          studentName: data.studentName,
          studentEmail: data.studentEmail,
          studentId: data.studentId,
          department: data.department || 'Computer Science',
          passCode,
          checkedIn: false,
          checkedInAt: null,
          registeredAt: new Date().toISOString()
        };
        memoryDb.registrations.push(newReg);
        await db.events.update(event.id, { registeredCount: event.registeredCount + 1 });
        saveDb();
        return newReg;
      }
    },

    toggleCheckIn: async (id) => {
      if (isMongoConnected) {
        const reg = await Registration.findById(id);
        if (!reg) return null;

        reg.checkedIn = !reg.checkedIn;
        reg.checkedInAt = reg.checkedIn ? new Date() : null;
        await reg.save();
        return reg.toObject();
      } else {
        const reg = memoryDb.registrations.find(r => r.id === id || r._id === id);
        if (!reg) return null;
        reg.checkedIn = !reg.checkedIn;
        reg.checkedInAt = reg.checkedIn ? new Date().toISOString() : null;
        saveDb();
        return reg;
      }
    },

    delete: async (id) => {
      if (isMongoConnected) {
        const reg = await Registration.findByIdAndDelete(id);
        if (reg) {
          const event = await db.events.findById(reg.eventId);
          if (event && event.registeredCount > 0) {
            await db.events.update(event._id || event.id, {
              registeredCount: event.registeredCount - 1
            });
          }
          return true;
        }
        return false;
      } else {
        const idx = memoryDb.registrations.findIndex(r => r.id === id || r._id === id);
        if (idx === -1) return false;
        const reg = memoryDb.registrations[idx];
        const event = await db.events.findById(reg.eventId);
        memoryDb.registrations.splice(idx, 1);
        if (event && event.registeredCount > 0) {
          await db.events.update(event.id, { registeredCount: event.registeredCount - 1 });
        }
        saveDb();
        return true;
      }
    }
  },

  seedIfEmpty: async (initialEvents) => {
    if (isMongoConnected) {
      const count = await Event.countDocuments();
      if (count === 0) {
        console.log('🍃 [MongoDB Atlas] Seeding initial campus events collection...');
        await Event.insertMany(initialEvents);
      }
    } else {
      if (memoryDb.events.length === 0) {
        for (const item of initialEvents) {
          await db.events.create(item);
        }
      }
    }
  },

  getStats: async () => {
    if (isMongoConnected) {
      const totalEvents = await Event.countDocuments();
      const totalRegistrations = await Registration.countDocuments();
      
      const events = await Event.find({});
      const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
      const avgCapacityUtil = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;
      
      const checkedInCount = await Registration.countDocuments({ checkedIn: true });
      const checkInRate = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;

      const deptBreakdown = {};
      events.forEach(e => {
        deptBreakdown[e.department] = (deptBreakdown[e.department] || 0) + 1;
      });

      return {
        totalEvents,
        totalRegistrations,
        totalCapacity,
        avgCapacityUtil,
        checkedInCount,
        checkInRate,
        deptBreakdown
      };
    } else {
      const events = memoryDb.events;
      const registrations = memoryDb.registrations;
      const totalEvents = events.length;
      const totalRegistrations = registrations.length;
      const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
      const avgCapacityUtil = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;
      const checkedInCount = registrations.filter(r => r.checkedIn).length;
      const checkInRate = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;

      const deptBreakdown = {};
      events.forEach(e => {
        deptBreakdown[e.department] = (deptBreakdown[e.department] || 0) + 1;
      });

      return {
        totalEvents,
        totalRegistrations,
        totalCapacity,
        avgCapacityUtil,
        checkedInCount,
        checkInRate,
        deptBreakdown
      };
    }
  },
  users: {
    create: async (userData) => {
      if (isMongoConnected) {
        const User = require('./models/User');
        const existing = await User.findOne({ email: userData.email.toLowerCase() });
        if (existing) throw new Error('User with this email address already exists.');
        const user = await User.create(userData);
        return user.toObject();
      } else {
        const existing = (memoryDb.users || []).find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (existing) throw new Error('User with this email address already exists.');
        const newUser = {
          id: uuidv4(),
          _id: uuidv4(),
          ...userData,
          createdAt: new Date().toISOString()
        };
        if (!memoryDb.users) memoryDb.users = [];
        memoryDb.users.push(newUser);
        saveDb();
        return newUser;
      }
    },

    findByEmailWithPassword: async (identifier) => {
      if (!identifier) return null;
      const q = identifier.trim();
      if (isMongoConnected) {
        const User = require('./models/User');
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return await User.findOne({
          $or: [
            { email: q.toLowerCase() },
            { name: new RegExp('^' + escaped + '$', 'i') },
            { studentId: new RegExp('^' + escaped + '$', 'i') }
          ]
        }).select('+password');
      } else {
        return (memoryDb.users || []).find(
          u => u.email.toLowerCase() === q.toLowerCase() || 
               u.name.toLowerCase() === q.toLowerCase() || 
               (u.studentId && u.studentId.toLowerCase() === q.toLowerCase())
        ) || null;
      }
    },

    findById: async (id) => {
      if (isMongoConnected) {
        const User = require('./models/User');
        if (!mongoose.Types.ObjectId.isValid(id)) {
          const user = await User.findOne({ _id: id }).catch(() => null);
          return user ? user.toObject() : null;
        }
        const user = await User.findById(id);
        return user ? user.toObject() : null;
      } else {
        return (memoryDb.users || []).find(u => u.id === id || u._id === id) || null;
      }
    },

    matchPassword: async (userDoc, enteredPassword) => {
      if (isMongoConnected && typeof userDoc.matchPassword === 'function') {
        return await userDoc.matchPassword(enteredPassword);
      } else {
        const bcrypt = require('bcryptjs');
        return await bcrypt.compare(enteredPassword, userDoc.password);
      }
    }
  }
};

module.exports = db;
