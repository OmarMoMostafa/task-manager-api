const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const sharp = require("sharp");

const { auth } = require("../middlewares/auth");
const UserModel = require("../models/user");
const TaskModel = require("../models/task");
const { sendError } = require("../utils/helper");
const { createStorage, fileFilter, multerUpload } = require("../utils/multer");

const router = express.Router();

router.post("/users", async (req, res) => {
  const oldUser = await UserModel.findOne({ email: req.body.email });
  if (oldUser) {
    return sendError(res, "there is a user with the same email");
  }
  const newUser = new UserModel(req.body);
  const token = jwt.sign(
    { id: newUser._id.toString() },
    process.env.JWT_SECRET
  );

  newUser.tokens = newUser.tokens.concat({ token });
  try {
    await newUser.save();
    res.json({
      user: { _id: newUser._id, name: newUser.name, email: newUser.email },
      token,
    });
  } catch (error) {
    sendError(res, error.message);
  }
});

router.get("/users/me", auth, async (req, res) => {
  try {
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    };
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.json({ message: "you have logged out" });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.json({ message: "you have logged out form all devices" });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return sendError(res, "invalid updates");
  }
  try {
    const user = await UserModel.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return sendError(res, "user not found", 404);
    }
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.delete("/users/me", auth, async (req, res) => {
  const user = req.user;
  try {
    await UserModel.deleteOne({ _id: req.user._id });
    await TaskModel.deleteMany({ owner: req.user._id });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(401).json({ error: "error" });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return sendError(res, "email or password missmatch");
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, "email or password missmatch");

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token: token,
    });
  } catch (error) {
    res.json({ error: "request refused" });
  }
});

const storage = createStorage();

// Set up Multer upload object with storage and file filter
const upload = multerUpload(storage);

router.post(
  "/users/me/avatars",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) {
      return sendError(res, "no file uploaded");
    }

    const file = req.file;
    const imgBuffer = fs.readFileSync(file.path);
    const imgEdited = await sharp(imgBuffer)
      .resize({ height: 250, width: 250 })
      .toFormat("png")
      .toBuffer();
    req.user.avatar = imgEdited;
    await req.user.save();

    res.json({ message: `File uploaded: ${file.originalname}` });
  },
  (error, req, res, next) => {
    sendError(res, error.message);
  }
);

router.delete("/users/me/avatars", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.json({ message: "image deleted" });
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) throw new Error();
    if (!user.avatar) {
      return res.send();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    sendError(res, "user not found", 404);
  }
});

module.exports = router;
