const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

router.post('/', registrationController.createRegistration);
router.get('/user/:studentId', registrationController.getUserRegistrations);
router.get('/event/:eventId', registrationController.getEventRoster);
router.put('/:id/checkin', registrationController.toggleCheckIn);
router.delete('/:id', registrationController.cancelRegistration);

module.exports = router;
