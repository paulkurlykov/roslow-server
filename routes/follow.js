const express = require('express');
const router = express.Router();
const {FollowControllers} = require('../controllers/index');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/', authMiddleware ,FollowControllers.followUser);
router.delete('/:id', authMiddleware ,FollowControllers.unfollowUser);

module.exports = router;