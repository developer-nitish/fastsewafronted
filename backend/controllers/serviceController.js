const ServiceRequest = require('../models/ServiceRequest');

// @desc    Create service request
// @route   POST /api/services
// @access  Private
const createServiceRequest = async (req, res) => {
    try {
        const { serviceType, description, address, scheduledDate, priority } = req.body;

        const serviceRequest = await ServiceRequest.create({
            userId: req.user._id,
            serviceType,
            description,
            address,
            scheduledDate,
            priority
        });

        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            serviceRequest
        });
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating service request'
        });
    }
};

// @desc    Get user's service requests
// @route   GET /api/services/my-services
// @access  Private
const getUserServices = async (req, res) => {
    try {
        const services = await ServiceRequest.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: services.length,
            services
        });
    } catch (error) {
        console.error('Get user services error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching services'
        });
    }
};

// @desc    Get single service request
// @route   GET /api/services/:id
// @access  Private
const getServiceById = async (req, res) => {
    try {
        const service = await ServiceRequest.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        res.json({
            success: true,
            service
        });
    } catch (error) {
        console.error('Get service by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching service'
        });
    }
};

// @desc    Update service request
// @route   PUT /api/services/:id
// @access  Private
const updateService = async (req, res) => {
    try {
        const service = await ServiceRequest.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        res.json({
            success: true,
            message: 'Service request updated',
            service
        });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating service'
        });
    }
};

// @desc    Delete service request
// @route   DELETE /api/services/:id
// @access  Private
const deleteService = async (req, res) => {
    try {
        const service = await ServiceRequest.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        res.json({
            success: true,
            message: 'Service request deleted'
        });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting service'
        });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/services/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const services = await ServiceRequest.find({ userId: req.user._id });

        const stats = {
            activeBookings: services.filter(s =>
                ['pending', 'in-progress'].includes(s.status)
            ).length,
            totalServices: services.length,
            completedServices: services.filter(s =>
                s.status === 'completed'
            ).length,
            cancelledServices: services.filter(s =>
                s.status === 'cancelled'
            ).length
        };

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching dashboard stats'
        });
    }
};

module.exports = {
    createServiceRequest,
    getUserServices,
    getServiceById,
    updateService,
    deleteService,
    getDashboardStats
};