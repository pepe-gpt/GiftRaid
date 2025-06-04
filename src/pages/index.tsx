// src/pages/index.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const telegramUser = tg.initDataUnsafe?.user;
      console.log('Telegram SDK доступен:', tg);
      console.log('Пользователь:', telegramUser);

      if (telegramUser) {
        setUser(telegramUser);

        supabase
          .from('users')
          .upsert(
            [{
              telegram_id: telegramUser.id,
              first_name: telegramUser.first_name,
              username: telegramUser.username,
              photo_url: telegramUser.photo_url,
            }],
            { onConflict: 'telegram_id' }
          )
          .then(({ error }) => {
            if (error) console.error('Ошибка при сохранении пользователя:', error);
          });
      }
    } else {
      console.warn('Telegram WebApp SDK недоступен');
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
          height={100}
          style={{ borderRadius: '50%' }}
          alt="avatar"
        />
      )}

      <button
        onClick={() => router.push('/battle')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Перейти к бою с боссом
      </button>
    </div>
  );
}
