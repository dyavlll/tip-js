export class ApiError extends Error {
  constructor(message, { kind, status = null, code = null, details = null, url = null, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    Object.assign(this, { name: "ApiError", kind, status, code, details, url });
  }
}
export function buildUrl(baseUrl, path, query = {}) {
  let configured;
  try { configured = new URL(baseUrl); } catch { throw new TypeError("Нужен абсолютный URL API"); }
  if (!["http:", "https:"].includes(configured.protocol) || configured.search || configured.hash) {
    throw new TypeError("Некорректный адрес API");
  }
  const url = new URL(baseUrl.replace(/\/$/, "") + "/" + path.replace(/^\//, ""));
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.href;
}
export function createApiClient({ baseUrl, fetchFn = globalThis.fetch, timeoutMs = 3000 } = {}) {
  let base;
  try { base = new URL(baseUrl); } catch { throw new TypeError("Нужен абсолютный URL API"); }
  if (!["http:", "https:"].includes(base.protocol) || base.search || base.hash || typeof fetchFn !== "function"
      || !Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new TypeError("Некорректная конфигурация клиента");
  return { async requestJson(path, { method = "GET", query = {}, body, signal, timeoutMs: limit = timeoutMs } = {}) {
    method = method.toUpperCase();
    if (!["GET", "POST", "PATCH", "DELETE"].includes(method) || (method === "GET" && body !== undefined)) throw new TypeError("Некорректный метод или тело GET");
    if (!Number.isSafeInteger(limit) || limit <= 0) throw new TypeError("Некорректный тайм-аут");
    const url = buildUrl(base.href, path, query);
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, limit);
    try {
      const headers = { Accept: "application/json" };
      const options = { method, headers, signal: controller.signal };
      if (body !== undefined) { headers["Content-Type"] = "application/json"; options.body = JSON.stringify(body); }
      const response = await fetchFn(url, options);
      if (!response || typeof response.ok !== "boolean" || typeof response.status !== "number"
          || typeof response.headers?.get !== "function" || typeof response.json !== "function") {
        throw new ApiError("Неверный объект ответа", { kind: "invalid-response", url });
      }
      if (!response.ok) {
        let payload = null;
        try { payload = await response.json(); } catch { /* Тело HTTP-ошибки может не быть JSON. */ }
        throw new ApiError(payload?.error?.message ?? `HTTP ${response.status}`, {
          kind: "http", status: response.status, code: payload?.error?.code ?? null,
          details: payload?.error?.details ?? null, url,
        });
      }
      if (response.status === 204) return null;
      if (!response.headers.get("content-type")?.toLowerCase().includes("application/json")) {
        throw new ApiError("Ожидался JSON", { kind: "invalid-response", url });
      }
      try { return await response.json(); }
      catch (cause) {
        if (controller.signal.aborted) throw cause;
        throw new ApiError("Повреждённый JSON", { kind: "invalid-response", url, cause });
      }
    } catch (cause) {
      if (cause instanceof ApiError) throw cause;
      const kind = timedOut ? "timeout" : signal?.aborted ? "aborted" : "network";
      throw new ApiError(timedOut ? "Превышено время ожидания" : `Ошибка запроса: ${kind}`, { kind, url, cause });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  } };
}
