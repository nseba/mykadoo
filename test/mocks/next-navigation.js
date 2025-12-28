/* eslint-disable */
// Mock for next/navigation

const usePathname = () => '/';
const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
});
const useSearchParams = () => new URLSearchParams();
const useParams = () => ({});
const redirect = jest.fn();
const notFound = jest.fn();

module.exports = {
  usePathname,
  useRouter,
  useSearchParams,
  useParams,
  redirect,
  notFound,
};
