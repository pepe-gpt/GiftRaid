// src/pages/BattlePage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BattleMiniGame } from '../components/BattleMiniGame';
import type { TelegramUser } from '../types';

interface WorldBoss {
  id: string;
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
    const { data, error } = await supabase
      .from('world_bosses')
      .select('*')
      .order('start_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Ошибка получения босса:', error);
      return;
    }

    if (data) setBoss(data);
    setLoading(false);
  };

  const updateTimer = () => {
    if (!boss) return;
    const end = new Date(boss.end_time).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return setTimer('Ожидается следующий босс...');

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setTimer(`${hours}ч ${minutes}м ${seconds}с`);
  };

  useEffect(() => {
    fetchBoss();
  }, []);

  useEffect(() => {
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [boss]);

  const handleDamage = async (_damage: number) => {
    setIsHit(true);
    setTimeout(() => setIsHit(false), 300);
    await fetchBoss(); // обновить HP после удара
  };

  if (loading || !boss) return <div className="p-4 text-center">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Мировой Босс</h1>

      <div className="flex justify-center mb-4">
        <img
          src={boss.is_defeated ? boss.image_defeated : boss.image_alive}
          alt="Босс"
          className={`w-64 h-64 object-contain ${isHit ? 'animate-shake animate-flash' : ''}`}
        />
      </div>

      <div className="bg-gray-300 h-6 w-full rounded mb-2 overflow-hidden">
        <div
          className="bg-red-600 h-full transition-all duration-300"
          style={{ width: `${(boss.current_hp / boss.max_hp) * 100}%` }}
        ></div>
      </div>

      <p className="text-center text-sm text-gray-600 mb-2">
        HP: {boss.current_hp} / {boss.max_hp}
      </p>

      <p className="text-center text-sm text-gray-600 mb-4">
        {boss.is_defeated ? 'Босс повержен!' : `До конца битвы: ${timer}`}
      </p>

      {!boss.is_defeated && (
        <BattleMiniGame
          bossId={boss.id}
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
