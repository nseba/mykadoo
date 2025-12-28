/**
 * Custom Image Loader for CDN Integration
 *
 * This loader is used when CDN_URL is set in production.
 * It transforms image URLs to use the CDN for optimized delivery.
 *
 * Supports:
 * - Cloudflare Images
 * - CloudFront with Lambda@Edge
 * - Imgix
 * - Cloudinary
 */

const CDN_URL = process.env.CDN_URL || '';
const CDN_PROVIDER = process.env.CDN_PROVIDER || 'cloudfront';

/**
 * @param {Object} params
 * @param {string} params.src - Source image URL
 * @param {number} params.width - Desired width
 * @param {number} [params.quality] - Image quality (1-100)
 * @returns {string} - Transformed CDN URL
 */
function imageLoader({ src, width, quality }) {
  // Default quality
  const q = quality || 75;

  // If no CDN URL, return original source
  if (!CDN_URL) {
    return src;
  }

  // Handle absolute URLs
  if (src.startsWith('http://') || src.startsWith('https://')) {
    // For external images, encode the URL
    const encodedSrc = encodeURIComponent(src);
    return getCdnUrl(encodedSrc, width, q, true);
  }

  // Handle relative URLs (local images)
  return getCdnUrl(src, width, q, false);
}

/**
 * Generate CDN URL based on provider
 */
function getCdnUrl(src, width, quality, _isExternal) {
  switch (CDN_PROVIDER) {
    case 'cloudflare':
      return cloudflareLoader(src, width, quality);

    case 'cloudfront':
      return cloudfrontLoader(src, width, quality);

    case 'imgix':
      return imgixLoader(src, width, quality);

    case 'cloudinary':
      return cloudinaryLoader(src, width, quality);

    default:
      return `${CDN_URL}${src}?w=${width}&q=${quality}`;
  }
}

/**
 * Cloudflare Images URL format
 */
function cloudflareLoader(src, width, quality) {
  const params = [
    `width=${width}`,
    `quality=${quality}`,
    'format=auto',
  ].join(',');

  return `${CDN_URL}/cdn-cgi/image/${params}${src}`;
}

/**
 * CloudFront with image optimization Lambda@Edge
 */
function cloudfrontLoader(src, width, quality) {
  const params = new URLSearchParams({
    w: width.toString(),
    q: quality.toString(),
    f: 'auto',
  });

  return `${CDN_URL}${src}?${params.toString()}`;
}

/**
 * Imgix URL format
 */
function imgixLoader(src, width, quality) {
  const params = new URLSearchParams({
    w: width.toString(),
    q: quality.toString(),
    auto: 'format,compress',
    fit: 'max',
  });

  return `${CDN_URL}${src}?${params.toString()}`;
}

/**
 * Cloudinary URL format
 */
function cloudinaryLoader(src, width, quality) {
  const transformations = [
    `w_${width}`,
    `q_${quality}`,
    'f_auto',
    'c_limit',
  ].join(',');

  // Cloudinary format: /image/upload/{transformations}/{path}
  return `${CDN_URL}/image/upload/${transformations}${src}`;
}

module.exports = imageLoader;
