import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

  const fetchBoss = async () => {
  const { data, error } = await supabase
    .from('bosses')
    .select('*')
    .eq('is_active', true)
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle();


  console.log('Результат fetchBoss:', data, error); // ← теперь без ошибок

  if (data) setBoss(data);
  setLoading(false);
};


  const attackBoss = useCallback(async () => {
    if (!boss || clickCooldown) return;
    setClickCooldown(true);

    const damage = Math.random() < 0.1 ? 0 : Math.random() < 0.2 ? 50 : 10;
    const is_crit = damage === 50;
    const is_miss = damage === 0;

    await supabase.from('attacks').insert({
      boss_id: boss.id,
      user_id: '00000000-0000-0000-0000-000000000000', // Временно
      damage,
      is_crit,
      is_miss,
    });

    await fetchBoss();
    setTimeout(() => setClickCooldown(false), 500);
  }, [boss, clickCooldown]);

  useEffect(() => {
  console.log('useEffect СРАБОТАЛ');
  fetchBoss();
  }, []);


  if (loading || !boss) return <div>Загрузка...</div>;

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h1>{boss.name}</h1>
      <img
        src={boss.image_url || '/assets/ui/boss-default.png'}
        alt="boss"
        width={200}
        height={200}
        onClick={attackBoss}
        style={{ cursor: 'pointer' }}
      />
      <div style={{ marginTop: 20 }}>
        <progress value={boss.hp_current} max={boss.hp_max} style={{ width: '100%' }} />
        <p>
          HP: {boss.hp_current} / {boss.hp_max}
        </p>
      </div>
    </div>
  );
}
