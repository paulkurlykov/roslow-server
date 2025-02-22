const express = require('express');
const router = express.Router();
const {UserControllers} = require("../controllers/index");
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/register',
body('email').isEmail(),
body('password').isLength({min: 3, max: 32}),
UserControllers.registration);
router.post('/login', UserControllers.login);
router.post('/logout', UserControllers.logout);
router.get('/current', authMiddleware ,UserControllers.currentUser);
router.get('/user/:id', authMiddleware ,UserControllers.getUserById);
router.get('/', authMiddleware ,UserControllers.getUsers);
router.patch('/user/:id', authMiddleware ,UserControllers.updateUser);
router.get("/refresh", UserControllers.refresh);
router.get('/activation/:link', UserControllers.activation);

module.exports = router;
