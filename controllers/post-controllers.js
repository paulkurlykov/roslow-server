const ApiError = require("../exceptions/api-errors");
const { PrismaClient } = require("@prisma/client");

async function createPost(req, res, next) {
    try {
        const { content } = req.body;

        const authorId = req.user.id;

        if (!content) {
            ApiError.BadRequest("Все поля обязательны");
        }

        const newPost = await new PrismaClient().post.create({
            data: {
                content,
                authorId,
            },
        });

        return res.json(newPost);
    } catch (err) {
        console.error("Ошибка при создании поста");
        next(err);
    }
}

async function getPosts(req, res, next) {
    try {
        const userId = req.user.id;
        const posts = await new PrismaClient().post.findMany({
            include: {
                likes: true,
                author: true,
                comments: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json(posts);
    } catch (err) {
        next(ApiError.BadRequest("Ошибка при получении постов"));
    }
}

async function getPostById(req, res, next) {
    try {
        const { id } = req.params;

        const userId = req.user.id;

        const post = await new PrismaClient().post.findUnique({
            where: { id },
            include: {
              comments: {
                include: {
                  user: true,
                }
              },
              likes: true,
              author: true
            }, // Include related posts
          });

        if (!post) {
            throw ApiError.BadRequest("Такой пост не найден!")
        }

        return res.json(post);
    } catch (err) {
        next(err);
    }
}

async function deletePost(req, res, next) {
    try {
        const { id: postId } = req.params;
        const userId = req.user.id;

       const { authorId} = await new PrismaClient().post.findUnique({ where: {id: postId}});

        if(authorId !== userId) {
            throw ApiError.forbidden();
        }


        const transaction = await new PrismaClient().$transaction([
            new PrismaClient().comment.deleteMany({where: {id: postId}}),
            new PrismaClient().like.deleteMany({where: {id: postId}}),
            new PrismaClient().post.deleteMany({where: {id: postId}}),
        ])

        return res.json(transaction);



    } catch (err) {
        next(err);
    }
}

module.exports = { createPost, deletePost, getPosts, getPostById };
