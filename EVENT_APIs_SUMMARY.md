# Event-Related APIs Summary

## Overview
This document summarizes the new event-related APIs that have been created to retrieve data by event ID.

---

## 1. Event Tasks API

### Model Changes
**File:** `src/models/event_tasks.model.js`
- ✅ Added `event_id` field (Number, ref: 'Event', required)

### New Endpoint
```
GET /api/master/event-tasks/event/:eventId
```

**Description:** Get all event tasks for a specific event

**Authentication:** Required (JWT token)

**URL Parameters:**
- `eventId` (required): Event ID (integer, must be greater than 0)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in task title and description
- `status` (optional): Filter by status ('true' or 'false')

**Example Request:**
```bash
GET /api/master/event-tasks/event/1?page=1&limit=10
Authorization: Bearer {accessToken}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Event tasks by event retrieved successfully",
  "data": [
    {
      "event_tasks_id": 1,
      "event_id": 1,
      "taskTitle": "Confirm final guest count",
      "description": "Contact all guests for confirmation",
      "confirmFinalGuestCount": true,
      "confirmFinalGuestCount_date": "2025-10-08T10:00:00.000Z",
      "finalizeMusicPlaylist": false,
      "setupDecorations": false,
      "status": true,
      "createdBy": 1,
      "createdAt": "2025-10-07T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 1,
    "total": 1,
    "limit": 10
  },
  "timestamp": "2025-10-08T10:30:00.000Z"
}
```

---

## 2. Event Discussion Chat API

### Model Status
**File:** `src/models/event_discussion_chat.model.js`
- ✅ Already has `event_id` field (Number, ref: 'Event', required)

### New Endpoint
```
GET /api/master/event-discussion-chat/event/:eventId
```

**Description:** Get all discussion chats for a specific event

**Authentication:** Required (JWT token)

**URL Parameters:**
- `eventId` (required): Event ID (integer, must be greater than 0)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in message content
- `status` (optional): Filter by status ('true' or 'false')

**Example Request:**
```bash
GET /api/master/event-discussion-chat/event/1?page=1&limit=10
Authorization: Bearer {accessToken}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Event discussion chats by event retrieved successfully",
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "user_id": 5,
      "message": "Looking forward to this event!",
      "message_type": "text",
      "file_url": null,
      "reply_to": null,
      "is_edited": false,
      "edited_at": null,
      "status": true,
      "createdBy": 5,
      "createdAt": "2025-10-08T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 1,
    "total": 1,
    "limit": 10
  },
  "timestamp": "2025-10-08T10:30:00.000Z"
}
```

---

## 3. Guest API

### Model Status
**File:** `src/models/guest.model.js`
- ✅ Already has `event_id` field (Number, ref: 'Event')

### Existing Endpoint
```
GET /api/master/guest/event/:eventId
```

**Description:** Get all guests for a specific event

**Authentication:** Required (JWT token)

**URL Parameters:**
- `eventId` (required): Event ID (integer, must be greater than 0)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in name, email, and mobile number
- `status` (optional): Filter by status ('true' or 'false')

**Example Request:**
```bash
GET /api/master/guest/event/1?page=1&limit=10
Authorization: Bearer {accessToken}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Guests by event retrieved successfully",
  "data": [
    {
      "guest_id": 1,
      "event_id": 1,
      "name": "John Doe",
      "mobileno": "1234567890",
      "email": "john@example.com",
      "specialnote": "Vegetarian meal required",
      "img": "https://example.com/john.jpg",
      "status": true,
      "createdBy": 1,
      "createdAt": "2025-10-07T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 1,
    "total": 1,
    "limit": 10
  },
  "timestamp": "2025-10-08T10:30:00.000Z"
}
```

---

## Files Modified

### Models
1. ✅ `src/models/event_tasks.model.js` - Added event_id field
2. ✅ `src/models/event_discussion_chat.model.js` - Already had event_id
3. ✅ `src/models/guest.model.js` - Already had event_id

### Controllers
1. ✅ `src/controllers/event_tasks.controller.js` - Added `getEventTasksByEventId` function
2. ✅ `src/controllers/event_discussion_chat.controller.js` - Added `getEventDiscussionChatsByEventId` function, fixed sendSuccess/sendPaginated parameter order
3. ✅ `src/controllers/guest.controller.js` - Already had `getGuestsByEventId` function

### Validators
1. ✅ `validators/event_tasks.validator.js` - Added event_id to createSchema, added eventIdSchema
2. ✅ `validators/event_discussion_chat.validator.js` - Added eventIdSchema
3. ✅ `validators/guest.validator.js` - Already had eventIdSchema

### Routes
1. ✅ `src/routes/Master/event_tasks.routes.js` - Added GET /event/:eventId endpoint
2. ✅ `src/routes/Master/event_discussion_chat.routes.js` - Added GET /event/:eventId endpoint, added validation to create
3. ✅ `src/routes/Master/guest.routes.js` - Already had GET /event/:eventId endpoint

