// // Task Controllers
// const Task = require("../models/Task");

// // CREATE TASK (Linked to logged-in user)
// exports.createTask = async (req, res) => {
//   try {
//     const { title, details } = req.body;

//     const newTask = new Task({
//       title,
//       details,
//       user: req.user.id, // attach user
//     });

//     await newTask.save();

//     res.status(201).json({
//       message: "Task added successfully!",
//       task: newTask,
//     });
//   } catch (error) {
//     res.status(500).send("Error adding task: " + error.message);
//   }
// };

// // GET ALL TASKS FOR LOGGED-IN USER ONLY
// exports.getTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({ user: req.user.id }); // filtering by user
//     res.json(tasks);
//     console.log("working")
//   } catch (error) {
//     res.status(500).send("Error fetching tasks: " + error.message);
//   }
// };

// // GET ONE TASK (must belong to logged-in user)
// exports.getTaskById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const task = await Task.findOne({ _id: id, user: req.user.id });

//     if (!task) return res.status(404).send("Task not found!");

//     res.json(task);
//   } catch (error) {
//     res.status(500).send("Error fetching task: " + error.message);
//   }
// };

// // UPDATE TASK (must belong to logged-in user)
// exports.updateTasks = async (req, res) => {
//   const { id } = req.params;
//   const updatedData = req.body;

//   try {
//     const task = await Task.findOne({ _id: id, user: req.user.id });

//     if (!task) return res.status(404).send("Task not found!");

//     Object.assign(task, updatedData);
//     await task.save();

//     res.status(200).json({
//       message: `Task with ID ${id} updated.`,
//       task,
//     });
//   } catch (error) {
//     res.status(500).send("Error updating task: " + error.message);
//   }
// };

// // DELETE TASK (must belong to logged-in user)
// exports.deleteTask = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const task = await Task.findOneAndDelete({
//       _id: id,
//       user: req.user.id,
//     });

//     if (!task) return res.status(404).send("Task not found!");

//     res.status(200).json({
//       message: `Task with ID ${id} deleted.`,
//       task,
//     });
//   } catch (error) {
//     res.status(500).send("Error deleting task: " + error.message);
//   }
// };