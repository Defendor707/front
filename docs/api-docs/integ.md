# API Documentation

Base URL: `http://localhost:3001/api`

## Table of Contents

1. [VoIP Routes](#voip-routes)
2. [QA Routes](#qa-routes)
3. [Topic Routes](#topic-routes)
4. [Statistics Routes](#statistics-routes)
5. [Call Routes](#call-routes)

---

## VoIP Routes

Base path: `/api/voip`

### 1. Start Call

**POST** `/api/voip/call`

Start a new call with TTS configuration.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "string",
  "targetNumber": "string",
  "prompt": "string",
  "noise": 1,
  "noiseGain": 0.15,
  "speed": 1.0
}
```

**Request Body Fields:**
- `model` (string, required): TTS model name
- `targetNumber` (string, required): Phone number to call
- `prompt` (string, optional): System prompt for LLM (default: empty string)
- `noise` (number, optional): Noise level (default: 1)
- `noiseGain` (number, optional): Noise gain value (default: 0.15)
- `speed` (number, optional): Speech speed (default: 1.0)

**Response:**
```json
{
  "message": "Call started successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Model and targetNumber are required
- `500` - Internal server error

---

### 2. Upload File to OpenAI

**POST** `/api/voip/file`

Upload a file to OpenAI vector store.

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
- `file` (file, required): File to upload

**Response:**
```json
{
  "message": "File uploaded successfully",
  "fileId": "file-abc123",
  "openaiResponse": { ... }
}
```

**Status Codes:**
- `200` - Success
- `400` - No file uploaded
- `500` - Failed to upload file

---

### 3. Get All Files

**GET** `/api/voip/file`

Get list of all uploaded files.

**Response:**
```json
[
  {
    "id": "file-abc123",
    "name": "document.pdf",
    "bytes": 1024,
    "created_at": 1234567890
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Error fetching files

---

### 4. Get File by ID

**GET** `/api/voip/file/:fileId`

Download a specific file.

**Path Parameters:**
- `fileId` (string, required): File ID

**Response:**
- File content (binary)

**Status Codes:**
- `200` - Success
- `404` - File not found
- `500` - Server error

---

### 5. Delete File

**DELETE** `/api/voip/file/:fileId`

Delete a file from OpenAI and local storage.

**Path Parameters:**
- `fileId` (string, required): File ID

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `500` - Failed to delete file

---

### 6. Delete Call History

**DELETE** `/api/voip/history/:targetNumber`

Delete call history for a specific phone number.

**Path Parameters:**
- `targetNumber` (string, required): Phone number

**Response:**
```json
{
  "message": "History deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `500` - Failed to delete history

---

## Call Routes

Base path: `/api/voip/calls`

### 1. Get All Calls

**GET** `/api/voip/calls`

Get all calls with optional filters.

**Query Parameters:**
- `number` (string, optional): Filter by phone number
- `status` (string, optional): Filter by status ("processing" or "completed")

**Example:**
```
GET /api/voip/calls?number=+998901234567&status=completed
```

**Response:**
```json
[
  {
    "number": "+998901234567",
    "status": "completed",
    "summary": "Call summary text",
    "chatHistory": "[{\"role\":\"user\",\"content\":\"...\"}]",
    "duration": 120,
    "topic": "Support",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Failed to fetch calls

---

## QA Routes

Base path: `/api/qa`

### 1. Create QA

**POST** `/api/qa`

Create a new Q&A entry.

**Request Body:**
```json
{
  "title": "What is your return policy?",
  "answer": "We offer 30-day returns on all products."
}
```

**Request Body Fields:**
- `title` (string, required): Question title
- `answer` (string, required): Answer text

**Response:**
```json
{
  "id": 1,
  "title": "What is your return policy?",
  "answer": "We offer 30-day returns on all products.",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Title and answer are required
- `500` - Failed to create QA

---

### 2. Get All QAs

**GET** `/api/qa`

Get all Q&A entries with optional search.

**Query Parameters:**
- `search` (string, optional): Search by title

**Example:**
```
GET /api/qa?search=return
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "What is your return policy?",
    "answer": "We offer 30-day returns on all products.",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Failed to fetch QAs

---

### 3. Get QA by ID

**GET** `/api/qa/:id`

Get a specific Q&A entry by ID.

**Path Parameters:**
- `id` (number, required): QA ID

**Response:**
```json
{
  "id": 1,
  "title": "What is your return policy?",
  "answer": "We offer 30-day returns on all products.",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid ID
- `404` - QA not found
- `500` - Failed to fetch QA

---

### 4. Update QA

**PUT** `/api/qa/:id`

Update a Q&A entry.

**Path Parameters:**
- `id` (number, required): QA ID

**Request Body:**
```json
{
  "title": "Updated question?",
  "answer": "Updated answer."
}
```

**Request Body Fields (all optional):**
- `title` (string, optional): Updated question title
- `answer` (string, optional): Updated answer text

**Response:**
```json
{
  "id": 1,
  "title": "Updated question?",
  "answer": "Updated answer.",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid ID or no fields to update
- `500` - Failed to update QA

---

### 5. Delete QA

**DELETE** `/api/qa/:id`

Delete a Q&A entry.

**Path Parameters:**
- `id` (number, required): QA ID

**Response:**
```json
{
  "message": "QA deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid ID
- `500` - Failed to delete QA

---

## Topic Routes

Base path: `/api/topics`

### 1. Create Topic

**POST** `/api/topics`

Create a new topic.

**Request Body:**
```json
{
  "name": "Support"
}
```

**Request Body Fields:**
- `name` (string, required): Topic name (must be unique)

**Response:**
```json
{
  "id": 1,
  "name": "Support"
}
```

**Status Codes:**
- `201` - Created
- `400` - Name is required
- `409` - Topic with this name already exists
- `500` - Failed to create topic

---

### 2. Get All Topics

**GET** `/api/topics`

Get all topics.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Support"
  },
  {
    "id": 2,
    "name": "Sales"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Failed to fetch topics

---

### 3. Get Topic by ID

**GET** `/api/topics/:id`

Get a specific topic by ID.

**Path Parameters:**
- `id` (number, required): Topic ID

**Response:**
```json
{
  "id": 1,
  "name": "Support"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid ID
- `404` - Topic not found
- `500` - Failed to fetch topic

---

### 4. Delete Topic

**DELETE** `/api/topics/:id`

Delete a topic.

**Path Parameters:**
- `id` (number, required): Topic ID

**Response:**
```json
{
  "message": "Topic deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid ID
- `500` - Failed to delete topic

---

## Statistics Routes

Base path: `/api/statistics`

### 1. Get All Statistics

**GET** `/api/statistics`

Get comprehensive statistics including daily/monthly calls, average duration, and topics frequency.

**Query Parameters:**
- `days` (number, optional): Number of days for daily calls graph (default: 30)
- `months` (number, optional): Number of months for monthly calls graph (default: 12)

**Example:**
```
GET /api/statistics?days=60&months=6
```

**Response:**
```json
{
  "totalCalls": 150,
  "averageDuration": 120,
  "dailyCalls": [
    {
      "date": "2024-01-15",
      "count": 10
    },
    {
      "date": "2024-01-16",
      "count": 12
    }
  ],
  "monthlyCalls": [
    {
      "month": "2024-01",
      "count": 150
    },
    {
      "month": "2023-12",
      "count": 140
    }
  ],
  "topicsFrequency": [
    {
      "topic": "Support",
      "count": 45
    },
    {
      "topic": "Sales",
      "count": 30
    },
    {
      "topic": "Other",
      "count": 15
    }
  ]
}
```

**Response Fields:**
- `totalCalls` (number): Total number of calls
- `averageDuration` (number): Average call duration in seconds (rounded)
- `dailyCalls` (array): Array of daily call counts
  - `date` (string): Date in YYYY-MM-DD format
  - `count` (number): Number of calls on that date
- `monthlyCalls` (array): Array of monthly call counts
  - `month` (string): Month in YYYY-MM format
  - `count` (number): Number of calls in that month
- `topicsFrequency` (array): Array of topic frequencies (sorted by count, descending)
  - `topic` (string): Topic name
  - `count` (number): Number of calls with this topic

**Status Codes:**
- `200` - Success
- `500` - Failed to fetch statistics

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid token)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Notes

1. **Authentication**: Some endpoints require `authToken` in the request body or query parameters
2. **Phone Number Format**: Phone numbers should include country code (e.g., +998901234567)
3. **Date Formats**: All dates are returned in ISO 8601 format (UTC)
4. **Duration**: Call duration is stored in seconds
5. **Topics**: Topics are automatically extracted from call summaries using AI when a call ends
