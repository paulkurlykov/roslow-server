const ApiError = require("../exceptions/api-errors");
const { PrismaClient } = require("@prisma/client");

async function createComment(req, res, next) {
    try {
        const { postId, content } = req.body;

        const userId = req.user.id;

        if (!content || !postId) {
            ApiError.BadRequest("Все поля обязательны");
        }

        const newComment = await new PrismaClient().comment.create({
            data: {
                content,
                userId,
                postId
            },
        });

        return res.json(newComment);
    } catch (err) {
        console.error("Ошибка при добавлении коммента");
        next(err);
    }
}

async function deleteComment(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (id !== userId) {
            throw ApiError.forbidden();
        }

        const deletedComment = await new PrismaClient().comment.delete({
            where: {id}
        })

        if(!deletedComment) {
            throw ApiError.BadRequest("Комментарий не найден");
        }

        return res.json(deletedComment);

    } catch (err) {
        next(err);
    }
}

module.exports = { createComment, deleteComment};

