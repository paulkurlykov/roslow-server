const ApiError = require("../exceptions/api-errors");
const { PrismaClient } = require("@prisma/client");

async function followUser(req, res, next) {
    try {
        const { followingId } = req.body;

        const userId = req.user.id;

        if (!followingId) {
            throw ApiError.BadRequest("Все поля обязательны");
        }

        if (!userId) {
            throw ApiError.InternalServerError("userId не передан из миддлвейра");
        }

        if (followingId === userId) {
            throw ApiError.BadRequest("Пользователь не млжет подписаться на себя");
        }

        const existingFollower = await new PrismaClient().follows.findFirst({
            where: {
                AND: [
                    {followerId: userId},
                    { followingId },
                ],
            },
        });

        if (existingFollower) {
            throw ApiError.BadRequest("Подписка уже существует");
        }

        const subscription = await new PrismaClient().follows.create({

            data: {
                follower: { connect: { id: userId } },
                following: { connect: { id: followingId } },
            },
        });

        return res.status(201).json({ message: "Подписка успешно создана", subscription });
    } catch (err) {
        console.error("Ошибка при совершении подписки");
        next(err);
    }
}

async function unfollowUser(req, res, next) {
    try {
        const { id: followingId } = req.params;
        const userId = req.user.id;

        if (!followingId) {
            throw ApiError.BadRequest("Нет данных о following");
        }

        if (!userId) {
            throw ApiError.UnauthorizedError();
        }

        const existingFollowing = await new PrismaClient().follows.findFirst({where: {
            AND: [
                {followerId: userId},
                {followingId}
            ]
        }})
        
        if (!existingFollowing) {
            throw ApiError.BadRequest("Ты не подписан на этого пользователя");
        }
        await new PrismaClient().follows.delete({
            where: { id: existingFollowing.id },
        });


        return res.json({ message: "Подписка отменена" });
    } catch (err) {
        next(err);
    }
}

module.exports = { followUser, unfollowUser };
