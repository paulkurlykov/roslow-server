const express = require('express');
const router = express.Router();
const {PostControllers} = require('../controllers/index');
const authMiddleware = require('../middlewares/auth-middleware');


router.post('/', authMiddleware ,PostControllers.createPost);
router.get('/', authMiddleware ,PostControllers.getPosts);
router.get("/:id", authMiddleware ,PostControllers.getPostById);
router.delete('/:id', authMiddleware ,PostControllers.deletePost);

module.exports = router;