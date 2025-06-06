import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';


interface WorldBoss {
  id: number;
  name: string;
  max_hp: number;
  current_hp: number;
  reward_pool: number;
  alive_image_url: string;
  defeated_image_url: string;
  is_defeated: boolean;
  end_time: string;
}

export const WorldBossPage = () => {
  const [boss, setBoss] = useState<WorldBoss | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState('');

  const fetchBoss = async () => {
    const { data, error } = await supabase
      .from('world_bosses')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(1)
      .single();

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
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [boss]);

  if (loading || !boss) return <div className="p-4 text-center">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Мировой Босс</h1>

      <div className="flex justify-center mb-4">
        <img
          src={boss.is_defeated ? boss.defeated_image_url : boss.alive_image_url}
          alt="Босс"
          className="w-64 h-64 object-contain"
        />
      </div>

      <div className="bg-gray-300 h-6 w-full rounded mb-2 overflow-hidden">
        <div
          className="bg-red-600 h-full"
          style={{ width: `${(boss.current_hp / boss.max_hp) * 100}%` }}
        ></div>
      </div>

      <p className="text-center text-sm text-gray-600 mb-2">
        HP: {boss.current_hp} / {boss.max_hp}
      </p>

      <p className="text-center text-sm text-gray-600 mb-4">
        До следующего босса: {timer}
      </p>

      {/* Здесь будет кнопка атаки */}
      {/* Здесь будет мини-лидерборд */}

      <div className="mt-6 text-center text-sm text-gray-400">
        Вознаграждение: {boss.reward_pool.toLocaleString()} токенов
      </div>
    </div>
  );
};
