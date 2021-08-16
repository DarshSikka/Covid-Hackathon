const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsLayouts = require("express-ejs-layouts");
require("dotenv").config();
const Message = require("./models/Message");
const cors = require("cors");
app.use(cors());
app.use(express.static(__dirname + "/build"));
app.use(express.static(__dirname + "/static"));
mongoose.connect(
  process.env.DB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, result) => {
    if (err) console.error(err);
    console.log("Connected to mongodb");
  }
);
const User = require("./models/User");
app.use(express.urlencoded({ extended: true }));
app.use(ejsLayouts);
const cookies = require("cookie-parser");
app.use(cookies());
app.set("view engine", "ejs");
const port = process.env.PORT || 3000;

app.get("/product", (req, res) => {
  res.render("product", { title: "Occupied in covid" });
});
app.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Signup to occupied in covid",
    errors: undefined,
  });
});
app.post("/signup", (req, res) => {
  const { username, password, confirm } = req.body;
  const errors = [];
  if (confirm != password) {
    errors.push("Passwords don't match");
  }
  if (password.length < 5) {
    errors.push("Password must be greater than 4 digits");
  }
  if (!password) {
    errors.push("Please enter password");
  }
  if (!username) {
    errors.push("Please enter username");
  }
  if (errors.length === 0) {
    const user = new User({ username, password });
    console.log(user);
    user.save((err) => {
      if (!err) {
        res.cookie("user", user._id, {
          httpOnly: true,
          maxAge: Date.now() + 2.628e6,
          secure: true,
        });
        res.render("signup", { title: "Signup to occupied in covid", errors });
      } else {
        errors.push("Username is taken");
        res.render("signup", { title: "Signup to occupied in covid", errors });
      }
    });
  } else {
    res.render("signup", { title: "Signup to occupied in covid", errors });
  }
});
app.get("/logout", async (req, res) => {
  res
    .cookie("user", "guest", {
      httpOnly: true,
      maxAge: Date.now() - 2.628e6,
      secure: true,
    })
    .redirect("/login");
});
app.get("/messages", async (req, res) => {
  const messages = await Message.find({});
  res.send(messages);
});
app.get("/", (req, res) => {
  res.render("home", { title: "Home page:- Occupied in covid" });
});
app.get("/chat", async (req, res) => {
  const usr = await User.findOne({ _id: req.cookies.user }).catch(e=>res.redirect("/login"));
  if (usr) {
    if (usr.username) {
      res.sendFile(__dirname + "/build/chat.html");
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/chat", (req, res) => {
  const { content } = req.body;
  User.findOne({ _id: req.cookies.user }, (err, user) => {
    if (err || !user) {
      res.redirect("/chat");
    } else {
      const msg = new Message({ content, author: user.username });
      msg.save();
      res.redirect("/chat");
    }
  });
});
app.get("/login", async (req, res) => {
  res.render("login", { title: "Login to game", get: true });
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const usr = await User.findOne({ username, password });
  if (usr) {
    res.cookie("user", usr._id, {
      httpOnly: true,
      maxAge: Date.now() + 2.628e6,
      secure: true,
    });
    res.render("Allset", {
      title: `${usr.username} rocking the house on game name`,
    });
  } else {
    res.render("login", {
      title: "Login to game",
      get: false,
      error: "Invalid credentials",
    });
  }
});
app.listen(port, () => console.log(`listening on port ${port}`));
