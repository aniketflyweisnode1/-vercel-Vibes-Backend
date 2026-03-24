const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const templateSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    updatedBy: {
        type: Number,
        ref: 'User',
    },
    template_id: {
        type: Number,
        unique: true
    },
    premium: {
        type: Boolean,
        default: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    image: {
        type: String,
    },
    webUrl: {
        type: String,
    },
}, { timestamps: true });
templateSchema.plugin(AutoIncrement, { inc_field: 'template_id' });
module.exports = mongoose.model('template', templateSchema);
