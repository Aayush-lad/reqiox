// src/fetchify.js

class ReqioClient {
    constructor(baseURL = '') {
      this.baseURL = baseURL;
      this.timeout = 5000; // 5 seconds timeout
      this.requestInterceptors = [];
      this.responseInterceptors = [];
      this.abortControllers = new Map();
      this.cache = new Map(); // In-memory cache
      this.cacheTimeout = 300000; // Default cache timeout in milliseconds (5 minutes)
      this.retryAttempts = 3; // Number of retry attempts
      this.retryDelay = 1000; // Delay between retries in milliseconds
    }
  
    addRequestInterceptor(interceptor) {
      this.requestInterceptors.push(interceptor);
    }
  
    addResponseInterceptor(interceptor) {
      this.responseInterceptors.push(interceptor);
    }
  
    async request(endpoint, options) {
      const url = `${this.baseURL}${endpoint}`;
      const abortController = new AbortController();
      const signal = abortController.signal;
  
      const requestOptions = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal,
      };
  
      try {
        // Apply request interceptors
        let currentOptions = requestOptions;
        for (const interceptor of this.requestInterceptors) {
          currentOptions = await interceptor(currentOptions);
        }
  
        // Create a unique key for this request
        const requestKey = `${requestOptions.method}:${url}`;
        this.abortControllers.set(requestKey, abortController);
  
        // Check cache first
        const cachedResponse = this.cache.get(url);
        if (cachedResponse) {
          const currentTime = new Date().getTime();
          if (currentTime - cachedResponse.timestamp < this.cacheTimeout) {
            return cachedResponse.data;
          } else {
            this.cache.delete(url); // Remove expired cache
          }
        }
  
        const response = await fetch(url, currentOptions);
  
        // Remove the controller once the request completes
        this.abortControllers.delete(requestKey);
  
        // Apply response interceptors
        let responseData = await response.json();
        for (const interceptor of this.responseInterceptors) {
          responseData = await interceptor(responseData);
        }
  
        if (!response.ok) {
          const error = new Error(`HTTP error! Status: ${response.status}`);
          error.response = response;
          throw error;
        }
  
        // Cache the response
        this.cache.set(url, {
          data: responseData,
          timestamp: new Date().getTime(),
        });
  
        return responseData;
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request aborted');
        } else if (error.name === 'FetchError') {
          throw new Error('Network error occurred');
        } else {
          throw error;
        }
      }
    }
  
    get(endpoint, options = {}) {
      return this.request(endpoint, { ...options, method: 'GET', timeout: this.timeout });
    }
  
    post(endpoint, body, options = {}) {
      return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
    }
  
    put(endpoint, body, options = {}) {
      return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
    }
  
    delete(endpoint, options = {}) {
      return this.request(endpoint, { ...options, method: 'DELETE' });
    }
  
    // Method to cancel a request by endpoint and method
    cancelRequest(endpoint, method) {
      const requestKey = `${method}:${this.baseURL}${endpoint}`;
      if (this.abortControllers.has(requestKey)) {
        const abortController = this.abortControllers.get(requestKey);
        abortController.abort();
        this.abortControllers.delete(requestKey);
      }
    }
  
    // Method to clear cache for a specific endpoint
    clearCache(endpoint) {
      const url = `${this.baseURL}${endpoint}`;
      this.cache.delete(url);
    }
  
    async requestWithRetry(endpoint, options, retries = this.retryAttempts) {
      try {
        return await this.request(endpoint, options);
      } catch (error) {
        if (retries > 0) {
          // Retry logic with exponential backoff
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
          console.log(`Retrying request to ${endpoint}. Retries left: ${retries}`);
          return this.requestWithRetry(endpoint, options, retries - 1);
        } else {
          throw error;
        }
      }
    }
  }
  
  export default ReqioClient;
  