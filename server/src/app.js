require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

const roomRoutes = require("./routes/roomRoutes");
const expenseRoutes = require("./routes/expenseRoutes");


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "split app working fine",
  });
});

app.use("/api/rooms", roomRoutes);
app.use("/api/expenses", expenseRoutes);

module.exports = app;
