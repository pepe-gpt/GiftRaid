import { supabase } from '../lib/supabase';
import { useEffect, useState, useCallback } from 'react';

interface Boss {
  id: string;
  name: string;
  hp_max: number;
  hp_current: number;
  image_url?: string;
}

export default function BattlePage() {
  const [boss, setBoss] = useState<Boss | null>(null);
  const [loading, setLoading] = useState(true);
  const [clickCooldown, setClickCooldown] = useState(false);
  const [telegramUserId, setTelegramUserId] = useState<string | null>(null);
  const [effect, setEffect] = useState<'crit' | 'miss' | 'normal' | null>(null);
  const [lastDamage, setLastDamage] = useState<number>(0); // для отображения урона

  // Получить текущего активного босса
  const fetchBoss = async () => {
    const { data } = await supabase
      .from('bosses')
      .select('*')
      .eq('is_active', true)
      .order('starts_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data) setBoss(data);
    setLoading(false);
  };

  // Атака по боссу
  const attackBoss = useCallback(async () => {
    if (!boss || clickCooldown || !telegramUserId) return;
    setClickCooldown(true);

    const random = Math.random();
    const damage = random < 0.1 ? 0 : random < 0.3 ? 50 : 10;
    const is_crit = damage === 50;
    const is_miss = damage === 0;

    setLastDamage(damage); // сохранить урон для визуального эффекта
    setEffect(is_crit ? 'crit' : is_miss ? 'miss' : 'normal');

    // Отладка: что мы отправляем
    console.log('sending attack:', {
      boss_id: boss.id,
      user_id: telegramUserId,
      damage,
      is_crit,
      is_miss,
    });

    // Вставка атаки в Supabase
    const { error } = await supabase
      .from('attacks')
      .insert({
        boss_id: boss.id,
        user_id: telegramUserId,
        damage,
        is_crit,
        is_miss,
      });

    if (error) {
      console.error('Ошибка при вставке атаки:', error.message);
    }

    // Через 0.5 сек убрать эффект и разблокировать клик
    setTimeout(() => {
      setClickCooldown(false);
      setEffect(null);
    }, 500);
  }, [boss, clickCooldown, telegramUserId]);

  // Инициализация
  useEffect(() => {
    fetchBoss();

    // Подписка на обновления босса
    const channel = supabase
      .channel('bosses-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bosses',
          filter: 'is_active=eq.true',
        },
        (payload) => {
          setBoss(payload.new as Boss);
        }
      )
      .subscribe();

    // Telegram WebApp авторизация
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user?.id) {
        setTelegramUserId(String(user.id)); // Приведение к строке
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Загрузка
  if (loading || !boss) return <div>Загрузка...</div>;

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h1>{boss.name}</h1>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={boss.image_url || '/assets/ui/boss-default.png'}
          alt="boss"
          width={200}
          height={200}
          onClick={attackBoss}
          style={{ cursor: 'pointer' }}
        />

        {/* Эффект урона */}
        {effect && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '24px',
              fontWeight: 'bold',
              color:
                effect === 'crit' ? 'red' : effect === 'miss' ? 'gray' : 'white',
              textShadow: '1px 1px 3px black',
            }}
          >
            {effect === 'crit'
              ? `КРИТ! -${lastDamage}`
              : effect === 'miss'
              ? 'ПРОМАХ'
              : `-${lastDamage}`}
          </div>
        )}
      </div>

      {/* ХП босса */}
      <div style={{ marginTop: 20 }}>
        <progress
          value={boss.hp_current}
          max={boss.hp_max}
          style={{ width: '100%' }}
        />
        <p>
          HP: {boss.hp_current} / {boss.hp_max}
        </p>
      </div>
    </div>
  );
}
