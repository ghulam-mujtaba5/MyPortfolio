/**
 * Utility functions for date formatting that work consistently 
 * across server and client environments to prevent hydration errors
 */

/**
 * Format a date as DD/MM/YYYY consistently across server and client
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string (DD/MM/YYYY)
 */
export const formatDateConsistent = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format a date in ISO format for datetime attributes
 * @param {string|Date} date - The date to format
 * @returns {string} - ISO formatted date string
 */
export const formatDateISO = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toISOString();
};

/**
 * Get a human-readable relative time (e.g., "2 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};