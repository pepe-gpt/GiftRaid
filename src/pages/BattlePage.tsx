import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BattleMiniGame } from '../components/BattleMiniGame';
import type { TelegramUser } from '../types';

interface WorldBoss {
  id: number;
  name: string;
  max_hp: number;
  current_hp: number;
  reward_pool: number;
  image_alive: string;
  image_defeated: string;
  is_defeated: boolean;
  end_time: string;
}

type BattlePageProps = {
  user: TelegramUser;
};

export const BattlePage: React.FC<BattlePageProps> = ({ user }) => {
  const [boss, setBoss] = useState<WorldBoss | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState('');
  const [isHit, setIsHit] = useState(false);

  const fetchBoss = async () => {
    const { data: nowData, error: nowError } = await supabase.rpc('get_utc_now');
    if (nowError || !nowData) {
      console.error('Ошибка получения времени:', nowError);
      return;
    }

    const now = new Date(nowData + 'Z');

    const { data, error } = await supabase
      .from('world_bosses')
      .select('*')
      .lte('start_at', now.toISOString())
      .gt('end_time', now.toISOString())
      .eq('is_defeated', false)
      .order('start_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Ошибка получения босса:', error);
    }

    if (data) {
      setBoss(data);
    }

    setLoading(false);
  };

  const updateTimer = () => {
    if (!boss) return;
    const end = new Date(boss.end_time).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) {
      setTimer('Ожидается следующий босс...');
    } else {
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimer(`${hours}ч ${minutes}м ${seconds}с`);
    }
  };

  useEffect(() => {
    fetchBoss();
  }, []);

  useEffect(() => {
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [boss]);

  const handleDamage = async (_damage: number) => {
    if (!boss || boss.current_hp <= 0 || boss.is_defeated) return;

    setIsHit(true);
    setTimeout(() => setIsHit(false), 300);
    await fetchBoss(); // обновляем данные после атаки
  };

  if (loading || !boss) return <div className="p-4 text-center">Загрузка...</div>;

  const isDead = boss.current_hp <= 0 || boss.is_defeated;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Мировой Босс</h1>

      <div className="flex justify-center mb-4">
        <img
          src={isDead ? boss.image_defeated : boss.image_alive}
          alt="Босс"
          className={`w-64 h-64 object-contain ${isHit ? 'animate-shake animate-flash' : ''}`}
        />
      </div>

      <div className="bg-gray-300 h-6 w-full rounded mb-2 overflow-hidden">
        <div
          className="bg-red-600 h-full transition-all duration-300"
          style={{ width: `${Math.max(0, (boss.current_hp / boss.max_hp) * 100)}%` }}
        ></div>
      </div>

      <p className="text-center text-sm text-gray-600 mb-2">
        HP: {Math.max(0, boss.current_hp)} / {boss.max_hp}
      </p>

      <p className="text-center text-sm text-gray-600 mb-4">
        {isDead ? 'Босс повержен!' : `До конца битвы: ${timer}`}
      </p>

      {!isDead && (
        <BattleMiniGame
          bossId={String(boss.id)}
          user={user}
          onDamage={handleDamage}
        />
      )}

      <div className="mt-6 text-center text-sm text-gray-400">
        Вознаграждение: {(boss.reward_pool || 0).toLocaleString()} токенов
      </div>
    </div>
  );
};
