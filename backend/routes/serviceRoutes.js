const express = require('express');
const router = express.Router();
const {
    createServiceRequest,
    getUserServices,
    getServiceById,
    updateService,
    deleteService,
    getDashboardStats
} = require('../controllers/serviceController');
const { auth } = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.route('/')
    .post(createServiceRequest)
    .get(getUserServices);

router.route('/dashboard/stats')
    .get(getDashboardStats);

router.route('/:id')
    .get(getServiceById)
    .put(updateService)
    .delete(deleteService);

module.exports = router;