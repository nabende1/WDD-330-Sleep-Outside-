// src/js/ExternalServices.mjs
// Fully cleaned + error-normalized backend adapter

const baseURL =
  import.meta?.env?.VITE_SERVER_URL ||
  "https://wdd330-backend.onrender.com/";

// -------------------------------
// Normalize backend error object
// -------------------------------
function normalizeBackendError(json, status) {
  if (!json) return `Server returned status ${status}`;

  // Error message is plain string
  if (typeof json === "string") return json;

  // Backend returns wrapped error message:
  // { message: "Card expired" }
  if (json.message && typeof json.message === "string") return json.message;

  // Validation object:
  // { cardNumber: "Invalid", expiration: "Card expired" }
  if (typeof json === "object") {
    return Object.entries(json)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  }

  return `Unexpected server error (status ${status})`;
}

// -------------------------------
// Convert to JSON safely
// -------------------------------
async function convertToJson(res) {
  let body;

  try {
    body = await res.json();
  } catch {
    body = { message: "Invalid JSON returned from server." };
  }

  if (res.ok) return body;

  // ❌ Normalize ANY backend error into plain text
  const cleanMessage = normalizeBackendError(body, res.status);

  throw {
    name: "servicesError",
    message: cleanMessage,
    status: res.status
  };
}

// -------------------------------
// Extract array-like API responses
// -------------------------------
function extractArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  return (
    data.Result ||
    data.results ||
    data.items ||
    data.products ||
    data.data ||
    []
  );
}

export default class ExternalServices {
  async getData(category) {
    const url = `${baseURL.replace(/\/$/, "")}/products/search/${encodeURIComponent(
      category
    )}`;

    const res = await fetch(url);
    const json = await convertToJson(res);
    return extractArray(json);
  }

  async searchProducts(query) {
    const url = `${baseURL.replace(
      /\/$/,
      ""
    )}/products/search?q=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    const json = await convertToJson(res);
    return extractArray(json);
  }

  async findProductById(id) {
    const url = `${baseURL.replace(/\/$/, "")}/product/${encodeURIComponent(
      id
    )}`;
    const res = await fetch(url);
    return convertToJson(res);
  }

  async checkout(payload) {
    const res = await fetch(`${baseURL.replace(/\/$/, "")}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return convertToJson(res);
  }
}
