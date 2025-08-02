// Only used in Node.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const Backendaxios = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:5000',
  withCredentials: true
});

export default Backendaxios;
