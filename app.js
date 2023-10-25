const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const httpStatus = require("http-status");
const compression = require("compression");
const path = require("path");
const multer = require("multer");
const app = express();

const upload = require("./src/config/multer.js");
const config = require("./src/config/config.js");
const routes = require("./src/routes"); // UnComment after adding Routes
const morgan = require("./src/config/morgan.js");

const ApiError = require("./src/utils/ApiError.js");
const { errorConverter, errorHandler } = require("./src/middlewares/error");
const { authLimiter } = require("./src/middlewares/rateLimiter.js");

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

const publicDirectoryPath =
  "/home/node/public_html/Tax-Group-Apis/public/uploads";
app.use("/uploads", express.static(publicDirectoryPath));

// set security HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3003",
  "http://localhost:3003/login",
  "http://localhost:3000/api/v1/",
  "http://node.thelearningexpressar.org:3000/api/v1/",
  "http://node.thelearningexpressar.org:3000/uploads/",
  "http://node.thelearningexpressar.org:3000/api/v1/login",
  "http://admin.thelearningexpressar.org",
  "http://admin.thelearningexpressar.org/login",
  "http://admin.thelearningexpressar.org/",
  "http://admin.thelearningexpressar.org/login/",
  "http://localhost:3000/api/v1/login",
  "http://localhost:3006",
  "http://localhost:3006/viewCourse",
  "http://localhost:3006/viewUser",
  "http://localhost:3006/viewUser/",
  "http://localhost:3000/api/v1",
  "http://localhost:3006/api/v1/login",
  "http://admin.thelearningexpressar.org/login",
  "http://localhost:3000/uploads",
  "http://localhost:3000/uploads/",
  "https://thelearningexpressar.org",
  "http://thelearningexpressar.org",
  "https://thelearningexpressar.org/",
  "http://thelearningexpressar.org/"
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
  })
);

// gzip compression
app.use(compression());

// const PUBLIC_DIR = path.resolve(__dirname, "./public");
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1", upload, routes);

app.get("/api/healthcheck", function (req, res) {
  let data = {
    response: "ok",
  };
  res.status(200).send(data);
});

app.get("/", function (req, res) {
  let data = {
    response: "ok",
  };
  res.status(200).send("HELLO WORLD");
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;

// limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
