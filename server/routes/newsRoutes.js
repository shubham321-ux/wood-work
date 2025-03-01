import express from 'express';
import News from '../models/News.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const router = express.Router();

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Get all news
router.get('/', async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.json({ success: true, news });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ success: false, message: 'Error fetching news' });
    }
});

// Create new news article
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        
        let imageData = {};
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageData = {
                public_id: result.public_id,
                url: result.secure_url
            };
            fs.unlinkSync(req.file.path);
        }

        const news = await News.create({
            title,
            content,
            image: imageData
        });

        res.status(201).json(news);
    } catch (error) {
        console.error('News creation error:', error);
        res.status(500).json({
            message: 'Error creating news',
            error: error.message
        });
    }
});

export default router;
