const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createEventEntryTicketsOrderSchema, updateEventEntryTicketsOrderSchema, querySchema, idSchema, processPaymentSchema } = require('../../../validators/event_entry_tickets_order.validator');
const { createEventEntryTicketsOrder, getAllEventEntryTicketsOrders, getEventEntryTicketsOrderById, getEventEntryTicketsOrdersByAuth, updateEventEntryTicketsOrder, deleteEventEntryTicketsOrder, processPayment, confirmPayment } = require('../../controllers/event_entry_tickets_order.controller');

// Create event entry tickets order (with auth)
router.post('/create', auth, validateBody(createEventEntryTicketsOrderSchema), createEventEntryTicketsOrder);

// Get all event entry tickets orders (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllEventEntryTicketsOrders);

// Get event entry tickets orders by authenticated user (with auth)
router.get('/my-orders', auth, validateQuery(querySchema), getEventEntryTicketsOrdersByAuth);

// Get event entry tickets order by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getEventEntryTicketsOrderById);

// Update event entry tickets order (with auth)
router.put('/update', auth, validateBody(updateEventEntryTicketsOrderSchema), updateEventEntryTicketsOrder);

// Delete event entry tickets order (with auth)
router.delete('/delete/:id', auth, validateParams(idSchema), deleteEventEntryTicketsOrder);

// Process payment for order (with auth) - Creates TicketBooking transaction
router.post('/EntryTicketsPayments', auth, validateBody(processPaymentSchema), processPayment);


// Confirm payment for order (with auth) - Confirms Stripe payment intent
router.post('/confirm-payment', auth, confirmPayment);

module.exports = router;

