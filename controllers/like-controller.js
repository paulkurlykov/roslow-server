const ApiError = require("../exceptions/api-errors");
const { PrismaClient } = require("@prisma/client");

async function likePost(req, res, next) {
    try {
        const { postId } = req.body;

        const userId = req.user.id;

        if (!postId) {
            ApiError.BadRequest("Все поля обязательны");
        }

        const existingLike = await new PrismaClient().like.findFirst({where: {postId, userId}});

        if(existingLike) {
            throw ApiError.BadRequest("Пост уже лайкнут пользователем");
        }


        const newLike = await new PrismaClient().like.create({
            data: {
                userId,
                postId
            },
        });

        return res.json({message: "you liked this post", likeId: newLike.id});
    } catch (err) {
        console.error("Ошибка при добавлении лайка");
        next(err);
    }
}

async function unlikePost(req, res, next) {
    try {
        const { id: postId } = req.params;
        const userId = req.user.id;

        if(!postId) {
            throw ApiError.BadRequest("postId не передан");
        }

        if(!userId) {
            throw ApiError.UnauthorizedError();
        }

        const like = await new PrismaClient().like.findFirst({where: {postId, userId}})

        const deletedLike = await new PrismaClient().like.delete({
            where: {id: like.id}
        })

        if(!deletedLike) {
            throw ApiError.BadRequest("Пост и так не лайкнут");
        }

        return res.json({message: "Убрали лайк с этого поста"});

    } catch (err) {
        next(err);
    }
}

module.exports = { likePost, unlikePost};