# Get Venue Details by Event ID API

## Overview
This API retrieves venue details associated with a specific event.

## Endpoint
```
GET /api/master/venue-details/event/:eventId
```

## Authentication
Requires JWT authentication token in the Authorization header.

## Request

### Headers
```
Authorization: Bearer {accessToken}
```

### URL Parameters
- `eventId` (required): The event ID (integer, must be greater than 0)

### Example Request
```bash
GET /api/master/venue-details/event/123
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Venue details retrieved successfully",
  "data": {
    "venue_details_id": 1,
    "name": "Grand Ballroom",
    "address": "123 Main Street, Downtown",
    "capacity": 500,
    "type": "Indoor",
    "map": "https://maps.google.com/...",
    "status": true,
    "createdBy": 1,
    "createdAt": "2025-10-07T10:00:00.000Z",
    "updatedBy": null,
    "updatedAt": "2025-10-07T10:00:00.000Z"
  },
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

### Error Responses

#### 404 Not Found - Event Not Found
```json
{
  "success": false,
  "message": "Event not found",
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

#### 404 Not Found - No Venue Details Associated
```json
{
  "success": false,
  "message": "No venue details associated with this event",
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

#### 404 Not Found - Venue Details Not Found
```json
{
  "success": false,
  "message": "Venue details not found",
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

#### 400 Bad Request - Invalid Event ID
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
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

#### 401 Unauthorized - No Token
```json
{
  "success": false,
  "message": "Access token is required",
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

## Usage Examples

### cURL
```bash
curl -X GET http://localhost:3000/api/master/venue-details/event/123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript (Fetch)
```javascript
const getVenueByEventId = async (eventId) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(`http://localhost:3000/api/master/venue-details/event/${eventId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Venue details:', data.data);
      return data.data;
    } else {
      console.error('Error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
};

// Usage
getVenueByEventId(123)
  .then(venue => {
    if (venue) {
      console.log(`Venue: ${venue.name}`);
      console.log(`Address: ${venue.address}`);
      console.log(`Capacity: ${venue.capacity}`);
    }
  });
```

### JavaScript (Axios)
```javascript
import axios from 'axios';

const getVenueByEventId = async (eventId) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await axios.get(
      `http://localhost:3000/api/master/venue-details/event/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data.message);
    } else {
      console.error('Request failed:', error.message);
    }
    throw error;
  }
};

// Usage
getVenueByEventId(123)
  .then(venue => {
    console.log('Venue details:', venue);
  })
  .catch(err => {
    console.error('Failed to get venue:', err);
  });
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const useVenueByEvent = (eventId) => {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        
        const response = await axios.get(
          `http://localhost:3000/api/master/venue-details/event/${eventId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        setVenue(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch venue');
        setVenue(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [eventId]);

  return { venue, loading, error };
};

// Usage in component
function EventVenueDisplay({ eventId }) {
  const { venue, loading, error } = useVenueByEvent(eventId);

  if (loading) return <div>Loading venue details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!venue) return <div>No venue details found</div>;

  return (
    <div>
      <h2>{venue.name}</h2>
      <p>Address: {venue.address}</p>
      <p>Capacity: {venue.capacity} people</p>
      <p>Type: {venue.type}</p>
      {venue.map && <a href={venue.map} target="_blank">View on Map</a>}
    </div>
  );
}
```

## How It Works

1. **Receives Event ID**: The API receives an event ID as a URL parameter
2. **Finds Event**: Queries the Event collection to find the event by `event_id`
3. **Extracts Venue ID**: Gets the `venue_details_id` from the found event
4. **Retrieves Venue**: Queries the VenueDetails collection using the `venue_details_id`
5. **Returns Data**: Returns the complete venue details object

## Validation

The API validates that:
- Event ID must be a positive integer
- Event ID must be provided (cannot be empty)
- Event must exist in the database
- Event must have an associated venue_details_id
- Venue details must exist in the database

## Related Endpoints

- `GET /api/master/venue-details/get/:id` - Get venue details by venue ID
- `GET /api/master/venue-details/all` - Get all venue details with pagination
- `POST /api/master/venue-details/create` - Create new venue details
- `PUT /api/master/venue-details/update` - Update venue details
- `DELETE /api/master/venue-details/delete/:id` - Delete venue details

## Files Modified

1. **src/controllers/venue_details.controller.js**
   - Added `getVenueDetailsByEventId` function
   - Imported Event model

2. **validators/venue_details.validator.js**
   - Added `eventIdSchema` validation

3. **src/routes/Master/venue_details.routes.js**
   - Added new route: `GET /event/:eventId`

## Testing in Postman

1. **Login first** to get access token:
   ```
   POST /api/users/login
   ```

2. **Copy the access token** from the response

3. **Test the endpoint**:
   - Method: GET
   - URL: `http://localhost:3000/api/master/venue-details/event/123`
   - Headers:
     - Authorization: `Bearer {your_access_token}`

4. **Expected result**: Venue details associated with the event

## Notes

- The API requires authentication (JWT token)
- The event must have a valid `venue_details_id` field
- Both the event and venue details must exist in the database
- The API returns a 404 error if any of the required data is not found

