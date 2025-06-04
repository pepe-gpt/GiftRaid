// src/pages/index.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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
  const [uuid, setUuid] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const telegramUser = tg.initDataUnsafe?.user;
      console.log('Telegram SDK доступен:', tg);
      console.log('Пользователь:', telegramUser);

      if (telegramUser) {
        setUser(telegramUser);

        // Вставляем или обновляем пользователя по telegram_id
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
          .then(async ({ error }) => {
            if (error) {
              console.error('Ошибка при сохранении пользователя:', error);
            } else {
              // Получаем UUID по telegram_id
              const { data, error: fetchError } = await supabase
                .from('users')
                .select('id')
                .eq('telegram_id', telegramUser.id)
                .single();

              if (fetchError) {
                console.error('Ошибка при получении UUID:', fetchError);
              } else if (data?.id) {
                setUuid(data.id);
                localStorage.setItem('user_uuid', data.id); // можно использовать потом
              }
            }
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
    </div>
  );
}
