import { supabase } from '../lib/supabase';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';

interface Boss {
  id: string;
  name: string;
  hp_max: number;
  hp_current: number;
  image_url?: string;
}

export default function BattlePage() {
  const router = useRouter();

  const [boss, setBoss] = useState<Boss | null>(null);
  const [loading, setLoading] = useState(true);
  const [telegramUserId, setTelegramUserId] = useState<string | null>(null);
  const [effect, setEffect] = useState<'crit' | 'miss' | 'normal' | null>(null);
  const [lastDamage, setLastDamage] = useState<number>(0);

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

  const attackBoss = useCallback(() => {
    if (!boss || !telegramUserId || boss.hp_current <= 0) return;

    const random = Math.random();
    const damage = random < 0.1 ? 0 : random < 0.3 ? 50 : 10;
    const is_crit = damage === 50;
    const is_miss = damage === 0;

    setLastDamage(damage);
    setEffect(is_crit ? 'crit' : is_miss ? 'miss' : 'normal');

    // Отображение урона (независимо от состояния базы)
    if (!is_miss) {
      setBoss(prev =>
        prev ? { ...prev, hp_current: Math.max(prev.hp_current - damage, 0) } : prev
      );
    }

    // Сброс эффекта
    setTimeout(() => setEffect(null), 300);

    // Получить user_id по telegram_id и записать атаку
    (async () => {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', telegramUserId)
        .maybeSingle();

      if (userError || !user) {
        console.error('❌ Пользователь не найден в таблице users:', userError);
        return;
      }

      const { error } = await supabase.from('attacks').insert({
        boss_id: boss.id,
        user_id: user.id,
        damage,
        is_crit,
        is_miss,
      });

      if (error) {
        console.error('❌ Ошибка при вставке атаки:', error.message);
      } else {
        fetchBoss(); // Перезапрашиваем состояние босса после атаки
      }
    })();
  }, [boss, telegramUserId]);

  const createTestBoss = async () => {
    const { error } = await supabase.from('bosses').insert({
      name: 'Тест-босс',
      hp_max: 1000,
      hp_current: 1000,
      is_active: true,
      starts_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Ошибка при создании босса:', error.message);
    } else {
      fetchBoss();
    }
  };

  useEffect(() => {
    fetchBoss();

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

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user?.id) {
        setTelegramUserId(String(user.id));
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading || !boss) return <div>Загрузка...</div>;

  const isBossDead = boss.hp_current <= 0;

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
          style={{
            cursor: isBossDead ? 'not-allowed' : 'pointer',
            opacity: isBossDead ? 0.5 : 1,
          }}
        />

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

      {isBossDead && (
        <p style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>
          Босс повержен!
        </p>
      )}

      <div style={{ marginTop: 30 }}>
        <button onClick={() => router.push('/')}>Назад</button>
      </div>
    </div>
  );
}
