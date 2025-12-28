/* eslint-disable */
// Mock for next/link
const NextLink = ({ children, href, ...props }) => {
  return <a href={href} {...props}>{children}</a>;
};

module.exports = NextLink;
module.exports.default = NextLink;
