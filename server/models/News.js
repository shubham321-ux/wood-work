import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        public_id: String,
        url: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('News', newsSchema);
