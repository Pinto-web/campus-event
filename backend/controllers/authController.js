const jwt = require('jsonwebtoken');
const db = require('../db');

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'campus_event_jwt_secret_key_2026_super_secure',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (Student or Admin)
// @route   POST /api/auth/signup
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, studentId, adminPasscode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Role validation
    const userRole = role === 'admin' ? 'admin' : 'student';

    // If admin signup, verify security passcode
    if (userRole === 'admin') {
      const requiredPasscode = process.env.ADMIN_PASSCODE || 'ADMIN123';
      if (adminPasscode !== requiredPasscode) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Admin Security Passcode. Authorization denied.'
        });
      }
    }

    const newUser = await db.users.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      department: department || 'Computer Science',
      studentId: studentId || (userRole === 'student' ? `STU-${Math.floor(1000 + Math.random() * 9000)}` : undefined)
    });

    const token = generateToken(newUser._id || newUser.id, newUser.role);

    res.status(201).json({
      success: true,
      message: `${userRole === 'admin' ? 'Organizer Admin' : 'Student'} registered successfully!`,
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        studentId: newUser.studentId
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const identifier = req.body.email || req.body.identifier || req.body.name;
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Campus Email/Name and password are required'
      });
    }

    const user = await db.users.findByEmailWithPassword(identifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await db.users.matchPassword(user, password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id || user.id, user.role);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login server error',
      error: error.message
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};
