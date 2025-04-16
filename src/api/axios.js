// src/api/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3500/api',  // Backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
