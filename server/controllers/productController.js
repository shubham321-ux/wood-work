import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';

export const createProduct = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        
        const product = new Product({
            title: req.body.title,
            description: req.body.description,
            features: JSON.parse(req.body.features),
            image: {
                public_id: result.public_id,
                url: result.secure_url
            }
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (req.file) {
            await cloudinary.uploader.destroy(product.image.public_id);
            const result = await cloudinary.uploader.upload(req.file.path);
            req.body.image = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        await cloudinary.uploader.destroy(product.image.public_id);
        await product.remove();
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
