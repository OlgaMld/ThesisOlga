const API_BASE_URL = "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api`;

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Αποτυχία αιτήματος.");
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body, extra = {}) =>
    request(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...extra
    })
};

export function getUploadUrl(filePath) {
  if (!filePath) {
    return "#";
  }

  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
