const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./routes/User/user.routes.js');
const walletRoutes = require('./routes/User/wallet.routes.js');
const fileUploadRoutes = require('./routes/User/file_upload.routes.js');
const eventTypeRoutes = require('./routes/Admin/event_type.routes.js');
const roleRoutes = require('./routes/Admin/role.routes.js');
const eventCategoryTagsRoutes = require('./routes/Admin/event_category_tags.routes.js');
const countryRoutes = require('./routes/Admin/country.routes.js');
const stateRoutes = require('./routes/Admin/state.routes.js');
const cityRoutes = require('./routes/Admin/city.routes.js');
const eventRoutes = require('./routes/User/event.routes.js');

// Import Admin route modules
const adminRoutes = require('./routes/Admin/admin.routes.js');
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
const categoriesFeesRoutes = require('./routes/Admin/categories_fees.routes.js');

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
const eventTasksRoutes = require('./routes/Master/event_tasks.routes.js');
const eventDiscussionChatRoutes = require('./routes/Master/event_discussion_chat.routes.js');
const itemCategoryRoutes = require('./routes/Master/item_category.routes.js');
const itemsRoutes = require('./routes/Master/items.routes.js');
const budgetItemsRoutes = require('./routes/Master/budget_items.routes.js');
const venueDetailsRoutes = require('./routes/Master/venue_details.routes.js');
const eventSetupRequirementsRoutes = require('./routes/Master/event_setup_requirements.routes.js');
const guestRoutes = require('./routes/Master/guest.routes.js');
const planEventMapRoutes = require('./routes/Master/plan_event_map.routes.js');
const vibesCardStudioRoutes = require('./routes/Master/vibescard_studio.routes.js');
const vibeBusinessSubscriptionRoutes = require('./routes/Master/vibe_business_subscription.routes.js');
const vibeBusinessPlanSubscribedRoutes = require('./routes/Master/vibe_business_plan_subscribed.routes.js');
const filterVendorLeadsRoutes = require('./routes/Master/filter_vendor_leads.routes.js');
const vendorCorporateClientRoutes = require('./routes/Master/vendor_corporate_client.routes.js');
const eventEntryTicketsRoutes = require('./routes/Master/event_entry_tickets.routes.js');
const eventEntryUsergetTicketsRoutes = require('./routes/Master/event_entry_userget_tickets.routes.js');
const eventTicketsSeatsRoutes = require('./routes/Master/event_tickets_seats.routes.js');
const eventEntryTicketsOrderRoutes = require('./routes/Master/event_entry_tickets_order.routes.js');
const designCommunityTabsRoutes = require('./routes/Master/design_community_tabs.routes.js');
const communityDesignsRoutes = require('./routes/Master/community_designs.routes.js');
const communityDesignsLikesRoutes = require('./routes/Master/community_designs_likes.routes.js');
const communityDesignsViewsRoutes = require('./routes/Master/community_designs_views.routes.js');
const communityDesignsShareRoutes = require('./routes/Master/community_designs_share.routes.js');
const communityDesignsRemixesRoutes = require('./routes/Master/community_designs_remixes.routes.js');
const communityDesignsDownloadsRoutes = require('./routes/Master/community_designs_downloads.routes.js');
const designTabsMapRoutes = require('./routes/Master/design_tabs_map.routes.js');
const staffEventBookRoutes = require('./routes/Master/staff_event_book.routes.js');
const staffCategoryRoutes = require('./routes/Master/staff_category.routes.js');
const staffWorkingPriceRoutes = require('./routes/Master/staff_working_price.routes.js');
const staffRoutes = require('./routes/Master/staff.routes.js');
const cateringMarketplaceCategoryRoutes = require('./routes/Master/catering_marketplace_category.routes.js');
const cateringMarketplaceRoutes = require('./routes/Master/catering_marketplace.routes.js');
const cateringMarketplaceBookingRoutes = require('./routes/Master/catering_marketplace_booking.routes.js');
const contactVendorRoutes = require('./routes/Master/contact_vendor.routes.js');
const availabilityCalenderRoutes = require('./routes/Master/availability_calender.routes.js');
const globalSearchRoutes = require('./routes/Master/global_search.routes.js');
const emailTemplateRoutes = require('./routes/Vendor/crm_vendor_outreach_Dashboard/email_template.routes.js');

