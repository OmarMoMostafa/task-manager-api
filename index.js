const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./db");
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");

const app = express();
app.use(express.json());
app.use(cors());
app.use(userRouter);
app.use(taskRouter);
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log("app is running on port " + port);
});
