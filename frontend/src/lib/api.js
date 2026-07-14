const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_URL}${path}` , {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
    }
    return res.json();
}