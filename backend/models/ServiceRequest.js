const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceType: {
        type: String,
        required: [true, 'Service type is required'],
        enum: [
            'construction',
            'security',
            'legal',
            'medical',
            'land-verification',
            'repair',
            'finance',
            'material',
            'support'
        ]
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [10, 'Description must be at least 10 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    professional: {
        type: String,
        default: null
    },
    price: {
        type: Number,
        default: 0
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    scheduledDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for location (geospatial queries)
serviceRequestSchema.index({ location: '2dsphere' });

// Update timestamp on save
serviceRequestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);