import React from 'react';
import fallbackImage from '../assets/images/novel_default.png';

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
