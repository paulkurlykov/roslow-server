const express = require('express');
const router = express.Router();
const {CommentControllers} = require('../controllers/index');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/', authMiddleware ,CommentControllers.createComment);
router.delete('/:id', authMiddleware ,CommentControllers.deleteComment);

module.exports = router;