import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    console.log('Telegram SDK:', window.Telegram.WebApp);
    console.log('initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe);
  } else {
    console.log('Telegram WebApp SDK not available');
  }

    if (telegramUser) {
      setUser(telegramUser);

      supabase.from('users').upsert(
  [
    {
      telegram_id: telegramUser.id,
      first_name: telegramUser.first_name,
      username: telegramUser.username,
      photo_url: telegramUser.photo_url,
    },
  ],
  { onConflict: 'telegram_id' }
);

    }
  }, []);

  if (!user) return <p>Загрузка Telegram...</p>;

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Привет, {user.first_name}!</h1>
      <p>Ты авторизован через Telegram</p>
      {user.photo_url && (
        <img
          src={user.photo_url}
          width={100}
          style={{ borderRadius: '50%' }}
          alt="avatar"
        />
      )}
    </div>
  );
}
