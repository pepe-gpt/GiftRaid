import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tyvjdugqmlzshbamrrxq.supabase.co',
  'YOUR_PUBLIC_ANON_KEY' // замени на свой ключ
);

type AttackOption = {
  text: string;
  damage: number;
  crit: number;
  miss: number;
};

type Scenario = {
  id: string;
  title: string;
  options: AttackOption[];
};

export default function BattlePage() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Получаем Telegram user ID
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      setUserId(window.Telegram.WebApp.initDataUnsafe.user.id);
    }
  }, []);

  // Загружаем случайный сценарий
  useEffect(() => {
    const loadScenario = async () => {
      const { data, error } = await supabase
        .from('attack_scenarios')
        .select('*')
        .order('RANDOM()')
        .limit(1)
        .single();

      if (error) {
        console.error('Ошибка загрузки сценария', error);
      } else {
        setScenario(data as Scenario);
      }
    };

    loadScenario();
  }, []);

  const handleChoice = async (optionIndex: number) => {
    if (!scenario || !userId) return;
    setLoading(true);
    try {
      const sessionResult = await supabase.auth.getSession();
      const accessToken = sessionResult.data.session?.access_token;

      const res = await fetch('https://tyvjdugqmlzshbamrrxq.functions.supabase.co/smooth-handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          user_id: userId,
          boss_id: 1,
          scenario_id: scenario.id,
          option_index: optionIndex,
        }),
      });

      const json = await res.json();
      if (json.error) {
        setResult(`Ошибка: ${json.error}`);
        console.error(json.error);
      } else {
        setResult(json.message);
      }
    } catch (e) {
      console.error('Ошибка отправки:', e);
      setResult('Произошла ошибка. Попробуй снова.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>⚔️ Битва с боссом</h2>
      {scenario ? (
        <>
          <p>{scenario.title}</p>
          {scenario.options.map((opt, index) => (
            <button
              key={index}
              onClick={() => handleChoice(index)}
              disabled={loading}
              style={{ margin: '5px', padding: '10px', display: 'block' }}
            >
              {opt.text}
            </button>
          ))}
        </>
      ) : (
        <p>Загрузка сценария...</p>
      )}
      {result && <p><strong>🎯 Результат:</strong> {result}</p>}
    </div>
  );
}
