import axios from 'axios';

// Creating an axios instance pointing to the API endpoint
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// usage example: await apiClient.get('/products')
