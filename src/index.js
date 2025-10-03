const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./routes/User/user.routes.js');
const walletRoutes = require('./routes/User/wallet.routes.js');
const eventTypeRoutes = require('./routes/Admin/event_type.routes.js');
const roleRoutes = require('./routes/Admin/role.routes.js');
const eventCategoryTagsRoutes = require('./routes/Admin/event_category_tags.routes.js');
const countryRoutes = require('./routes/Admin/country.routes.js');
const stateRoutes = require('./routes/Admin/state.routes.js');
const cityRoutes = require('./routes/Admin/city.routes.js');
const eventRoutes = require('./routes/User/event.routes.js');

// Import Admin route modules
const otpTypeRoutes = require('./routes/Admin/otp_type.routes.js');
const otpRoutes = require('./routes/Admin/otp.routes.js');
const vendorServiceTypeRoutes = require('./routes/Admin/vendor_service_type.routes.js');
const vendorMapServiceTypeRoutes = require('./routes/Admin/vendor_map_service_type.routes.js');
const serviceItemsRoutes = require('./routes/Admin/service_items.routes.js');
const statusRoutes = require('./routes/Admin/status.routes.js');
const eventAmenitiesRoutes = require('./routes/Admin/event_amenities.routes.js');
const paymentMethodsRoutes = require('./routes/Admin/payment_methods.routes.js');
const businessTypeRoutes = require('./routes/Admin/business_type.routes.js');
const businessCategoryRoutes = require('./routes/Admin/business_category.routes.js');
const bankNameRoutes = require('./routes/Admin/bank_name.routes.js');
const bankBranchNameRoutes = require('./routes/Admin/bank_branch_name.routes.js');
const notificationTypeRoutes = require('./routes/Admin/notification_type.routes.js');
const notificationRoutes = require('./routes/Admin/notification.routes.js');
const couponCodeRoutes = require('./routes/Admin/coupon_code.routes.js');
const compaignTypeRoutes = require('./routes/Admin/compaign_type.routes.js');

// Import Master route modules
const transactionRoutes = require('./routes/Master/transaction.routes.js');
const messagesRoutes = require('./routes/Master/messages.routes.js');
const ticketTypeRoutes = require('./routes/Master/ticket_type.routes.js');
const ticketRoutes = require('./routes/Master/ticket.routes.js');
const ticketReplysRoutes = require('./routes/Master/ticket_replys.routes.js');
const designCommunityRoutes = require('./routes/Master/design_community.routes.js');
const drinksRoutes = require('./routes/Master/drinks.routes.js');
const foodRoutes = require('./routes/Master/food.routes.js');
const entertainmentRoutes = require('./routes/Master/entertainment.routes.js');
const decorationsRoutes = require('./routes/Master/decorations.routes.js');
const eventGalleryRoutes = require('./routes/Master/event_gallery.routes.js');
const eventThemeRoutes = require('./routes/Master/event_theme.routes.js');
const dressCodeRoutes = require('./routes/Master/dress_code.routes.js');
const shareEventRoutes = require('./routes/Master/share_event.routes.js');
const marketplaceServiceChargesRoutes = require('./routes/Master/marketplace_service_charges.routes.js');
const categoryRoutes = require('./routes/Master/category.routes.js');
const marketplaceBookingRoutes = require('./routes/Master/marketplace_booking.routes.js');
const vibeFundCampaignRoutes = require('./routes/Master/vibe_fund_campaign.routes.js');
const vibeFundingCampaignRoutes = require('./routes/Master/vibe_funding_campaign.routes.js');

// Import Vendor route modules
const vendorBusinessInformationRoutes = require('./routes/Vendor/vendor_business_information.routes.js');

// Import middleware
const { sendSuccess } = require('../utils/response.js');

/**
 * @route   GET /api
 * @desc    API health check
 * @access  Public
 */
router.get('/', (req, res) => {
  sendSuccess(res, {
    message: 'Welcome to Node.js API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  }, 'API is running successfully');
});

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  sendSuccess(res, {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'development'
  }, 'Health check passed');
});

// Mount route modules
router.use('/users', userRoutes);
router.use('/wallets', walletRoutes);
router.use('/event-types', eventTypeRoutes);
router.use('/roles', roleRoutes);
router.use('/event-category-tags', eventCategoryTagsRoutes);
router.use('/countries', countryRoutes);
router.use('/states', stateRoutes);
router.use('/cities', cityRoutes);
router.use('/events', eventRoutes);

// Mount Admin route modules
router.use('/admin/otp-types', otpTypeRoutes);
router.use('/admin/otps', otpRoutes);
router.use('/admin/vendor-service-types', vendorServiceTypeRoutes);
router.use('/admin/vendor-map-service-types', vendorMapServiceTypeRoutes);
router.use('/admin/service-items', serviceItemsRoutes);
router.use('/admin/status', statusRoutes);
router.use('/admin/event-amenities', eventAmenitiesRoutes);
router.use('/admin/payment-methods', paymentMethodsRoutes);
router.use('/admin/business-types', businessTypeRoutes);
router.use('/admin/business-categories', businessCategoryRoutes);
router.use('/admin/bank-names', bankNameRoutes);
router.use('/admin/bank-branch-names', bankBranchNameRoutes);
router.use('/admin/notification-types', notificationTypeRoutes);
router.use('/admin/notifications', notificationRoutes);
router.use('/admin/coupon-codes', couponCodeRoutes);
router.use('/admin/compaign-types', compaignTypeRoutes);

// Mount Master route modules
router.use('/master/transactions', transactionRoutes);
router.use('/master/messages', messagesRoutes);
router.use('/master/ticket-types', ticketTypeRoutes);
router.use('/master/tickets', ticketRoutes);
router.use('/master/ticket-replys', ticketReplysRoutes);
router.use('/master/design-communities', designCommunityRoutes);
router.use('/master/drinks', drinksRoutes);
router.use('/master/food', foodRoutes);
router.use('/master/entertainment', entertainmentRoutes);
router.use('/master/decorations', decorationsRoutes);
router.use('/master/event-gallery', eventGalleryRoutes);
router.use('/master/event-theme', eventThemeRoutes);
router.use('/master/dress-code', dressCodeRoutes);
router.use('/master/share-event', shareEventRoutes);
router.use('/master/marketplace-service-charges', marketplaceServiceChargesRoutes);
router.use('/master/category', categoryRoutes);
router.use('/master/marketplace-booking', marketplaceBookingRoutes);
router.use('/master/vibe-fund-campaign', vibeFundCampaignRoutes);
router.use('/master/vibe-funding-campaign', vibeFundingCampaignRoutes);

// Mount Vendor route modules
router.use('/vendor/business-information', vendorBusinessInformationRoutes);

module.exports = router;
