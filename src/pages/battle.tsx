import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Объявляем глобальный Telegram объект, чтобы TypeScript не ругался
declare global {
  interface Window {
    Telegram?: any;
  }
}

const supabase = createClient(
  'https://tyvjdugqmlzshbamrrxq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5dmpkdWdxbWx6c2hiYW1ycnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjQ1ODIsImV4cCI6MjA2NDU0MDU4Mn0.94wawiD9Yi5SljGFuuX8n0JhmwOKxxMz7Viqh_R8mlc'
);

export default function Battle() {
  const [userId, setUserId] = useState<number | null>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const initUserId = tg?.initDataUnsafe?.user?.id;
    setUserId(initUserId || null);
  }, []);

  useEffect(() => {
    if (userId) {
      loadScenario();
    }
  }, [userId]);

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
      setScenario(data);
    }
  };

  const handleChoice = async (index: number) => {
    if (!scenario || !scenario.options || userId === null) return;

    const selected = scenario.options[index];
    const roll = Math.random();

    let finalDamage = selected.damage;
    let message = `Ты выбрал: ${selected.text}. `;

    if (roll < selected.miss) {
      finalDamage = 0;
      message += 'Но ты промахнулся!';
    } else if (roll > 1 - selected.crit) {
      finalDamage *= 2;
      message += 'Критический удар! ';
    } else {
      message += 'Атака прошла успешно.';
    }

    setLoading(true);

    const { error } = await supabase.from('battle_logs').insert([
      {
        user_id: userId,
        boss_id: 1, // можно заменить на актуального босса
        scenario_id: scenario.id,
        option_index: index,
        damage: finalDamage,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error('Ошибка записи боя', error);
      setResult('Ошибка при записи данных.');
    } else {
      setResult(message + ` Ты нанёс ${finalDamage} урона.`);
    }
  };

  if (!scenario) return <div>Загрузка сценария...</div>;

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>{scenario.title}</h2>
      <p>{scenario.text}</p>

      {scenario.options.map((opt: any, index: number) => (
        <button
          key={index}
          onClick={() => handleChoice(index)}
          disabled={loading}
          style={{ margin: '10px', padding: '10px', width: '80%' }}
        >
          {opt.text}
        </button>
      ))}

      {result && <p style={{ marginTop: '20px' }}>{result}</p>}
    </div>
  );
}
