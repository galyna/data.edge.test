/**
 * Fetch with timeout support
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    throw error;
  }
}

/**
 * Safe fetch - returns null on error instead of throwing
 * @param {string} url
 * @param {Object} options
 * @param {number} timeout
 * @returns {Promise<Object|null>}
 */
export async function safeFetch(url, options = {}, timeout = 5000) {
  try {
    const response = await fetchWithTimeout(url, options, timeout);

    if (!response.ok) {
      console.error(
        `HTTP Error: ${response.status} ${response.statusText} for ${url}`
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error.message);
    return null;
  }
}

