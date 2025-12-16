const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorBusinessInformationSchema = new mongoose.Schema({
  business_information_id: {
    type: Number,
    unique: true
  },
  vendor_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  business_name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters']
  },
  Basic_information_LegalName: {
    type: String,
    trim: true
  },
  business_email: {
    type: String,
    required: [true, 'Business email is required'],
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  Basic_information_Business_Description: {
    type: String,
    trim: true
  },
  business_phone: {
    type: String,
    required: [true, 'Business phone is required'],
    trim: true
  },
  Basic_information_BusinessAddress: {
    type: String,
    trim: true
  },
  Basic_information_City_id: {
    type: Number,
    ref: 'City'
  },
  Basic_information_State_id: {
    type: Number,
    ref: 'State'
  },
  Basic_information_ZipCode: {
    type: String,
    trim: true
  },
  Basic_information_Country_id: {
    type: Number,
    ref: 'Country'
  },
  business_website_url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
  },
  business_socialmedia_url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
  },
  business_logo_url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
  },
  // Document Section
  Document_Business_Regis_Certificate: {
    type: String,
    trim: true
  },
  Document_GSTTaxCertificate: {
    type: String,
    trim: true
  },
  Document_Pan: {
    type: String,
    trim: true
  },
  Document_bankbook: {
    type: String,
    trim: true
  },
  Document_IDproofOwner: {
    type: String,
    trim: true
  },
  Document_TradeLicense: {
    type: String,
    trim: true
  },
  // KYC Section
  KYC_fullname: {
    type: String,
    trim: true
  },
  KYC_DoB: {
    type: Date
  },
  KYC_GovtIdtype: {
    type: String,
    trim: true
  },
  KYC_Idno: {
    type: String,
    trim: true
  },
  KYC_Business_PanCard: {
    type: String,
    trim: true
  },
  KYC_GSTNo: {
    type: String,
    trim: true
  },
  KYC_UploadIdDocument: {
    type: String,
    trim: true
  },
  KYC_photo: {
    type: String,
    trim: true
  },
  vendor_categories: [{
    type: Number,
    ref: 'VendorServiceType'
  }],
  service_location: {
    type: String,
    trim: true,
    maxlength: [500, 'Service location cannot exceed 500 characters']
  },
  // Service Areas Section
  service_areas_locaiton: {
    type: String,
    trim: true
  },
  service_areas_Regions: {
    type: String,
    trim: true
  },
  service_areas_pincode: {
    type: String,
    trim: true
  },
  service_areas_workingHoures: {
    type: String,
    trim: true
  },
  service_radius: {
    type: Number,
    min: [0, 'Service radius must be a positive number']
  },
  willing_to_travel: {
    type: Boolean,
    default: true
  },
  service_days: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  pricing_booking_minimum_fee: {
    type: Number,
    min: [0, 'Minimum fee must be a positive number']
  },
  price_range_min: {
    type: Number,
    min: [0, 'Minimum price must be a positive number']
  },
  price_range_max: {
    type: Number,
    min: [0, 'Maximum price must be a positive number']
  },
  deposit_required_for_bookings: {
    type: Boolean,
    default: true
  },
  payment_methods: [{
    type: Number,
    ref: 'PaymentMethods'
  }],
  link_to_reviews: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
  },
  promo_video_url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
  },
  client_testimonials: {
    type: String,
    trim: true,
    maxlength: [2000, 'Client testimonials cannot exceed 2000 characters']
  },
  calendar_integration: {
    type: String,
    trim: true,
    maxlength: [500, 'Calendar integration cannot exceed 500 characters']
  },
  business_license_url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
  },
  term_verification: [{
    term: {
      type: String,
      required: true
    },
    status: {
      type: Boolean,
      default: false
    }
  }],
  approval_by_admin: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: Number,
    ref: 'User',
    default: null
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

vendorBusinessInformationSchema.plugin(AutoIncrement, { inc_field: 'business_information_id' });

module.exports = mongoose.model('VendorBusinessInformation', vendorBusinessInformationSchema);
