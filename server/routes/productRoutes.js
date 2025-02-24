import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const router = express.Router();

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, description, price } = req.body;
        
        let imageData = {};
        if (req.file) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);
            imageData = {
                public_id: result.public_id,
                url: result.secure_url
            };
            // Clean up local file
            fs.unlinkSync(req.file.path);
        }

        const product = await Product.create({
            title,
            description,
            price,
            image: imageData
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(500).json({ 
            message: 'Error creating product',
            error: error.message 
        });
    }
});

export default router;
