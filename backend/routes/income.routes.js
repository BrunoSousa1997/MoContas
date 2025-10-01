const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/income.controller.js');
//Geral
router.route('/')
    .post(incomeController.newIncome)
router.route('/:id')
    .get(incomeController.getIncomes)
    .delete(incomeController.deleteIncome)
module.exports = router;