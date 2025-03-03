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

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Error fetching products' });
    }
});

// Create new product
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, features } = req.body;
        
        let imageData = {};
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageData = {
                public_id: result.public_id,
                url: result.secure_url
            };
            fs.unlinkSync(req.file.path);
        }

        const product = await Product.create({
            title,
            description,
            price,
            features: Array.isArray(features) ? features : [],
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

// Update product
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, features } = req.body;
        const productId = req.params.id;

        let imageData = {};
        if (req.file) {
            // Delete old image from Cloudinary if exists
            const oldProduct = await Product.findById(productId);
            if (oldProduct.image.public_id) {
                await cloudinary.uploader.destroy(oldProduct.image.public_id);
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path);
            imageData = {
                public_id: result.public_id,
                url: result.secure_url
            };
            fs.unlinkSync(req.file.path);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                title,
                description,
                price,
                features: Array.isArray(features) ? features : [],
                ...(req.file && { image: imageData })
            },
            { new: true }
        );

        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error('Product update error:', error);
        res.status(500).json({
            message: 'Error updating product',
            error: error.message
        });
    }
});

// Delete product
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete image from Cloudinary if exists
        if (product.image.public_id) {
            await cloudinary.uploader.destroy(product.image.public_id);
        }

        await Product.findByIdAndDelete(req.params.id);
        
        res.json({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
    } catch (error) {
        console.error('Product deletion error:', error);
        res.status(500).json({
            message: 'Error deleting product',
            error: error.message
        });
    }
});

export default router;
