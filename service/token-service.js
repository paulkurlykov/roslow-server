const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client')

class TokenService {

    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '24h'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: "30d"});

        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {

        const prisma = new PrismaClient();
        // console.log(`userId: ${userId}`);
        const tokenData = await prisma.token.findUnique({ where: { id: userId } });

        if(tokenData) {
            tokenData.refreshToken = refreshToken;
        }
        
        const token = await prisma.token.create({
            data: {
                userId,
                refreshToken
            },
        });

        return token;
    }

    async removeToken(refreshToken) {
        const prisma = new PrismaClient();
        const token = await prisma.token.findFirst({ where: { refreshToken } });
        const tokenData = await prisma.token.delete({where: {id: token.id}});
        console.log(tokenData);
        return tokenData;
    }

    validateAccessToken(token) {
        // валидация токена на правильность подписи и на просроченность
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            // возвращает тот payload (обьект dto), который был передан для создания токена
            return userData;
        } catch (err) {
            return null;
        }
    }

    validateRefreshToken(token) {
        // валидация токена на правильность подписи и на просроченность
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

            // возвращает тот payload (обьект dto), который был передан для создания токена
            return userData;
        } catch (err) {
            return null;
        }
    }

    async findToken(token) {
        const prisma = new PrismaClient();
        return await prisma.token.findFirst({ where: { refreshToken: token } });
    }

    async findUserByToken(token) {
        const prisma = new PrismaClient();

        const tokenRecord = await prisma.token.findFirst({ where: { refreshToken: token } });
        const user = await prisma.user.findFirst({where: {id: tokenRecord.userId}});
        return user;
  
    }
}

module.exports = new TokenService();