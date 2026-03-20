/**
 * Roadmap Routes
 * Admin: CRUD lộ trình mẫu
 * Public: Xem danh sách + chi tiết
 */
const express = require('express');
const router = express.Router();
const RoadmapController = require('./roadmap.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../config/constants');
const { createRoadmapValidation, updateRoadmapValidation } = require('./roadmap.validation');

// ===== PUBLIC ROUTES =====
router.get('/public', RoadmapController.getPublicList);
router.get('/public/:id', RoadmapController.getPublicDetail);

// ===== ADMIN ROUTES =====
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', RoadmapController.getAll);
router.post('/', validate(createRoadmapValidation), RoadmapController.create);
router.get('/:id', RoadmapController.getById);
router.put('/:id', validate(updateRoadmapValidation), RoadmapController.update);
router.patch('/:id/publish', RoadmapController.togglePublish);
router.delete('/:id', RoadmapController.delete);

module.exports = router;
