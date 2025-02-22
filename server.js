const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const router = require("./routes/index");
require("dotenv").config();
const cors = require("cors");
const fs = require("fs");
const errorMiddleware = require('./middlewares/error-middleware');


const PORT = process.env.PORT || 3001;

const app = express();

const corsOptions = {
  origin: '*', // Разрешает запросы с любого источника
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: false,  // Если ты используешь cookies, иначе можно убрать
};

app.use(express.json());
app.use(cors(corsOptions));

// app.use((req, res, next) => {
//   console.log('Request URL:', req.url);
//   console.log('Request Headers:', req.headers);
//   console.log('request', req);
//   next();  // Передаём управление следующему миддлвейру
// });

// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const start = async () => {
    try {
        app.listen(PORT, () => console.log(`Server is run on ${PORT} port`));
    } catch (err) {
        console.error("Server not run because " + err);
    }
};

start();

module.exports = app;