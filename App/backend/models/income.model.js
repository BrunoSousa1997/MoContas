const mongoose = require("mongoose");
const { Schema, model  } = mongoose;

const incomeSchema = new Schema({
    category: String,
    description: String,
    value: Number,
    month: String,
    installments: Number,
    year: String,
    user: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
}, { timestamps: true }); // adds createdAt and updatedAt

const Income = model("Income", incomeSchema);


module.exports = Income;