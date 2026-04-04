const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const itemsSchema = new mongoose.Schema({
    guestPackage_id: {
        type: Number,
        unique: true
    },
    noOfGuest: {
        type: Number,
        min: 1
    },
    price: {
        type: Number,
        min: 1
    },
    status: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Number,
        ref: 'User',

    },
    updatedBy: {
        type: Number,
        ref: 'User',
        default: null
    },
}, {
    timestamps: true,
    versionKey: false
});

itemsSchema.plugin(AutoIncrement, { inc_field: 'guestPackage_id' });
module.exports = mongoose.model('guestPackage', itemsSchema);
