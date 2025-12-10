// lib/fetcher.ts
export const fetcher = async (url: string) => {
  // SESUAIKAN: Dapatkan token Anda dari mana pun Anda menyimpannya
  const token = localStorage.getItem('token'); 

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // Kirim token jika ada
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    (error as any).info = await res.json();
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};