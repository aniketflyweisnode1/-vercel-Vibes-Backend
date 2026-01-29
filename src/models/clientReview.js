const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const testimonialSchema = new Schema({
        user: {
                type: Schema.Types.ObjectId,
                ref: "User"
        },
        userName: {
                type: String,
        },
        image: {
                type: String,
        },
        title: {
                type: String
        },
        description: {
                type: String
        },
        location: {
                type: String
        },
        rating: {
                type: Number,
                default: 0
        },
        through: {
                type: String,
                enum: ["Admin", "User"],
                default: "User"
        },
        isShowOnWebsite: {
                type: Boolean,
                default: false
        }
}, { timestamps: true });
module.exports = mongoose.model("clientReview", testimonialSchema);