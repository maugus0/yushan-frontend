import React from 'react';
import fallbackImage from '../assets/images/novel_default.png';
import userMaleImage from '../assets/images/user_male.png';
import userFemaleImage from '../assets/images/user_female.png';
import userDefaultImage from '../assets/images/user.png';

/**
 * Handle image loading errors with fallback
 * @param {Event} e - Image error event
 * @param {string} fallback - Optional custom fallback image
 */
export const handleImageError = (e, fallback = fallbackImage) => {
  // Prevent infinite loop if fallback image also fails
  if (e.target.src !== fallback) {
    e.target.src = fallback;
  }
};

/**
 * Validate if a base64 string is a valid image
 * @param {string} base64String - The base64 string to validate
 * @returns {boolean} - True if valid image base64 string
 */
export const isValidBase64Image = (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    return false;
  }

  // Check if it starts with a valid image data URL pattern
  const imageDataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/i;
  return imageDataUrlPattern.test(base64String);
};

/**
 * Process image URL for display with validation and fallback
 * @param {string} imageUrl - The image URL (could be base64, HTTP URL, or relative path)
 * @param {string} baseUrl - Base URL for relative paths
 * @param {string} fallback - Fallback image URL
 * @returns {string} - Processed image URL
 */
export const processImageUrl = (imageUrl, baseUrl = '', fallback = fallbackImage) => {
  // If no image URL provided, return fallback
  if (!imageUrl) {
    return fallback;
  }

  // If it's a base64 string, validate it
  if (imageUrl.startsWith('data:image/')) {
    return isValidBase64Image(imageUrl) ? imageUrl : fallback;
  }

  // If it's already a full URL (starts with http), use it
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If it's a relative path and we have a base URL, construct full URL
  if (baseUrl) {
    return `${baseUrl}/${imageUrl}`;
  }

  // Return as is if no base URL provided
  return imageUrl;
};

/**
 * Create an Image element to preload and validate an image URL
 * @param {string} imageUrl - The image URL to validate
 * @returns {Promise<boolean>} - Promise that resolves to true if image loads successfully
 */
export const validateImageUrl = (imageUrl) => {
  return new Promise((resolve) => {
    // For base64 images, do a quick validation
    if (imageUrl.startsWith('data:image/')) {
      resolve(isValidBase64Image(imageUrl));
      return;
    }

    // For other URLs, try to load the image
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;

    // Set a timeout to avoid hanging
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Get gender-based fallback avatar image
 * @param {number|string} gender - User gender (0=UNKNOWN, 1=MALE, 2=FEMALE, or string like "MALE")
 * @returns {string} - Appropriate fallback image based on gender
 */
export const getGenderBasedAvatar = (gender) => {
  // Handle string gender values from API
  if (typeof gender === 'string') {
    const genderUpper = gender.toUpperCase();
    if (genderUpper === 'MALE') return userMaleImage;
    if (genderUpper === 'FEMALE') return userFemaleImage;
    return userDefaultImage; // UNKNOWN
  }

  // Handle numeric gender values (backend enum codes)
  switch (gender) {
    case 1:
      return userMaleImage; // MALE
    case 2:
      return userFemaleImage; // FEMALE
    case 0:
    default:
      return userDefaultImage; // UNKNOWN
  }
};

/**
 * Process user avatar URL with gender-based fallback
 * @param {string} avatarUrl - The avatar URL (could be base64, HTTP URL, or relative path)
 * @param {number|string} gender - User gender for fallback selection
 * @param {string} baseUrl - Base URL for relative paths
 * @returns {string} - Processed avatar URL
 */
export const processUserAvatar = (avatarUrl, gender, baseUrl = '') => {
  // Get gender-based fallback
  const genderFallback = getGenderBasedAvatar(gender);

  console.log('=== PROCESS USER AVATAR ===');
  console.log('Input avatarUrl:', avatarUrl);
  console.log('Gender:', gender);
  console.log('Base URL:', baseUrl);
  console.log('Gender fallback:', genderFallback);

  // If no avatar URL provided, return gender-based fallback
  if (!avatarUrl) {
    console.log('No avatarUrl, using fallback:', genderFallback);
    return genderFallback;
  }

  // If it's a base64 string, validate it
  if (avatarUrl.startsWith('data:image/')) {
    const isValid = isValidBase64Image(avatarUrl);
    console.log('Base64 image, valid:', isValid);
    return isValid ? avatarUrl : genderFallback;
  }

  // If it's already a full URL (starts with http), use it
  if (avatarUrl.startsWith('http')) {
    console.log('Full HTTP URL, using as-is:', avatarUrl);
    return avatarUrl;
  }

  // If it's a backend default avatar filename (user.png, user_male.png, user_female.png)
  // Return our local gender-based fallback instead
  if (
    avatarUrl === 'user.png' ||
    avatarUrl === 'user_male.png' ||
    avatarUrl === 'user_female.png'
  ) {
    console.log('Backend default avatar filename detected, using local fallback:', genderFallback);
    return genderFallback;
  }

  // If it's a relative path and we have a base URL, construct full URL
  if (baseUrl) {
    const fullUrl = `${baseUrl}/${avatarUrl}`;
    console.log('Relative path with baseUrl, constructing:', fullUrl);
    return fullUrl;
  }

  // For simple filenames like "user.png", return gender-based fallback
  // as we don't have a proper path to resolve it
  if (!avatarUrl.includes('/')) {
    console.log('Simple filename without path, using fallback:', genderFallback);
    return genderFallback;
  }

  // Return as is if it has a path
  console.log('Using avatarUrl as-is:', avatarUrl);
  return avatarUrl;
};

/**
 * React hook for handling image loading with fallback
 * @param {string} src - Image source URL
 * @param {string} fallback - Fallback image URL
 * @returns {object} - Object with src, onError handler, and loading state
 */
export const useImageWithFallback = (src, fallback = fallbackImage) => {
  const [imageSrc, setImageSrc] = React.useState(src || fallback);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImageSrc(src || fallback);
    setIsLoading(true);
    setHasError(false);
  }, [src, fallback]);

  const handleError = React.useCallback(() => {
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
      setHasError(true);
    }
    setIsLoading(false);
  }, [imageSrc, fallback]);

  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    src: imageSrc,
    onError: handleError,
    onLoad: handleLoad,
    isLoading,
    hasError,
  };
};
