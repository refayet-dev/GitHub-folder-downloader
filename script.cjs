require("dotenv").config();
const axios = require("axios");
const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(__dirname + "/static"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/index.html"));
});

app.get("/auth", (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`
  );
});

app.get("/oauth-callback", ({ query: { code } }, res) => {
  const body = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_SECRET,
    code,
  };
  const opts = { headers: { accept: "application/json" } };
  axios
    .post("https://github.com/login/oauth/access_token", body, opts)
    .then((_res) => _res.data.access_token)
    .then((token) => {
      res.redirect(`/?token=${token}`);
    })
    .catch((err) => res.status(500).json({ err: err.message }));
});

const port = 5000 || process.env.PORT;
app.listen(port);
