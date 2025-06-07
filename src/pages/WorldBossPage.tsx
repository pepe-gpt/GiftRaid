import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface WorldBoss {
  id: string;
  name: string;
  day: number;
  start_at: string;
  image_alive: string;
  image_defeat: string;
  max_hp: number;
  current_hp: number;
  is_defeated: boolean;
  reward_pool: number;
  end_time: string;
}

export const WorldBossPage = () => {
  const [boss, setBoss] = useState<WorldBoss | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState('—');

  const fetchBoss = async () => {
    const { data: nowData, error: nowError } = await supabase.rpc('get_utc_now');
    if (nowError || !nowData) {
      console.error('Ошибка получения времени сервера:', nowError);
      return;
    }

    const now = new Date(nowData);
    const currentDay = now.getUTCDay(); // 0 (вс) до 6 (сб)

    const { data, error } = await supabase
      .from('world_bosses')
      .select('*')
      .eq('day', currentDay)
      .lte('start_at', now.toISOString())
      .order('start_at', { ascending: false }) // <-- правильное поле
      .limit(1)
      .single();

    if (error) {
      console.error('Ошибка получения босса:', error.message);
    }

    if (data) setBoss(data);
    setLoading(false);
  };

  const updateTimer = () => {
    if (!boss || !boss.end_time) {
      setTimer('Ожидается следующий босс...');
      return;
    }

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

  if (loading || !boss) return <div className="p-4 text-center">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Мировой Босс</h1>

      <div className="flex justify-center mb-4">
        <img
          src={boss.is_defeated ? boss.image_defeat : boss.image_alive}
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
        {boss.is_defeated ? 'Босс повержен!' : `До конца битвы: ${timer}`}
      </p>

      <div className="mt-6 text-center text-sm text-gray-400">
        Вознаграждение: {boss.reward_pool?.toLocaleString() ?? 0} токенов
      </div>
    </div>
  );
};
