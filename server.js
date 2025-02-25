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

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api", router);
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

const start = async () => {
    try {
        app.listen(PORT, () => console.log(`Server is run on ${PORT} port`));
    } catch (err) {
        console.error("Server not run because " + err);
    }
};

start();

module.exports = app;