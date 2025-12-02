const EventTicketsSeats = require('../models/event_tickets_seats.model');
const Ticket = require('../models/ticket.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event ticket seat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventTicketSeat = asyncHandler(async (req, res) => {
  try {
    // Process array fields to ensure they are arrays
    const processArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [field];
        } catch {
          return [field];
        }
      }
      return [field];
    };

    const seatData = {
      ...req.body,
      createdBy: req.userId
    };

    // Process array fields
    if (req.body.event_entry_tickets_id !== undefined) {
      seatData.event_entry_tickets_id = processArrayField(req.body.event_entry_tickets_id).map(id => Number(id)).filter(id => !Number.isNaN(id));
    }
    if (req.body.seat_no !== undefined) {
      seatData.seat_no = processArrayField(req.body.seat_no);
    }

    const seat = await EventTicketsSeats.create(seatData);

    // Update Ticket model's max_capacity if capacity is provided
    if (seat.capacity && seat.event_id) {
      try {
        // Find the ticket for this event
        const ticket = await Ticket.findOne({ event_id: seat.event_id, status: true });
        
        if (ticket) {
          // Calculate total capacity from all seats for this event
          const allSeats = await EventTicketsSeats.find({ 
            event_id: seat.event_id, 
            status: true 
          });
          
          // Sum up all capacities
          const totalCapacity = allSeats.reduce((sum, s) => {
            return sum + (s.capacity || 0);
          }, 0);
          
          // Update ticket's max_capacity
          await Ticket.findOneAndUpdate(
            { event_id: seat.event_id, status: true },
            { 
              max_capacity: totalCapacity,
              updated_at: new Date()
            },
            { new: true }
          );
          
          console.log(`Updated Ticket max_capacity to ${totalCapacity} for event_id: ${seat.event_id}`);
        }
      } catch (ticketError) {
        // Log error but don't fail the seat creation
        console.error('Failed to update Ticket max_capacity:', ticketError);
      }
    }

    sendSuccess(res, seat, 'Event ticket seat created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event ticket seats with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventTicketsSeats = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id, event_entry_tickets_id, event_entry_userget_tickets_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNo: { $regex: search, $options: 'i' } },
        { seat_no: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }
  
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }
    if (event_entry_tickets_id) {
      // Handle array field - check if the array contains the value
      const ticketId = parseInt(event_entry_tickets_id);
      filter.event_entry_tickets_id = ticketId;
    }
    if (event_entry_userget_tickets_id) {
      filter.event_entry_userget_tickets_id = parseInt(event_entry_userget_tickets_id);
    }

    const [seats, total] = await Promise.all([
      EventTicketsSeats.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventTicketsSeats.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, seats, pagination, 'Event ticket seats retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event ticket seat by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventTicketSeatById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const seat = await EventTicketsSeats.findOne({ event_tickets_seats_id: parseInt(id) });

    if (!seat) {
      return sendNotFound(res, 'Event ticket seat not found');
    }

    sendSuccess(res, seat, 'Event ticket seat retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event ticket seat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventTicketSeat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Process array fields to ensure they are arrays
    const processArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [field];
        } catch {
          return [field];
        }
      }
      return [field];
    };

    const updateData = {
      ...req.body,
      updatedBy: req.userId,
      updatedAt: new Date()
    };

    // Process array fields
    if (req.body.event_entry_tickets_id !== undefined) {
      updateData.event_entry_tickets_id = processArrayField(req.body.event_entry_tickets_id).map(id => Number(id)).filter(id => !Number.isNaN(id));
    }
    if (req.body.seat_no !== undefined) {
      updateData.seat_no = processArrayField(req.body.seat_no);
    }

    const seat = await EventTicketsSeats.findOneAndUpdate(
      { event_tickets_seats_id: parseInt(id) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!seat) {
      return sendNotFound(res, 'Event ticket seat not found');
    }

    // Update Ticket model's max_capacity if event_id exists
    if (seat.event_id) {
      try {
        // Find the ticket for this event
        const ticket = await Ticket.findOne({ event_id: seat.event_id, status: true });
        
        if (ticket) {
          // Calculate total capacity from all seats for this event
          const allSeats = await EventTicketsSeats.find({ 
            event_id: seat.event_id, 
            status: true 
          });
          
          // Sum up all capacities
          const totalCapacity = allSeats.reduce((sum, s) => {
            return sum + (s.capacity || 0);
          }, 0);
          
          // Update ticket's max_capacity
          await Ticket.findOneAndUpdate(
            { event_id: seat.event_id, status: true },
            { 
              max_capacity: totalCapacity,
              updated_at: new Date()
            },
            { new: true }
          );
          
          console.log(`Updated Ticket max_capacity to ${totalCapacity} for event_id: ${seat.event_id}`);
        }
      } catch (ticketError) {
        // Log error but don't fail the seat update
        console.error('Failed to update Ticket max_capacity:', ticketError);
      }
    }

    sendSuccess(res, seat, 'Event ticket seat updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event ticket seat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventTicketSeat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const seat = await EventTicketsSeats.findOne({ event_tickets_seats_id: parseInt(id) });

    if (!seat) {
      return sendNotFound(res, 'Event ticket seat not found');
    }

    const eventId = seat.event_id;

    // Delete the seat
    await EventTicketsSeats.findOneAndDelete({ event_tickets_seats_id: parseInt(id) });

    // Update Ticket model's max_capacity after deletion
    if (eventId) {
      try {
        // Find the ticket for this event
        const ticket = await Ticket.findOne({ event_id: eventId, status: true });
        
        if (ticket) {
          // Calculate total capacity from all remaining seats for this event
          const allSeats = await EventTicketsSeats.find({ 
            event_id: eventId, 
            status: true 
          });
          
          // Sum up all capacities
          const totalCapacity = allSeats.reduce((sum, s) => {
            return sum + (s.capacity || 0);
          }, 0);
          
          // Update ticket's max_capacity
          await Ticket.findOneAndUpdate(
            { event_id: eventId, status: true },
            { 
              max_capacity: totalCapacity,
              updated_at: new Date()
            },
            { new: true }
          );
          
          console.log(`Updated Ticket max_capacity to ${totalCapacity} for event_id: ${eventId} after seat deletion`);
        }
      } catch (ticketError) {
        // Log error but don't fail the seat deletion
        console.error('Failed to update Ticket max_capacity:', ticketError);
      }
    }

    sendSuccess(res, null, 'Event ticket seat deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventTicketSeat,
  getAllEventTicketsSeats,
  getEventTicketSeatById,
  updateEventTicketSeat,
  deleteEventTicketSeat
};

