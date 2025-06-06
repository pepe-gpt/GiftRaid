// src/components/BattleMiniGame.tsx
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { TelegramUser } from '../types';

interface BattleMiniGameProps {
  bossId: number;
  user: TelegramUser;
  onDamage: (damage: number) => void;
}

interface Zone {
  start: number;
  end: number;
}

const getRandomZoneSize = () => {
  const roll = Math.random();
  if (roll < 0.1) return 0.5;
  if (roll < 0.5) return 1.0;
  return 1.5;
};

const getRandomSpeedMultiplier = () => {
  const roll = Math.random();
  if (roll < 0.1) return 1.3;
  if (roll < 0.4) return 1.1;
  if (roll < 0.9) return 1.0;
  return 0.9;
};

export const BattleMiniGame: React.FC<BattleMiniGameProps> = ({ bossId, user, onDamage }) => {
  const [x, setX] = useState(0);
  const [zone, setZone] = useState<Zone>({ start: 40, end: 50 });
  const [result, setResult] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef(1);
  const speedRef = useRef(1.5);

  const baseSpeed = 1.5;
  const baseDamage = 10;

  const startGame = () => {
    setResult(null);
    setIsActive(true);
    setX(0);
    directionRef.current = 1;

    const zoneSizeMultiplier = getRandomZoneSize();
    const speedMultiplier = getRandomSpeedMultiplier();
    const zoneWidth = 10 * zoneSizeMultiplier;
    const zoneStart = Math.random() * (100 - zoneWidth);

    setZone({ start: zoneStart, end: zoneStart + zoneWidth });
    speedRef.current = baseSpeed * speedMultiplier;

    intervalRef.current = setInterval(() => {
      setX((prev) => {
        let next = prev + directionRef.current * speedRef.current;
        if (next >= 100) {
          next = 100;
          directionRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          directionRef.current = 1;
        }
        return next;
      });
    }, 16);
  };

  const stopGame = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);

    const hit = x >= zone.start && x <= zone.end;

    if (!hit) {
      setResult('❌ Промах!');
      return;
    }

    const sizeBonus = ((1.5 - (zone.end - zone.start) / 10) / 1.0) * 200;
    const speedBonus = ((speedRef.current / baseSpeed - 1.0) / 0.4) * 100;
    let total = baseDamage * (1 + (sizeBonus + speedBonus) / 100);

    if (Math.random() < 0.05) {
      total *= 2.5;
      setResult(`💥 Крит! Урон: ${Math.round(total)}`);
    } else {
      setResult(`✅ Урон: ${Math.round(total)}`);
    }

    const roundedDamage = Math.round(total);

    const { error } = await supabase.from('world_boss_damage').insert({
      boss_id: bossId,
      telegram_id: user.id, // 🛠 исправлено здесь
      damage: roundedDamage,
    });
    // 🔥 Отправляем урон в Supabase
const { error: insertError } = await supabase.from('world_boss_damage').insert({
  boss_id: bossId,
  telegram_id: user.id,
  damage: roundedDamage,
});

if (insertError) {
  console.error("Ошибка при отправке урона:", insertError.message);
  setResult("⚠️ Ошибка при отправке урона");
  return;
}

// 🔁 Обновляем HP у босса
const { error: updateError } = await supabase.rpc('decrease_boss_hp', {
  boss_id_input: bossId,
  damage_input: roundedDamage
});

if (updateError) {
  console.error("Ошибка при обновлении HP босса:", updateError.message);
}

    if (error) {
      console.error('Ошибка при отправке урона:', error.message);
      setResult('⚠️ Ошибка при отправке урона');
    } else {
      onDamage(roundedDamage);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center mt-6">
      {!isActive && (
        <button
          onClick={startGame}
          className="bg-red-500 text-white px-6 py-3 rounded-lg text-lg shadow hover:bg-red-600 transition"
        >
          Атаковать
        </button>
      )}

      {isActive && (
        <div className="relative w-[300px] h-10 mt-6 bg-gray-300 rounded overflow-hidden border border-black">
          <div
            className="absolute top-0 h-full bg-green-400 opacity-60"
            style={{ left: `${zone.start}%`, width: `${zone.end - zone.start}%` }}
          />
          <div
            className="absolute top-0 h-full w-[4px] bg-black"
            style={{ left: `${x}%` }}
          />
        </div>
      )}

      {isActive && (
        <button
          onClick={stopGame}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Остановить
        </button>
      )}

      {result && <div className="mt-4 text-center text-lg font-semibold">{result}</div>}
    </div>
  );
};
