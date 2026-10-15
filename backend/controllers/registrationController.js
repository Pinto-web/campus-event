const db = require('../db');

// @desc    Register a student for an event
// @route   POST /api/registrations
exports.createRegistration = async (req, res) => {
  try {
    const { eventId, studentName, studentEmail, studentId, department } = req.body;

    if (!eventId || !studentName || !studentEmail || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, Student Name, Email, and Student ID are required'
      });
    }

    const newRegistration = await db.registrations.create({
      eventId,
      studentName,
      studentEmail,
      studentId,
      department
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: newRegistration
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// @desc    Get user's event registration history
// @route   GET /api/registrations/user/:studentId
exports.getUserRegistrations = async (req, res) => {
  try {
    const { studentId } = req.params;
    const registrations = await db.registrations.find({ studentId });

    // Populate event data for each registration
    const enriched = await Promise.all(
      registrations.map(async (reg) => {
        const event = await db.events.findById(reg.eventId);
        return {
          ...reg,
          eventDetails: event || null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user registrations',
      error: error.message
    });
  }
};

// @desc    Get attendee roster for a specific event
// @route   GET /api/registrations/event/:eventId
exports.getEventRoster = async (req, res) => {
  try {
    const { eventId } = req.params;
    const roster = await db.registrations.find({ eventId });
    const event = await db.events.findById(eventId);

    res.status(200).json({
      success: true,
      count: roster.length,
      eventTitle: event ? event.title : 'Event',
      capacity: event ? event.capacity : 0,
      data: roster
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event roster',
      error: error.message
    });
  }
};

// @desc    Toggle check-in status for an attendee
// @route   PUT /api/registrations/:id/checkin
exports.toggleCheckIn = async (req, res) => {
  try {
    const updated = await db.registrations.toggleCheckIn(req.params.id);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Student check-in status updated to ${updated.checkedIn ? 'Checked In' : 'Not Checked In'}`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update check-in status',
      error: error.message
    });
  }
};

// @desc    Cancel a registration
// @route   DELETE /api/registrations/:id
exports.cancelRegistration = async (req, res) => {
  try {
    const deleted = await db.registrations.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully and seat restored'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration',
      error: error.message
    });
  }
};
