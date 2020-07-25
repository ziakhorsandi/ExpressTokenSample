const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const config = {
  secret: "some-secret-shit-goes-here",
  refreshTokenSecret: "some-secret-refresh-token-shit",
  port: 5000,
  tokenLife: 3,
  refreshTokenLife: 5,
};

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

const user = { id: 1, name: "zia", email: "zia@gmail.com" };

app.get("/api", (req, res) => {
  res.json({
    message: "Welcome",
  });
});
app.post("/api/posts", verifyToken, (req, res) => {
  // console.log("req.token", req.token);
  jwt.verify(req.token, config.secret, (err, authData) => {
    if (err) {
      // console.log("err", err);
      res.sendStatus(401);
    } else {
      res.json({
        message: "Post Created...",
        authData,
      });
    }
  });
});

app.get("/api/login", (req, res) => {
  const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife });
  const refreshToken = jwt.sign(user, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenLife,
  });
  const response = {
    status: "Logged in",
    token: token,
    refreshToken: refreshToken,
  };
  res.status(200).json(response);
});

app.post("/api/token/refresh", (req, res) => {
  console.log("req.body", req.body);
  jwt.verify(req.body.refresh, config.refreshTokenSecret, (err, authData) => {
    if (err) {
      console.log("refreshtoken expired");
      console.log("err", err);
      res.sendStatus(401);
    } else {
      console.log("authData", authData);
      console.log("creating token");
      // res.json({
      //   message: "Refresh Token validate...",
      //   authData,
      // });
      const token = jwt.sign(user, config.secret, {
        expiresIn: config.tokenLife,
      });
      const refreshToken = jwt.sign(user, config.refreshTokenSecret, {
        expiresIn: config.refreshTokenLife,
      });
      const response = {
        status: "Token Refreshed",
        token: token,
        refreshToken: refreshToken,
      };
      res.status(200).json(response);
    }
  });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
    // res.sendStatus(401);
  }
}

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
