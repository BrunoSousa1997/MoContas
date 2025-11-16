const Income = require("../models/income.model");
const mongoose = require("mongoose");

module.exports = {
    //Ver todos os Módulos
    getIncomes: async (req, res) => {
        const { month, year } = req.query;
        const incomes = await Income.find({ user: req.params.id, month, year });
        res.json(incomes);
    },
    newIncome: async (req, res) => {
        const income = new Income(req.body);
        await income.save();
        res.json(income);
    },
    deleteIncome: async (req, res) => {
        const { id } = req.params;
        console.log(id)
        const incomes = await Income.findByIdAndDelete(id);
        res.json(incomes);
    },
};