// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://unihub.lk/api';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://unihub.lk';

// Unihub-social microservice (wall posts, follows, profile pictures) - a
// separate deployable service from the main backend above. Defaults to the
// same origin under /api/social (single nginx location block in production);
// override for local dev when running the social service on its own port.
export const SOCIAL_API_BASE_URL = process.env.NEXT_PUBLIC_SOCIAL_API_BASE_URL || `${BACKEND_URL}/api/social`;

// Local Storage Keys
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_data';
