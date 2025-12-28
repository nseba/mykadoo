/* eslint-disable */
// Mock for next/image
const NextImage = ({ src, alt, ...props }) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} />;
};

module.exports = NextImage;
module.exports.default = NextImage;
