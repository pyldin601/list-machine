export default () => {
  if (typeof global === 'object') {
    return global;
  }
  if (typeof window === 'object') {
    return window;
  }
  throw new Error('Unknown environment');
};
