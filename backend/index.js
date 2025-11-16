const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

const Income = require("./models/income.model.js");
const Expense = require("./models/expense.model.js");

// interligar com as rotas colaboradores
const incomeRoutes = require('./routes/income.routes.js');
app.use('/Income', incomeRoutes)
// interligar com as rotas colaboradores
const expenseRoutes = require('./routes/expense.routes.js');
app.use('/Expense', expenseRoutes)
// interligar com as rotas colaboradores
const userRoutes = require('./routes/user.routes.js');
app.use('/User', userRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
