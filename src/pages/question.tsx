// src/pages/question.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface ScenarioOption {
  text: string;
  damage: number;
  crit: number;
  miss: number;
}

interface Scenario {
  id: string;
  title: string;
  options: ScenarioOption[];
}

export default function QuestionPage() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const bossId = router.query.boss_id as string;
  const userId = router.query.user_id as string;

  useEffect(() => {
    fetch('/api/get-scenario')
      .then((res) => res.json())
      .then((data) => {
        setScenario(data);
        setLoading(false);
      });
  }, []);

  const handleSelect = async (optionIndex: number) => {
    if (!scenario || !bossId || !userId) return;

    const res = await fetch('/functions/v1/perform_attack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        boss_id: bossId,
        scenario_id: scenario.id,
        option_index: optionIndex,
      }),
    });

    const data = await res.json();
    setResult(data.message);
  };

  if (loading) return <p>Загрузка...</p>;
  if (!scenario) return <p>Нет сценариев</p>;

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>{scenario.title}</h2>
      {scenario.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleSelect(i)}
          style={{
            margin: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {opt.text}
        </button>
      ))}

      {result && (
        <div style={{ marginTop: 20, fontWeight: 'bold', fontSize: '18px' }}>
          {result}
        </div>
      )}
    </div>
  );
}
