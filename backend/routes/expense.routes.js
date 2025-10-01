const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller.js');

//Geral
router.route('/')
    .post(expenseController.newExpense)
router.route('/:id')
    .get(expenseController.getExpenses)
    .delete(expenseController.deleteExpense)

module.exports = router;