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
   // match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email']
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
  zip_code: {
    type: String,
    trim: true,
    maxlength: [10, 'Zip code cannot exceed 10 characters']
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
  Authorized_Person_Name: {
    type: String,
    trim: true,
    maxlength: [100, 'Authorized person name cannot exceed 100 characters']
  },
  DOB: {
    type: Date
  },
  Govt_id_type: {
    type: String,
    trim: true,
    enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'Other']
  },
  ID_Number: {
    type: String,
    trim: true,
    maxlength: [50, 'ID number cannot exceed 50 characters']
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

// Method to create staff working price for this user
userSchema.methods.createStaff = async function (staffCategoryId, price, reviewCount = 0, createdBy) {
  try {
    const StaffWorkingPrice = require('./staff_working_price.model');
    
    const staffData = {
      staff_id: this.user_id,
      staff_category_id: staffCategoryId,
      price: price,
      review_count: reviewCount,
      status: true,
      created_by: createdBy || this.user_id
    };

    const staff = await StaffWorkingPrice.create(staffData);
    return staff;
  } catch (error) {
    throw new Error(`Failed to create staff record: ${error.message}`);
  }
};

// Static method to create staff for any user by user_id
userSchema.statics.createStaffForUser = async function (userId, staffCategoryId, price, reviewCount = 0, createdBy) {
  try {
    const StaffWorkingPrice = require('./staff_working_price.model');
    
    // Verify user exists
    const user = await this.findOne({ user_id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const staffData = {
      staff_id: userId,
      staff_category_id: staffCategoryId,
      price: price,
      review_count: reviewCount,
      status: true,
      created_by: createdBy || userId
    };

    const staff = await StaffWorkingPrice.create(staffData);
    return staff;
  } catch (error) {
    throw new Error(`Failed to create staff record for user: ${error.message}`);
  }
};

// Method to get staff information for this user
userSchema.methods.getStaffInfo = async function () {
  try {
    const StaffWorkingPrice = require('./staff_working_price.model');
    const StaffCategory = require('./staff_category.model');
    
    const staffRecords = await StaffWorkingPrice.find({ 
      staff_id: this.user_id, 
      status: true 
    }).sort({ created_at: -1 });

    // Populate staff category information for each record
    const populatedStaffRecords = await Promise.all(
      staffRecords.map(async (staff) => {
        const category = await StaffCategory.findOne({ 
          staff_category_id: staff.staff_category_id 
        });
        
        return {
          ...staff.toObject(),
          staff_category_info: category ? {
            staff_category_id: category.staff_category_id,
            name: category.name,
            status: category.status
          } : null
        };
      })
    );

    return populatedStaffRecords;
  } catch (error) {
    throw new Error(`Failed to get staff information: ${error.message}`);
  }
};

// Method to check if user is staff
userSchema.methods.isStaff = async function () {
  try {
    const StaffWorkingPrice = require('./staff_working_price.model');
    
    const staffCount = await StaffWorkingPrice.countDocuments({ 
      staff_id: this.user_id, 
      status: true 
    });
    
    return staffCount > 0;
  } catch (error) {
    throw new Error(`Failed to check staff status: ${error.message}`);
  }
};

// Method to get staff statistics for this user
userSchema.methods.getStaffStatistics = async function () {
  try {
    const StaffWorkingPrice = require('./staff_working_price.model');
    
    const staffRecords = await StaffWorkingPrice.find({ 
      staff_id: this.user_id, 
      status: true 
    });

    if (staffRecords.length === 0) {
      return {
        is_staff: false,
        total_categories: 0,
        average_price: 0,
        price_range: { min: 0, max: 0 },
        total_reviews: 0
      };
    }

    const prices = staffRecords.map(record => record.price);
    const totalReviews = staffRecords.reduce((sum, record) => sum + record.review_count, 0);
    
    return {
      is_staff: true,
      total_categories: staffRecords.length,
      average_price: Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100) / 100,
      price_range: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      total_reviews: totalReviews,
      staff_records: staffRecords.length
    };
  } catch (error) {
    throw new Error(`Failed to get staff statistics: ${error.message}`);
  }
};

module.exports = mongoose.model('User', userSchema);
