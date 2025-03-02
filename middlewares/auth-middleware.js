const ApiError = require('../exceptions/api-errors');
const tokenService = require('../service/token-service');

module.exports = function(req, res, next) {
    try {
        // получаем значение заголовка Authorization
        const authorizationHeader = req.headers['authorization'];

        // Проверяем его наличие
        if(!authorizationHeader) {
            return next(ApiError.UnauthorizedError());
        }

        // Разбиваем строку на две части пробелом, и извлекаем вторую часть строки. 
        const accessToken = authorizationHeader.split(" ")[1];

        // проверяем, точно ли есть accessToken
        if(!accessToken) {
            console.log('нет accessToken');
            return next(ApiError.UnauthorizedError());
        }

        // 
        const userDto = tokenService.validateAccessToken(accessToken);

        if(!userDto) {
            console.log('ошибка валидации');
            return next(ApiError.UnauthorizedError());
        }

        console.log('user, who makesss the request (userDTO) ', userDto);

        req.user = userDto;

        next();
    } catch (err) {
       next(ApiError.UnauthorizedError());
    }
}