---

## Usage Examples

### JavaScript (Fetch)
```javascript
const getEventTasks = async (eventId) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(
      `http://localhost:3000/api/master/event-tasks/event/${eventId}?page=1&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const data = await response.json();
    return data.data; // Returns array of tasks
  } catch (error) {
    console.error('Error fetching event tasks:', error);
    throw error;
  }
};

const getEventChats = async (eventId) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(
      `http://localhost:3000/api/master/event-discussion-chat/event/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const data = await response.json();
    return data.data; // Returns array of chats
  } catch (error) {
    console.error('Error fetching event chats:', error);
    throw error;
  }
};

const getEventGuests = async (eventId) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(
      `http://localhost:3000/api/master/guest/event/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const data = await response.json();
    return data.data; // Returns array of guests
  } catch (error) {
    console.error('Error fetching event guests:', error);
    throw error;
  }
};
```

### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});

// Get event tasks
const getEventTasks = (eventId, page = 1, limit = 10) => 
  api.get(`/master/event-tasks/event/${eventId}`, { params: { page, limit } });

// Get event chats
const getEventChats = (eventId, page = 1, limit = 10) => 
  api.get(`/master/event-discussion-chat/event/${eventId}`, { params: { page, limit } });

// Get event guests
const getEventGuests = (eventId, page = 1, limit = 10) => 
  api.get(`/master/guest/event/${eventId}`, { params: { page, limit } });

// Usage
async function loadEventData(eventId) {
  try {
    const [tasks, chats, guests] = await Promise.all([
      getEventTasks(eventId),
      getEventChats(eventId),
      getEventGuests(eventId)
    ]);
    
    console.log('Tasks:', tasks.data.data);
    console.log('Chats:', chats.data.data);
    console.log('Guests:', guests.data.data);
  } catch (error) {
    console.error('Error loading event data:', error);
  }
}
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const useEventData = (eventId) => {
  const [tasks, setTasks] = useState([]);
  const [chats, setChats] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        const baseURL = 'http://localhost:3000/api/master';
        
        const config = {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        };

        const [tasksRes, chatsRes, guestsRes] = await Promise.all([
          axios.get(`${baseURL}/event-tasks/event/${eventId}`, config),
          axios.get(`${baseURL}/event-discussion-chat/event/${eventId}`, config),
          axios.get(`${baseURL}/guest/event/${eventId}`, config)
        ]);

        setTasks(tasksRes.data.data);
        setChats(chatsRes.data.data);
        setGuests(guestsRes.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch event data');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  return { tasks, chats, guests, loading, error };
};

// Usage in component
function EventDashboard({ eventId }) {
  const { tasks, chats, guests, loading, error } = useEventData(eventId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Event Dashboard</h2>
      
      <section>
        <h3>Tasks ({tasks.length})</h3>
        {tasks.map(task => (
          <div key={task.event_tasks_id}>{task.taskTitle}</div>
        ))}
      </section>

      <section>
        <h3>Chats ({chats.length})</h3>
        {chats.map(chat => (
          <div key={chat.id}>{chat.message}</div>
        ))}
      </section>

      <section>
        <h3>Guests ({guests.length})</h3>
        {guests.map(guest => (
          <div key={guest.guest_id}>{guest.name}</div>
        ))}
      </section>
    </div>
  );
}
```

---

## Important Notes

1. **Event ID Required:** When creating event tasks, you must now provide the `event_id` field (required).

2. **Authentication:** All endpoints require JWT authentication.

3. **Pagination:** All endpoints support pagination with default values (page=1, limit=10).

4. **Search:** All endpoints support search functionality within their respective fields.

5. **Status Filter:** All endpoints support filtering by status (active/inactive).

---

## Testing in Postman

### 1. Create Event Task with Event ID
```
POST /api/master/event-tasks/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "event_id": 1,
  "taskTitle": "Setup decorations",
  "description": "Arrange flowers and balloons",
  "setupDecorations": true
}
```

### 2. Get Tasks by Event ID
```
GET /api/master/event-tasks/event/1
Authorization: Bearer {token}
```

### 3. Get Chats by Event ID
```
GET /api/master/event-discussion-chat/event/1
Authorization: Bearer {token}
```

### 4. Get Guests by Event ID
```
GET /api/master/guest/event/1
Authorization: Bearer {token}
```

---

## Error Responses

### 400 Bad Request - Invalid Event ID
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "eventId",
      "message": "Event ID must be a number"
    }
  ],
  "timestamp": "2025-10-08T10:30:00.000Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is required",
  "timestamp": "2025-10-08T10:30:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Event not found",
  "timestamp": "2025-10-08T10:30:00.000Z"
}
```

---

## Summary

✅ **Event Tasks:** Now requires event_id and supports getByEventId
✅ **Event Discussion Chat:** Already had event_id, now supports getByEventId
✅ **Guest:** Already had both event_id and getByEventId

All APIs are fully functional, validated, and ready for use!

