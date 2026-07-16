const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path, options = {}) {
    const isFormData = options.body instanceof FormData;

    const headers = isFormData
        ? { ...options.headers }
        : { 'Content-Type': 'application/json', ...options.headers };

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
    }
    return res.json();
}