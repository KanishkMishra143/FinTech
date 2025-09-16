export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}
