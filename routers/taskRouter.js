const express = require("express");
const { auth } = require("../middlewares/auth");
const TaskModel = require("../models/task");

const router = express.Router();

router.post("/tasks", auth, async (req, res) => {
  const newTask = new TaskModel({ ...req.body, owner: req.user._id });
  try {
    await newTask.save();
    res.json({ message: "task addes successfully" });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.get("/tasks", auth, async (req, res) => {
  try {
    const query = { owner: req.user._id };
    const sortParams = {};
    if (req.query.isDone)
      query.isDone = req.query.isDone === "true" ? true : false;

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sortParams[parts[0]] = parts[1];
    }

    const tasks = await TaskModel.find(query)
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip))
      .sort(sortParams);
    // if (tasks.length === 0)
    //   return res.status(404).json({ error: "no tasks found" });

    res.json({ tasks });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await TaskModel.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).json({ error: "task not found" });
    res.json({ task });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "isDone"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).json({ error: "invalid updates" });
  }
  try {
    const task = await TaskModel.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.json({ task });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await TaskModel.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }
    res.json({ task });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

module.exports = router;
