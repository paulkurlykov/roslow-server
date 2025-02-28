const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const mailService = require("../service/mail-service");
const tokenService = require("../service/token-service");
const createUserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-errors");
const { validationResult } = require("express-validator");
const { findToken } = require("../service/token-service");

async function registration(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(ApiError.BadRequest("Ошибка при валдиации", errors.array()));
        }

        const { email, password, name } = req.body;

        // Проверяем, все ли данные прилетели
        if (!email || !password || !name) {
            // res.status(400).json({ error: "Не указано обязательное поле" });
            throw ApiError.BadRequest(`Не все данные были получены для регистрации`);
        }

        // Создаем обьект prisma
        const prisma = new PrismaClient();
        const existingUser = await prisma.user.findUnique({ where: { email } });

        // Проверяем, есть ли пользователь
        if (existingUser) {
            throw ApiError.BadRequest(`Пользователь с таким email уже существует`);
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем ссылку для активации аккаунта (будет отправлена по почте)
        const activationLink = uuid.v4();

        // Добавление пользователя в БД
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                activationLink,
            },
        });

        // Отправка письма пользователю (импортируем функцию mailService, которую ранее сами создали)

        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/users/activation/${activationLink}`);

        // создаем токены
        const userDto = createUserDto(user); // просто функция, которая берет user, прячет некоторые свойства и возвращает обьект с усеченными свойствами. Для приватности. Функцию писали мы сами.
        const tokens = tokenService.generateTokens(userDto);
        await tokenService.saveToken(userDto.id, tokens.refreshToken); // функция, которая или сохраняет в БД первый или обновляет в БД существующий токен.

        // Установка refresh токена в куках пользователю
        res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: 15 * 60 * 1000,
            httpOnly: true,
        });

        // Отправка токенов и пользователя обратно на фронт
        res.json({ ...tokens, user: userDto });
    } catch (err) {
        next(err);
    }
}
async function login(req, res, next) {

    console.log('login controller is starting');

    try {
        // получаем и валидируем пару логин-пароль
        const { email, password } = req.body;

        if (!email || !password) {
            throw ApiError.BadRequest(`Вы не указали почту или ппароль для логина`);
        }

        // находим пользователя по email
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw ApiError.BadRequest(`Пользователь с таким email не был найден`);
        }

        console.log(user.isActivated);

        if(!user.isActivated) {
            console.log("isActivated? ", user.isActivated);
            throw ApiError.BadRequest("Активируйте пожлста вашу учетку (ссылка отправлена на почту)")
        }

        // проверяем уникальность пароля
        const isPassEqual = await bcrypt.compare(password, user.password);

        if (!isPassEqual) {
            throw ApiError.BadRequest(`Неверныыыыый пароль`);
        }

        // генерим токены, отправляем юзера и токены на клиент
        const userDto = createUserDto(user);
        const tokens = tokenService.generateTokens(userDto);
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: 15 * 60 * 1000,
            httpOnly: true,
        });
        res.json({ ...tokens, user: userDto });
    } catch (err) {
        next(err);
    }
}
async function getUserById(req, res, next) {
    try {
        const { id } = req.params;
        const { id: userId } = req.user;
        const user = await new PrismaClient().user.findUnique({
            where: { id },
            include: {
                followers: true,
                following: true,
            },
        });

        const isFollowing = await new PrismaClient().follows.findFirst({
            where: {
                AND: [{ followerId: userId }, { followingId: id }],
            },
        });

        return res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (err) {
        next(err);
    }
}

async function getUsers(req, res, next) {
    try {
        const prisma = new PrismaClient();

        const users = await prisma.user.findMany();

        return res.json(users);
    } catch (err) {
        next(err);
    }
}

async function updateUser(req, res, next) {
    console.log("updating...");
    try {
        // id - из параметров url
        const { id } = req.params;

        // берем весь присланный обьект
        const updatingUser = req.body;

        if (req.file) {
            updatingUser.avatarUrl = `/uploads/${req.file.filename}`;
            // console.log("Файл", req.file);
            // console.log("Путь к файлу", req.file.path);
        }

        // пользователь должен редактировать только свой профиль. В url должен быть его id, а в req.user.id - id из токена. Если они не совпадают, значит ошибка доступа.
        if (id !== req.user.id) {
            return ApiError.forbidden();
        }

        // если пользователь хочет изменить почту (такое свойство есть в присланном обьекте), надо проверить, не занята ли новая почта
        if (updatingUser.email) {
            const existingUser = await new PrismaClient().user.findFirst({
                where: { email: updatingUser.email },
            });

            // если пользватель с такой почтой существует, и это другой юзер, то ошибка
            if (existingUser && existingUser.id !== id) {
                ApiError.BadRequest(403, "Такая почта уже используется");
            }
        }

        // Если все ок, то обновляем пользователя
        const updatedUser = await new PrismaClient().user.update({
            where: { id },
            data: updatingUser,
        });

        // отправялем клиенту обнолвенного пользователя
        res.json(updatedUser);
    } catch (err) {
        next(err);
    }
}
async function currentUser(req, res) {
    try {
        const user = await new PrismaClient().user.findUnique({
            where: {
                id: req.user.id,
            },
            include: {
                followers: {
                    include: {
                        follower: true,
                    },
                },
                following: {
                    include: {
                        following: true,
                    },
                },
            },
        });

        if (!user) {
            ApiError.BadRequest(400, "Не удалось найти пользователя");
        }

        return res.json(user);
    } catch (err) {
        console.error("Exception " + err);
    }
}
async function logout(req, res, next) {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) throw ApiError.UnauthorizedError();
        const token = await tokenService.removeToken(refreshToken);

        res.clearCookie("refreshToken");
        return res.json(token);
    } catch (err) {
        next(err);
    }
}

async function refresh(req, res, next) {
    try {
        // получаем токен из кук
        const { refreshToken } = req.cookies;

        // проверяем токен на наличие
        if (!refreshToken) {
            console.log("нет рефреш токена");
            throw ApiError.UnauthorizedError();
        }
        // валидация токена на правильность подписи и на просроченность
        const validToken = tokenService.validateRefreshToken(refreshToken);
        // поиск токена в БД
        const tokenFromDb = await tokenService.findToken(refreshToken);

        // если токен не валдиен и/или его нет в БД, значит пользователь не авторизован
        if (!validToken || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        // находим обьект user по его id
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({ where: { id: validToken.id } });

        // генерируем новые токены, сохраняем их в бд
        const userDto = createUserDto(user);
        const tokens = tokenService.generateTokens(userDto);
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        // устанавливаем обнолвенные токены в куки
        res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: 15 * 60 * 1000,
            httpOnly: true,
        });
        // отправляем чего-нибудь в качестве ответа
        return res.json(validToken);
    } catch (err) {
        next(err);
    }
}

async function activation(req, res, next) {
    try {
        const activationLink = req.params.link;
        console.log(activationLink);
        const prisma = new PrismaClient();
        const user = await prisma.user.findFirst({ where: { activationLink } });

        // Если мы не нашли пользователя с такой ссылкой, значит ссылка ошибочна (так как корректная обязательно должна быть, она создавалась при регистрации)
        if (!user) {
            throw new Error("Некорректная ссылка активации");
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { isActivated: true },
        });

        return res.redirect(process.env.CLIENT_URL);

        // return res.json({message: "ALL IS SUCCESS"})
    } catch (err) {

        next(err);
    }
}

// module.exports = new UserController();

async function login(req, res, next) {
    try {
        // получаем и валидируем пару логин-пароль
        const { email, password } = req.body;

        if (!email || !password) {
            throw ApiError.BadRequest(`Вы не указали почту или ппароль для логина`);
        }

        // находим пользователя по email
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw ApiError.BadRequest(`Пользователь с таким email не был найден`);
        }

        // проверяем уникальность пароля
        const isPassEqual = await bcrypt.compare(password, user.password);

        if (!isPassEqual) {
            throw ApiError.BadRequest(`Неверный пароль`);
        }

        // генерим токены, отправляем юзера и токены на клиент
        const userDto = createUserDto(user);
        const tokens = tokenService.generateTokens(userDto);
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: 15 * 60 * 1000,
            httpOnly: true,
        });
        res.json({ ...tokens, user: userDto });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    login,
    logout,
    registration,
    activation,
    refresh,
    currentUser,
    updateUser,
    getUsers,
    getUserById,
};
