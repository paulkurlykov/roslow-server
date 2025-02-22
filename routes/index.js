const {Router} = require('express');
const router = Router();
const multer = require('multer');
const userRouter = require('./users')
const postRouter = require('./posts')
const commentRouter = require('./comments')
const likeRouter = require('./likes');
const followRouter = require('./follow')





// показываем, где зранить файлы
const uploadDestionation = "uploads"; // имя нашей папки, где хранить изображения
// создаем хранилище файлов
const storage = multer.diskStorage({
  destionation: uploadDestionation,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
})
// сохраняем хранилище
const uploads = multer({
  storage: storage
})


router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/comments', commentRouter);
router.use('/likes', likeRouter);
router.use('/follow', followRouter);
router.get('/', (req, res) => {
  res.send('GET')
});


module.exports = router;
 