const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  mobile: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  agreePrivacyPolicy: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  country_id: {
    type: Number,
    ref: 'Country',
    default: 1
  },
  state_id: {
    type: Number,
    ref: 'State',
    default: 1
  },
  city_id: {
    type: Number,
    ref: 'City',
    default: 1
  },
  role_id: {
    type: Number,
    ref: 'Role',
    default: 1
  },
  Fixed_role_id: {
    type: Number,
    ref: 'Role',
    default: 1
  },
  online_status: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  user_img: {
    type: String,
    trim: true,

  },
  postal_code: {
    type: String,
    trim: true,
    maxlength: [10, 'Postal code cannot exceed 10 characters']
  },
  business_name: {
    type: String,
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters']
  },
  business_category_id: {
    type: Number,
    ref: 'BusinessCategory'
  },
  whatsapp_no: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit WhatsApp number']
  },
  business_type_id: {
    type: Number,
    ref: 'BusinessType'
  },
  business_website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
  },
  business_reg_no: {
    type: String,
    trim: true,
    maxlength: [50, 'Business registration number cannot exceed 50 characters']
  },
  business_description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Business description cannot exceed 1000 characters']
  },
  business_address: {
    type: String,
    trim: true,
    maxlength: [500, 'Business address cannot exceed 500 characters']
  },
  id_proof_owner_img: {
    type: String,
    trim: true,

  },
  PlatFormFee_status: {
    type: String,
    trim: true
  },
  PlatFormFee: {
    type: String,
    trim: true
  },
  trangaction_id: {
    type: Number,
    ref: 'Transaction'
  },
  licenses_certificate_file: {
    type: String,
    trim: true,

  },
  bank_account_holder_name: {
    type: String,
    trim: true,
    maxlength: [100, 'Bank account holder name cannot exceed 100 characters']
  },
  bank_name_id: {
    type: Number,
    ref: 'BankName'
  },
  bank_account_no: {
    type: String,
    trim: true,
    maxlength: [20, 'Bank account number cannot exceed 20 characters']
  },
  bank_branch_id: {
    type: Number,
    ref: 'BankBranchName'
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    ref: 'User',
    default: null
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: Number,
    ref: 'User',
    default: null
  },
  updated_on: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

userSchema.plugin(AutoIncrement, { inc_field: 'user_id' });

// Transform output to remove sensitive data
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
