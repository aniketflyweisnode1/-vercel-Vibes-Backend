# Vendor Payout API - Postman Collection

This Postman collection contains all the endpoints for the Vendor Payout API.

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Vendor_Payout.postman_collection.json`
4. Click **Import**

### 2. Import Environment (Optional but Recommended)
1. Click **Import** button
2. Select `Vendor_Payout.postman_environment.json`
3. Click **Import**
4. Select the environment from the dropdown in the top right

### 3. Configure Environment Variables
Update the following variables in your environment:
- `base_url`: Your API base URL (default: `http://localhost:3000`)
- `auth_token`: Your authentication token (Bearer token)
- `vendor_id`: Default vendor ID for testing
- `vendor_payout_id`: Default vendor payout ID for testing

## API Endpoints

### 1. Create Vendor Payout
- **Method**: `POST`
- **URL**: `/api/master/vendor-payout/create`
- **Auth**: Required (Bearer Token)
- **Body Example**:
```json
{
  "Vendor_id": 1,
  "amount": 1000,
  "paymentType": "Bank Transfer",
  "bank_branch_name_id": 1,
  "Event_Id": 1,
  "PendingAmount": 0,
  "Status": true
}
```

### 2. Get All Vendor Payouts
- **Method**: `GET`
- **URL**: `/api/master/vendor-payout/all`
- **Auth**: Not Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `status` (optional): Filter by status (true/false)
  - `Vendor_id` (optional): Filter by vendor ID

### 3. Get Vendor Payout By ID
- **Method**: `GET`
- **URL**: `/api/master/vendor-payout/get/:id`
- **Auth**: Required (Bearer Token)
- **Path Parameter**: `id` - Vendor Payout ID

### 4. Update Vendor Payout
- **Method**: `PUT`
- **URL**: `/api/master/vendor-payout/update`
- **Auth**: Required (Bearer Token)
- **Body Example**:
```json
{
  "Vendor_Payout_id": 1,
  "amount": 1500,
  "paymentType": "UPI",
  "bank_branch_name_id": 2,
  "Event_Id": 2,
  "PendingAmount": 500,
  "Status": true
}
```
**Note**: `Vendor_Payout_id` is required. All other fields are optional.

### 5. Delete Vendor Payout
- **Method**: `DELETE`
- **URL**: `/api/master/vendor-payout/delete/:id`
- **Auth**: Required (Bearer Token)
- **Path Parameter**: `id` - Vendor Payout ID

## Authentication

Most endpoints require authentication using Bearer Token:
1. Get your authentication token from the login endpoint
2. Set it in the environment variable `auth_token`
3. The collection will automatically use it for authenticated requests

## Response Format

All endpoints return JSON responses in the following format:

**Success Response**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2025-12-03T12:00:00.000Z"
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ],
  "timestamp": "2025-12-03T12:00:00.000Z"
}
```

## Field Descriptions

- **Vendor_Payout_id**: Auto-incremented unique ID
- **Vendor_id**: Reference to User model (vendor)
- **amount**: Payout amount (required, min: 0)
- **paymentType**: Payment method type (optional, max 50 chars)
- **bank_branch_name_id**: Reference to BankBranchName model (optional)
- **Event_Id**: Reference to Event model (optional)
- **PendingAmount**: Pending amount (default: 0, min: 0)
- **Status**: Active status (default: true)
- **CreateBy**: User who created the record
- **CreateAt**: Creation timestamp (auto-filled)
- **UpdatedBy**: User who last updated the record
- **UpdatedAt**: Last update timestamp (auto-updated)

## Testing Tips

1. **Create First**: Always create a vendor payout first to get a valid ID
2. **Use Variables**: Update the `vendor_payout_id` variable after creating a payout
3. **Check Responses**: All GET endpoints populate related data (vendor, bank branch, event, users)
4. **Filter Results**: Use query parameters in "Get All" to filter by status or vendor

