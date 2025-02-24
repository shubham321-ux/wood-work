import express from 'express';
import { createNews, getNews, updateNews, deleteNews } from '../controllers/newsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(getNews)
    .post(protect, admin, createNews);

router.route('/:id')
    .put(protect, admin, updateNews)
    .delete(protect, admin, deleteNews);

export default router;
