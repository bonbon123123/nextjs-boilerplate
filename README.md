# Image API Documentation

## Overview
Public API for retrieving images with advanced filtering, ranking, and sorting capabilities.

**Base URL:** `https://nextjs-boilerplate-eight-psi-91.vercel.app`

**Endpoint:** `/api/mongo/posts`

**Method:** `GET` (read-only, public access)

---

## Quick Start

### Get a random top-rated image
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&redirect=true
```

### Get images with specific tags
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&tags=landscape,nature
```

---

## Parameters

### Core API Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `api` | boolean | `false` | Set to `true` to use API mode (returns array of URLs instead of full objects) |
| `redirect` | boolean | `false` | If `true`, redirects directly to the image URL instead of returning JSON |
| `index` | integer | `0` | Which image to return from the ranked results (0-based) |

### Filtering Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `tags` | string | - | Comma-separated list of tags to filter by (e.g., `landscape,sunset`) |
| `excludedTags` | string | - | Comma-separated list of tags to exclude |
| `matchAll` | boolean | `false` | If `true`, requires ALL tags to match (AND logic). Default uses OR logic |
| `matchExcludedAll` | boolean | `false` | If `true`, excludes posts with ALL excluded tags (AND logic). Default uses OR logic |
| `specialTags` | JSON string | - | Filter by special tags (e.g., `{"danger":"sfw"}`) |
| `dateFrom` | ISO date | - | Filter posts created after this date (e.g., `2024-01-01T00:00:00Z`) |
| `dateTo` | ISO date | - | Filter posts created before this date |
| `excludeId` | string | - | Exclude a specific post by MongoDB ID |

### Sorting & Pagination

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sortBy` | string | `ranking` | Sort method: `ranking` (default), `votes`, or `date` |
| `sortOrder` | string | `desc` | Sort order: `desc` (descending) or `asc` (ascending) |
| `page` | integer | `1` | Page number for pagination |
| `limit` | integer | `40` | Number of results per page (max recommended: 40) |
| `rankingMode` | string | `web` | Ranking algorithm: `web` (engagement-focused) or `api` (quality-focused) |

---

## Examples

### 1. Get the top-rated image (with redirect)
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&redirect=true
```
**Result:** Redirects directly to the highest-ranked image URL

---

### 2. Get the second best image
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&redirect=true&index=1
```
**Result:** Redirects to the 2nd highest-ranked image (index starts at 0)

---

### 3. Get top 5 images with specific tags (JSON response)
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&tags=landscape,mountains&limit=5
```
**Result:** JSON array with 5 image URLs tagged with "landscape" OR "mountains"

---

### 4. Get images with ALL specified tags
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&tags=landscape,sunset&matchAll=true
```
**Result:** Only images that have BOTH "landscape" AND "sunset" tags

---

### 5. Get images excluding certain tags
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&tags=nature&excludedTags=sunset,night
```
**Result:** Images tagged "nature" but NOT tagged "sunset" or "night"

---

### 6. Get SFW images only
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&specialTags={"danger":"sfw"}
```
**Result:** Only safe-for-work images

---

### 7. Get recent images from last month
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&dateFrom=2024-11-01T00:00:00Z&limit=10
```
**Result:** 10 best-ranked images uploaded after November 1st, 2024

---

### 8. Sort by votes instead of ranking
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&sortBy=votes&limit=10
```
**Result:** Top 10 images sorted by vote score (upvotes - downvotes)

---

### 9. Get oldest images first
```
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&sortBy=date&sortOrder=asc&limit=5
```
**Result:** 5 oldest images in the database

---

### 10. Pagination example
```
# Page 1
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&page=1&limit=20

# Page 2
https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&page=2&limit=20
```
**Result:** Browse through results 20 at a time

---

## Response Format

### JSON Response (default)
```json
{
  "posts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "url": "https://utfs.io/f/abc123.jpg",
      "userId": "user123",
      "tags": ["landscape", "mountains", "sunset"],
      "upvotes": 150,
      "downvotes": 5,
      "width": 1920,
      "height": 1080,
      "name": "beautiful-sunset.jpg",
      "size": 245678,
      "type": "image/jpeg",
      "locked": false,
      "createdAt": "2024-11-15T10:30:00.000Z",
      "updatedAt": "2024-11-15T10:30:00.000Z"
    }
  ],
  "page": 1,
  "limit": 40,
  "total": 1000,
  "hasMore": true
}
```

### Redirect Response
When using `redirect=true`, the API responds with HTTP 302 redirect to the image URL.

---

## Ranking Algorithm

The API uses an intelligent ranking system that considers:

- **Vote Score**: Upvotes vs downvotes
- **Vote Ratio**: Percentage of positive votes
- **Engagement**: Total number of votes and comments
- **Freshness**: Recent posts are boosted
  - Last week: 100% weight
  - Last month: 90% weight
  - Older: Gradually decreasing (minimum 10%)
- **Controversy Bonus**: Posts with balanced voting get slight boost

### Ranking Modes

- **`web` mode** (default): Balanced algorithm considering engagement and quality
- **`api` mode**: Focuses on vote quality and popularity for consistent results

---

## Error Responses

### 404 - No images found
```json
{
  "error": "No images found matching the criteria",
  "query": {...},
  "totalFound": 0
}
```

### 404 - Index out of range
```json
{
  "error": "Index out of range",
  "message": "Requested index 10 but only 5 posts found",
  "availableRange": "0-4"
}
```

### 500 - Server error
```json
{
  "message": "Error fetching posts",
  "error": "..."
}
```

---

## Use Cases

### Embed Random Image in Your Website
```html
<img src="https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&redirect=true&tags=landscape" 
     alt="Random landscape">
```

### Discord Bot Command
```javascript
const imageUrl = 'https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&redirect=true&tags=meme';
await message.channel.send(imageUrl);
```

### Fetch in JavaScript
```javascript
const response = await fetch(
  'https://nextjs-boilerplate-eight-psi-91.vercel.app/api/mongo/posts?api=true&tags=nature&limit=5'
);
const imageUrls = await response.json(); // Array of URLs
console.log(imageUrls); // ["https://...", "https://...", ...]
```

---

## Rate Limits & Best Practices

- **No authentication required** for GET requests
- **Read-only access** - POST, PATCH, and DELETE are restricted to the application owner
- **Recommended limit**: Keep `limit` parameter ≤ 40 for optimal performance
- **Caching**: Consider caching responses on your end to reduce API calls
- **Pagination**: Use pagination for large result sets instead of high limit values

---

## Notes

- The API returns images hosted on UploadThing CDN
- All dates are in ISO 8601 format
- Tag matching is case-sensitive
- Images are filtered and ranked in real-time based on current vote counts
- Maximum 1000 posts are evaluated for ranking (performance optimization)


