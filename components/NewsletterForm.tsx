'use client';

import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setMessage('Subscribed successfully!');
      setEmail('');
    } else {
      setMessage('Failed to subscribe.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 px-4 py-2 border rounded"
        required
      />
      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded">
        Subscribe
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
