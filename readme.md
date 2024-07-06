# Reqiox

Reqiox is a flexible and feature-rich library for making HTTP requests in JavaScript applications. It provides capabilities for request interception, response interception, request cancellation, retry mechanisms, and caching.

## Features

- **Request Methods**: Supports GET, POST, PUT, DELETE methods.
- **Request Interceptors**: Customize or transform requests before they are sent.
- **Response Interceptors**: Handle and modify responses received from requests.
- **AbortController**: Cancel ongoing requests gracefully using AbortController.
- **Retry Mechanism**: Automatic retry with exponential backoff for failed requests.
- **Caching**: In-memory caching of responses with configurable expiration.

## Installation

Install Reqiox via npm:

```bash
npm install reqiox --save
```

```javascript

import ReqioxClient from 'reqiox';

// Initialize ReqioxClient with base URL
const api = new ReqioxClient('https://api.example.com');

// Add request interceptors (optional)
api.addRequestInterceptor(async (options) => {
  // Modify headers, add authentication tokens, etc.
  return options;
});

// Add response interceptors (optional)
api.addResponseInterceptor(async (response) => {
  // Handle global error responses, transform data, etc.
  return response;
});

// Make GET request
api.get('/posts')
  .then(data => console.log('GET Response:', data))
  .catch(error => console.error('GET Error:', error));

// Make POST request
api.post('/posts', { title: 'New Post', body: 'Content' })
  .then(data => console.log('POST Response:', data))
  .catch(error => console.error('POST Error:', error));

// Cancel a request
api.cancelRequest('/posts', 'GET');

// Clear cache for a specific endpoint
api.clearCache('/posts');

// Retry a request with exponential backoff
api.requestWithRetry('/posts', { method: 'GET' })
  .then(data => console.log('Retry Response:', data))
  .catch(error => console.error('Retry Error:', error));

```

# Library Reference


## `new ReqioxClient(baseURL)`

Creates a new instance of ReqioxClient with the specified base URL.

- `baseURL`: Base URL for API requests.

---

## `api.addRequestInterceptor(interceptor)`

Adds a request interceptor function that will be called before sending a request.

- `interceptor`: Function that receives the current request options and returns modified options.

---

## `api.addResponseInterceptor(interceptor)`

Adds a response interceptor function that will be called when a response is received.

- `interceptor`: Function that receives the response object and returns modified response or handles errors.

---

## HTTP Methods

### `api.get(endpoint, options)`

Makes a GET request to the specified endpoint.

- `endpoint`: API endpoint.
- `options`: Optional request options (e.g., headers, timeout).

---

### `api.post(endpoint, body, options)`

Makes a POST request to the specified endpoint.

- `endpoint`: API endpoint.
- `body`: Request body object.
- `options`: Optional request options (e.g., headers, timeout).

---

### `api.put(endpoint, body, options)`

Makes a PUT request to the specified endpoint.

- `endpoint`: API endpoint.
- `body`: Request body object.
- `options`: Optional request options (e.g., headers, timeout).

---

### `api.delete(endpoint, options)`

Makes a DELETE request to the specified endpoint.

- `endpoint`: API endpoint.
- `options`: Optional request options (e.g., headers, timeout).

---

## Other Methods

### `api.cancelRequest(endpoint, method)`

Cancels an ongoing request with the specified endpoint and HTTP method.

- `endpoint`: API endpoint.
- `method`: HTTP method (e.g., GET, POST).

---

### `api.clearCache(endpoint)`

Clears cached response for the specified endpoint.

- `endpoint`: API endpoint.

---

### `api.requestWithRetry(endpoint, options, retries)`

Retries a failed request with exponential backoff.

- `endpoint`: API endpoint.
- `options`: Optional request options (e.g., headers, timeout).
- `retries`: Optional number of retry attempts (default: 3).

