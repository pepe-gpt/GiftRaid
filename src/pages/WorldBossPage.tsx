// ✅ WorldBossPage.tsx с серверным временем и безопасными запросами
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface WorldBoss {
  id: string;
  name: string;
  day: number;
  start_at: string;
  image_alive: string;
  image_defeated: string;
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
  const [serverNow, setServerNow] = useState<Date | null>(null);

  const fetchBoss = async () => {
    const { data: nowData, error: nowError } = await supabase.rpc('get_utc_now');
    if (nowError || !nowData) {
      console.error('Ошибка получения времени сервера:', nowError);
      return;
    }

    const now = new Date(nowData + 'Z');
    setServerNow(now);

    const { data: activeBosses, error: activeError } = await supabase
      .from('world_bosses')
      .select('*', { head: false })
      .filter('start_at', 'lte', now.toISOString())
      .filter('end_time', 'gt', now.toISOString())
      .eq('is_defeated', false)
      .order('start_at', { ascending: false })
      .limit(1);

    if (activeError) {
      console.error('Ошибка запроса активного босса:', activeError.message);
    }

    if (activeBosses && activeBosses.length > 0) {
      setBoss(activeBosses[0]);
      setLoading(false);
      return;
    }

    const { data: nextBosses, error: nextError } = await supabase
      .from('world_bosses')
      .select('*', { head: false })
      .filter('start_at', 'gte', now.toISOString())
      .order('start_at', { ascending: true })
      .limit(1);

    if (nextError) {
      console.error('Ошибка запроса следующего босса:', nextError.message);
    }

    if (nextBosses && nextBosses.length > 0) setBoss(nextBosses[0]);
    else console.warn('Боссов не найдено');

    setLoading(false);
  };

  const updateTimer = () => {
    if (!boss || !serverNow) {
      setTimer('Ожидается следующий босс...');
      return;
    }

    const now = new Date(serverNow.getTime() + 1000);
    setServerNow(now);
    const end = new Date(boss.end_time).getTime();
    const diff = end - now.getTime();

    if (diff <= 0 || boss.current_hp <= 0 || boss.is_defeated) {
      setTimer('Босс повержен!');
    } else {
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimer(`${h}ч ${m}м ${s}с`);
    }
  };

  useEffect(() => {
    fetchBoss();
  }, []);

  useEffect(() => {
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [boss, serverNow]);

  if (loading || !boss) return <div className="p-4 text-center">Загрузка...</div>;
  const isDead = boss.current_hp <= 0 || boss.is_defeated;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Мировой Босс</h1>

      <div className="flex justify-center mb-4">
        <img
          src={isDead ? boss.image_defeated : boss.image_alive}
          alt="Босс"
          className="w-64 h-64 object-contain"
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

      <p className="text-center text-sm text-gray-600 mb-4">{timer}</p>

      <div className="mt-6 text-center text-sm text-gray-400">
        Вознаграждение: {(boss.reward_pool || 0).toLocaleString()} токенов
      </div>
    </div>
  );
};
