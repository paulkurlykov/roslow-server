module.exports = class ApiError extends Error {
    status;
    errors;

    constructor(status, message, errors) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError() {
        return new ApiError(401, 'Пользователь не авторизован')
    }

    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }

    static forbidden() {
        return new ApiError(403, "Доступ запрещен");
    }

    static InternalServerError(message = "Internal Server Error") {
        return new ApiError(500, message);
    }
}