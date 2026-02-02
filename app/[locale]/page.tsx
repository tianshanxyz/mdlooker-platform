'use client';

import { translations } from '../i18n-config'; // 相对到app/

export default function HomePage() {
  const locale = window.location.pathname.split('/')[1] as keyof typeof translations;
  const t = translations[locale] || translations.en;

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-slate-900 mb-6">{t.hero.title}</h1>
      <p className="text-lg text-slate-600 mb-8">{t.hero.subtitle}</p>
      <input
        type="text"
        placeholder={t.hero.placeholder}
        className="w-full max-w-xl px-6 py-4 rounded-lg border border-slate-300"
      />
    </main>
  );
}
