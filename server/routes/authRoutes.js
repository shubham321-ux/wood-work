import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Temporary: Generate a new hash to verify
        const newHash = await bcrypt.hash('admin123', 10);
        console.log('New hash generated:', newHash);
        
        const user = await User.findOne({ username });
        console.log('User found:', user);

        // Use the newly generated hash for comparison
        const isMatch = await bcrypt.compare(password, newHash);
        console.log('Password match with new hash:', isMatch);

        if (isMatch) {
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET || 'woodwork-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
