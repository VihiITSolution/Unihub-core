// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://unihub-backend:3000/api';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://unihub-backend:3000';

// Local Storage Keys
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_data';
