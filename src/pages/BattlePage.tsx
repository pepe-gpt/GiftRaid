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
  const [balance, setBalance] = useState<number | null>(null);
  const [isHit, setIsHit] = useState(false);

  const fetchBoss = async () => {
    const { data: nowData } = await supabase.rpc('get_utc_now');
    if (!nowData) return;
    const now = new Date(nowData + 'Z');

    const { data, error } = await supabase
      .from('world_bosses')
      .select('*', { head: false })
      .filter('start_at', 'lte', now.toISOString())
      .filter('end_time', 'gt', now.toISOString())
      .filter('is_defeated', 'eq', false)
      .order('start_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Ошибка получения босса:', error);
    }

    if (data) setBoss(data);
    setLoading(false);
  };

  const fetchBalance = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('tokens')
      .eq('telegram_id', user.id)
      .single();

    if (error) {
      console.error('Ошибка получения баланса:', error);
    }

    if (data) setBalance(data.tokens);
  };

  const updateTimer = async () => {
    if (!boss) return;

    const { data: nowData } = await supabase.rpc('get_utc_now');
    if (!nowData) return;

    const now = new Date(nowData + 'Z').getTime();
    const end = new Date(boss.end_time).getTime();
    const diff = end - now;

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
    fetchBalance();
  }, []);

  useEffect(() => {
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [boss]);

  const handleDamage = async () => {
    if (!boss || boss.current_hp <= 0 || boss.is_defeated) return;
    setIsHit(true);
    setTimeout(() => setIsHit(false), 300);
    await fetchBoss();
    await fetchBalance();
  };

  if (loading || !boss) return <div className="p-4 text-center">Загрузка...</div>;
  const isDead = boss.current_hp <= 0 || boss.is_defeated;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Мировой Босс</h1>
        {balance !== null && (
          <div className="flex items-center gap-1 text-yellow-600">
            <img src="/coin.svg" alt="Coin" className="w-5 h-5" />
            <span className="font-semibold">{balance}</span>
          </div>
        )}
      </div>

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

      <p className="text-center text-sm text-gray-600 mb-4">{timer}</p>

      {!isDead && (
        <BattleMiniGame bossId={String(boss.id)} user={user} onDamage={handleDamage} />
      )}

      <div className="mt-6 text-center text-sm text-gray-400">
        Вознаграждение: {(boss.reward_pool || 0).toLocaleString()} токенов
      </div>
    </div>
  );
};
