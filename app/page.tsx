import { redirect } from 'next/navigation';

export default function Home() {
  // Langsung lempar ke halaman login
  redirect('/login');
}