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
    // Для TheSportsDB API важно использовать правильные заголовки
    // Сервер может возвращать HTML вместо JSON в зависимости от заголовков
    const headers = options.headers || {};
    
    // Устанавливаем Accept: */* как curl (это помогает получить JSON ответ)
    if (!headers["Accept"] && !headers["accept"]) {
      headers["Accept"] = "*/*";
    }
    
    // Удаляем User-Agent, чтобы сервер не определял нас как браузер
    const finalHeaders = { ...headers };
    delete finalHeaders["User-Agent"];
    delete finalHeaders["user-agent"];

    const response = await fetch(url, {
      ...options,
      headers: finalHeaders,
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
 * Теперь обрабатывает rate limits (429) и другие HTTP ошибки
 * @param {string} url
 * @param {Object} options
 * @param {number} timeout
 * @returns {Promise<Object|null>}
 */
export async function safeFetch(url, options = {}, timeout = 5000) {
  try {
    const response = await fetchWithTimeout(url, options, timeout);

    // Обработка rate limit (429 Too Many Requests)
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") || "60";
      console.warn(
        `Rate limit exceeded for ${url}. Retry after ${retryAfter} seconds`
      );
      return {
        error: "RATE_LIMIT_EXCEEDED",
        status: 429,
        retryAfter: parseInt(retryAfter, 10),
        message: `Rate limit exceeded. Please wait ${retryAfter} seconds.`,
      };
    }

    // Читаем тело ответа один раз (можно прочитать только один раз)
    const contentType = response.headers.get("content-type") || "";
    let responseText = "";
    let responseJson = null;
    
    try {
      responseText = await response.text();
      
      // Пытаемся распарсить как JSON если возможно
      if (contentType.includes("application/json") && responseText) {
        try {
          responseJson = JSON.parse(responseText);
        } catch (e) {
          // Не JSON, оставляем как текст
        }
      } else if (responseText && (responseText.trim().startsWith("{") || responseText.trim().startsWith("["))) {
        // Попробуем распарсить даже если Content-Type не указан как JSON
        // (некоторые API возвращают JSON без правильного заголовка, например TheSportsDB)
        // TheSportsDB может возвращать text/plain с JSON содержимым
        try {
          responseJson = JSON.parse(responseText);
        } catch (e) {
          // Не JSON, оставляем как текст
        }
      }
    } catch (e) {
      // Игнорируем ошибку чтения тела
    }

    if (!response.ok) {
      // Если это JSON ответ с error code (например, TheSportsDB API),
      // возвращаем его как есть, чтобы вызывающий код мог обработать
      if (responseJson && ("error code" in responseJson || "error" in responseJson)) {
        return responseJson;
      }

      // Улучшенное логирование ошибок
      const headers = Object.fromEntries(response.headers.entries());
      const isHtmlResponse = headers["content-type"]?.includes("text/html");
      
      // Для HTML ответов извлекаем только полезную информацию
      let errorSummary = "";
      if (isHtmlResponse && responseText) {
        // Пытаемся найти title или h1 в HTML
        const titleMatch = responseText.match(/<title[^>]*>([^<]+)<\/title>/i);
        const h1Match = responseText.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (titleMatch) errorSummary = titleMatch[1].trim();
        else if (h1Match) errorSummary = h1Match[1].trim();
        else errorSummary = "HTML error page";
      } else if (responseJson) {
        errorSummary = responseJson.message || responseJson.error || JSON.stringify(responseJson).substring(0, 100);
      } else if (responseText && !isHtmlResponse) {
        errorSummary = responseText.substring(0, 200);
      }

      // Структурированный вывод ошибки
      console.error(`[HTTP ${response.status}] ${response.statusText}`);
      console.error(`  URL: ${url}`);
      if (errorSummary) {
        console.error(`  Error: ${errorSummary}`);
      }
      if (response.status === 500) {
        console.error(`  Server error - API may be temporarily unavailable`);
      }

      return {
        error: "HTTP_ERROR",
        status: response.status,
        message: responseJson?.message || responseJson?.error || `${response.status} ${response.statusText}${responseText ? `: ${responseText.substring(0, 100)}` : ""}`,
        body: responseText.substring(0, 500),
        json: responseJson,
      };
    }

    // Успешный ответ
    if (responseJson !== null) {
      return responseJson;
    } else if (contentType.includes("application/json")) {
      // Если Content-Type указывает на JSON, но не удалось распарсить
      console.warn(`Failed to parse JSON from ${url}, Content-Type: ${contentType}`);
      return {
        error: "INVALID_RESPONSE",
        message: `Failed to parse JSON response`,
        body: responseText.substring(0, 500),
      };
    } else {
      // Если не JSON, возвращаем текст
      console.warn(`Non-JSON response from ${url}, Content-Type: ${contentType}`);
      return {
        error: "INVALID_RESPONSE",
        message: `Expected JSON but got ${contentType}`,
        body: responseText.substring(0, 500),
      };
    }
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error.message);
    return {
      error: "FETCH_ERROR",
      message: error.message,
    };
  }
}

