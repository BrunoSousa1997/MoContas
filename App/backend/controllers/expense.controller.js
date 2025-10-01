const Expense = require("../models/expense.model");
const mongoose = require("mongoose");

module.exports = {
    //Ver todos os Módulos
    getExpenses: async (req, res) => {
        const { month, year } = req.query;
        const expenses = await Expense.find({ user: req.params.id, month, year });
        res.json(expenses);
    },
    newExpense: async (req, res) => {
        const expense = new Expense(req.body);
        await expense.save();
        res.json(expense);
    },
    deleteExpense: async (req, res) => {
        const { id } = req.params;
        const expense = await Expense.findByIdAndDelete(id);
        res.json(expense);
    },



};