const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
exports.auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findOne({
      _id: decoded.id,
      "tokens.token": token,
    });
    if (!user) throw new Error();

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "please authenticate" });
  }
};