// Import Vendor route modules
const vendorBusinessInformationRoutes = require('./routes/Vendor/crm_vendor_outreach_Dashboard/vendor_business_information.routes.js');
const crmVendorOutreachDashboardRoutes = require('./routes/Vendor/crm_vendor_outreach_Dashboard/crm_vendor_outreach_Dashboard.routes.js');
const leadDiscoveredRoutes = require('./routes/Vendor/crm_vendor_outreach_Dashboard/lead_discovered.routes.js');
const leadContactedRoutes = require('./routes/Vendor/crm_vendor_outreach_Dashboard/lead_contacted.routes.js');
const onboardingStartedRoutes = require('./routes/Vendor/crm_vendor_outreach_Dashboard/onboarding_started.routes.js');
const featuredRoutes = require('./routes/Vendor/crm_vendor_outreach_Dashboard/featured.routes.js');
const vendorOverviewRoutes = require('./routes/Vendor/crm_vendor_outreach_Dashboard/vendor_overview.routes.js');
const vendorOnboardingPortalRoutes = require('./routes/Vendor/vendor_onboarding_portal.routes.js');
const corporateDashboardClientRoutes = require('./routes/Vendor/corporate_Dashboard_Client.routes.js');
const corporateDashboardPricingPlansRoutes = require('./routes/Vendor/corporate_Dashboard_PricingPlans.routes.js');
const corporateDashboardRoutes = require('./routes/Vendor/corporate_Dashboard.routes.js');
const premiumDashboardRoutes = require('./routes/Vendor/premium_Dashboard.routes.js');
const vendorBookingRoutes = require('./routes/Vendor/vendor_booking.routes.js');

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
router.use('/file-upload', fileUploadRoutes);
router.use('/event-types', eventTypeRoutes);
router.use('/roles', roleRoutes);
router.use('/event-category-tags', eventCategoryTagsRoutes);
router.use('/countries', countryRoutes);
router.use('/states', stateRoutes);
router.use('/cities', cityRoutes);
router.use('/events', eventRoutes);

// Mount Admin route modules
router.use('/admin', adminRoutes);
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
router.use('/admin/categories-fees', categoriesFeesRoutes);

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
router.use('/master/event-tasks', eventTasksRoutes);
router.use('/master/event-discussion-chat', eventDiscussionChatRoutes);
router.use('/master/item-category', itemCategoryRoutes);
router.use('/master/items', itemsRoutes);
router.use('/master/budget-items', budgetItemsRoutes);
router.use('/master/venue-details', venueDetailsRoutes);
router.use('/master/event-setup-requirements', eventSetupRequirementsRoutes);
router.use('/master/guest', guestRoutes);
router.use('/master/plan-event-map', planEventMapRoutes);
router.use('/master/vibescard-studio', vibesCardStudioRoutes);
router.use('/master/vibe-business-subscription', vibeBusinessSubscriptionRoutes);
router.use('/master/vibe-business-plan-subscribed', vibeBusinessPlanSubscribedRoutes);
router.use('/master/filter-vendor-leads', filterVendorLeadsRoutes);
router.use('/master/vendor-corporate-client', vendorCorporateClientRoutes);
router.use('/master/event-entry-tickets', eventEntryTicketsRoutes);
router.use('/master/event-entry-userget-tickets', eventEntryUsergetTicketsRoutes);
router.use('/master/event-tickets-seats', eventTicketsSeatsRoutes);
router.use('/master/event-entry-tickets-order', eventEntryTicketsOrderRoutes);
router.use('/master/design-community-tabs', designCommunityTabsRoutes);
router.use('/master/community-designs', communityDesignsRoutes);
router.use('/master/community-designs-likes', communityDesignsLikesRoutes);
router.use('/master/community-designs-views', communityDesignsViewsRoutes);
router.use('/master/community-designs-share', communityDesignsShareRoutes);
router.use('/master/community-designs-remixes', communityDesignsRemixesRoutes);
router.use('/master/community-designs-downloads', communityDesignsDownloadsRoutes);
router.use('/master/design-tabs-map', designTabsMapRoutes);
router.use('/master/staff-event-book', staffEventBookRoutes);
router.use('/master/staff-category', staffCategoryRoutes);
router.use('/master/staff-working-price', staffWorkingPriceRoutes);
router.use('/master/staff', staffRoutes);
router.use('/master/catering-marketplace-category', cateringMarketplaceCategoryRoutes);
router.use('/master/catering-marketplace', cateringMarketplaceRoutes);
router.use('/master/catering-marketplace-booking', cateringMarketplaceBookingRoutes);
router.use('/master/contact-vendor', contactVendorRoutes);
router.use('/master/availability-calender', availabilityCalenderRoutes);
router.use('/master/global-search', globalSearchRoutes);
router.use('/vendor/email-template', emailTemplateRoutes);

// Mount Vendor route modules
router.use('/vendor/business-information', vendorBusinessInformationRoutes);
router.use('/vendor/crm-outreach-dashboard', crmVendorOutreachDashboardRoutes);
router.use('/vendor/lead-discovered', leadDiscoveredRoutes);
router.use('/vendor/lead-contacted', leadContactedRoutes);
router.use('/vendor/onboarding-started', onboardingStartedRoutes);
router.use('/vendor/featured', featuredRoutes);
router.use('/vendor/overview', vendorOverviewRoutes);
router.use('/vendor/onboarding-portal', vendorOnboardingPortalRoutes);
router.use('/vendor/corporate-dashboard-client', corporateDashboardClientRoutes);
router.use('/vendor/corporate-dashboard-pricing-plans', corporateDashboardPricingPlansRoutes);
router.use('/vendor/corporate-dashboard', corporateDashboardRoutes);
router.use('/vendor/premium-dashboard', premiumDashboardRoutes);
router.use('/vendor/bookings', vendorBookingRoutes);

module.exports = router;
