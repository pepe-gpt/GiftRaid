// pages/battle.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

interface Boss {
  id: string;
  name: string;
  hp_max: number;
  hp_current: number;
  image_url?: string;
  scenario_id: string;
}

interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

export default function BattlePage() {
  const [boss, setBoss] = useState<Boss | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser?.id) {
        setUser({
          id: tgUser.id,
          first_name: tgUser.first_name,
          username: tgUser.username,
        });
      }
    }
  }, []);

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAttack = () => {
    setQuestionOpen(true);
    setResultText(null);
  };

  const handleChoice = async (choice: number) => {
    if (!boss || !user) return;
    setQuestionOpen(false);
    setResultText('Определяем результат...');

    try {
      const res = await fetch('https://tyvjdugqmlzshbamrrxq.supabase.co/functions/v1/smooth-handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          boss_id: boss.id,
          scenario_id: boss.scenario_id,
          option_index: choice,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResultText(data.message);
      } else {
        setResultText(data.error || 'Ошибка при атаке.');
      }
    } catch (err) {
      setResultText('Ошибка при соединении.');
    }
  };

  if (loading || !boss || !user) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>{boss.name}</h1>
      <img src={boss.image_url || '/assets/ui/boss-default.png'} width={200} height={200} alt="boss" />

      <div style={{ marginTop: 20 }}>
        <progress value={boss.hp_current} max={boss.hp_max} style={{ width: '100%' }} />
        <p>HP: {boss.hp_current} / {boss.hp_max}</p>
      </div>

      {!questionOpen && !resultText && (
        <button onClick={handleAttack}>⚔️ Атаковать</button>
      )}

      {questionOpen && (
        <div style={{ marginTop: 20 }}>
          <p>Торт взвыл и поднял кремовый щит! Что ты сделаешь?</p>
          <button onClick={() => handleChoice(0)}>🍴 Воткнуть вилку сбоку</button><br />
          <button onClick={() => handleChoice(1)}>🧁 Засыпать пудрой</button><br />
          <button onClick={() => handleChoice(2)}>🕺 Танец взбитых сливок</button>
        </div>
      )}

      {resultText && (
        <p style={{ marginTop: 20, fontWeight: 'bold' }}>{resultText}</p>
      )}

      <div style={{ marginTop: 30 }}>
        <button onClick={() => router.push('/')}>Назад</button>
      </div>
    </div>
  );
}
