import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [createdBossId, setCreatedBossId] = useState<string | null>(null);
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
          .select('id')
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Ошибка при сохранении пользователя:', error);
            } else {
              console.log('UUID пользователя в базе:', data?.id);
            }
          });
      }
    } else {
      console.warn('Telegram WebApp SDK недоступен');
    }
  }, []);

  const createTestBoss = async () => {
    const { data, error } = await supabase
      .from('bosses')
      .insert({
        name: 'Тест-босс',
        hp_max: 1000,
        hp_current: 1000,
        is_active: true,
        starts_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Ошибка при создании босса:', error.message);
      alert('Ошибка при создании босса');
    } else {
      setCreatedBossId(data.id);
      alert('Босс создан! Нажми "Перейти к бою".');
    }
  };

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
        onClick={() => {
          if (createdBossId) {
            router.push(`/battle?boss_id=${createdBossId}`);
          } else {
            router.push('/battle');
          }
        }}
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

      <button
        onClick={createTestBoss}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Создать нового босса (тест)
      </button>
    </div>
  );
}
