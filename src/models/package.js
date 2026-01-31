const mongoose = require('mongoose');
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const mongoosePaginate = require('mongoose-paginate-v2');
const staticContent = mongoose.Schema({
    name: {
        type: String,
        enum: ["starter", "lite", "pro"]
    },
    nameDescription: {
        type: String,
    },
    price: {
        type: Number,
        default: 0
    },
    isFree: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
    },
    totalEmployee: {
        type: Number,
        default: 0
    },
    totalEvents: {
        type: Number,
        default: 0
    },
    duration: {
        type: String,
        enum: ["Month", "Annual"],
        default: "Month"
    },
}, { timestamps: true })
staticContent.plugin(mongoosePaginate);
staticContent.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('package', staticContent);