import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    // This can be null if the user is not registered
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    // For unregistered users, we'll store their contact info directly
    guestInfo: {
        name: {
            type: String,
        },
        phoneNumber: {
            type: String,
        },
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    notes: {
        type: String
    },
    // This is the ID of the artist who will be performing the service
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
}, { timestamps: true });

export default mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);
