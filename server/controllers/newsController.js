import News from '../models/News.js';

export const createNews = async (req, res) => {
    try {
        const news = new News(req.body);
        const savedNews = await news.save();
        res.status(201).json(savedNews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNews = async (req, res) => {
    try {
        const news = await News.find();
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateNews = async (req, res) => {
    try {
        const updatedNews = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedNews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteNews = async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'News removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
