const db = require('../db');

// @desc    Get all events with filtering
// @route   GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { category, department, status, dateFilter, search, openOnly } = req.query;
    const events = await db.events.find({
      category,
      department,
      status,
      dateFilter,
      search,
      openOnly
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving events',
      error: error.message
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const event = await db.events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching event details',
      error: error.message
    });
  }
};

// @desc    Create a new event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, department, date, time, location, capacity, speaker, speakerRole, status, bannerGradient, tags, agenda } = req.body;

    if (!title || !date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, Date, and Location are required fields'
      });
    }

    const newEvent = await db.events.create({
      title,
      description,
      category,
      department,
      date,
      time,
      location,
      capacity,
      speaker,
      speakerRole,
      status,
      bannerGradient,
      tags,
      agenda
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// @desc    Update existing event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const updatedEvent = await db.events.update(req.params.id, req.body);
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// @desc    Delete or cancel event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const deleted = await db.events.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// @desc    Get event stats for dashboard
// @route   GET /api/events/stats
exports.getEventStats = async (req, res) => {
  try {
    const stats = await db.getStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to compute event stats',
      error: error.message
    });
  }
};
