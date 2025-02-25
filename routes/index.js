const { Router } = require("express");
const router = Router();
const userRouter = require("./users");
const postRouter = require("./posts");
const commentRouter = require("./comments");
const likeRouter = require("./likes");
const followRouter = require("./follow");




router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/comments", commentRouter);
router.use("/likes", likeRouter);
router.use("/follow", followRouter);
router.get("/", (req, res) => {
    res.send("GET");
});

module.exports = router;
