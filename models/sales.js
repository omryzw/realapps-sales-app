const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    productName: String,
    amount: Number,
    user: String,
}, {
    timestamps: true
});

module.exports = mongoose.model("Sales", Schema);




