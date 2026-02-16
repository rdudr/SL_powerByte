/**
 * Debounce utility for performance optimization
 * Limits function execution to at most once per specified delay
 */

/**
 * Creates a debounced version of a function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {Function} Debounced function
 */
export function debounce(func, delay = 500) {
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(lastThis, lastArgs);
      timeoutId = null;
    }, delay);
  }

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      func.apply(lastThis, lastArgs);
      timeoutId = null;
    }
  };

  return debounced;
}
