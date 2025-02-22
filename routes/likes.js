const express = require('express');
const router = express.Router();
const {LikeControllers} = require('../controllers/index');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/', authMiddleware ,LikeControllers.likePost);
router.delete('/:id', authMiddleware ,LikeControllers.unlikePost);

module.exports = router;