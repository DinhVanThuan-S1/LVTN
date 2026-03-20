/**
 * Career Preference Routes
 */
const express = require('express');
const router = express.Router();
const CareerPreferenceController = require('./career-preference.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { ROLES } = require('../../config/constants');

router.use(authenticate, authorize(ROLES.STUDENT));

router.get('/', CareerPreferenceController.getMyPreferences);
router.put('/', CareerPreferenceController.updatePreferences);

module.exports = router;
