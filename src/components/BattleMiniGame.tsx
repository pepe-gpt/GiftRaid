import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { TelegramUser } from '../types';

interface BattleMiniGameProps {
  bossId: string;
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

function getComboBonuses(combo: number) {
  let flatBonus = 0;
  let critChanceBonus = 0;
  let critMultiplierBonus = 0;
  let totalMultiplierBonus = 0;

  if ([3, 7, 15, 30, 50].includes(combo)) {
    flatBonus = 5;
    critChanceBonus = 0.1;
    critMultiplierBonus = 0.5;
  }

  if (combo > 3) {
    const extraMultipliers = Math.max(0, combo - [3, 7, 15, 30, 50].filter(n => n <= combo).pop()!);
    totalMultiplierBonus = extraMultipliers * 0.1;
  }

  return { flatBonus, critChanceBonus, critMultiplierBonus, totalMultiplierBonus };
}

export const BattleMiniGame: React.FC<BattleMiniGameProps> = ({ bossId, user, onDamage }) => {
  const [x, setX] = useState(0);
  const [zone, setZone] = useState<Zone>({ start: 40, end: 50 });
  const [result, setResult] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [combo, setCombo] = useState(0);
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

    let currentCombo = 0;
    const { data: existingCombo } = await supabase
      .from('world_boss_combos')
      .select('*')
      .eq('user_id', user.id)
      .eq('boss_id', bossId)
      .single();

    if (existingCombo) {
      currentCombo = existingCombo.combo_count;
    }

    if (!hit) {
      setResult('❌ Промах!');
      await supabase
        .from('world_boss_combos')
        .upsert({ user_id: user.id, boss_id: bossId, combo_count: 0 });
      setCombo(0);
      return;
    }

    currentCombo += 1;
    const { flatBonus, critChanceBonus, critMultiplierBonus, totalMultiplierBonus } = getComboBonuses(currentCombo);

    const sizeBonus = ((1.5 - (zone.end - zone.start) / 10) / 1.0) * 200;
    const speedBonus = ((speedRef.current / baseSpeed - 1.0) / 0.4) * 100;

    let total = baseDamage + flatBonus;
    total *= 1 + (sizeBonus + speedBonus) / 100;
    total *= 1 + totalMultiplierBonus;

    const critChance = 0.05 + critChanceBonus;
    const critMultiplier = 2.5 + critMultiplierBonus;

    const isCrit = Math.random() < critChance;
    if (isCrit) {
      total *= critMultiplier;
      setResult(`💥 Крит! Combo x${currentCombo} — Урон: ${Math.round(total)}`);
    } else {
      setResult(`✅ Combo x${currentCombo} — Урон: ${Math.round(total)}`);
    }

    await supabase.from('world_boss_combos').upsert({
      user_id: user.id,
      boss_id: bossId,
      combo_count: currentCombo,
    });

    setCombo(currentCombo);

    const roundedDamage = Math.round(total);
    const { error } = await supabase.rpc('attack_world_boss', {
      boss_id_input: bossId,
      telegram_id_input: user.id,
      damage_input: roundedDamage,
    });

    if (error) {
      console.error('❌ Ошибка при атаке:', error.message);
      setResult('⚠️ Ошибка при атаке');
      return;
    }

    onDamage(roundedDamage);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center mt-6">
      {!isActive && (
        <>
          <button
            onClick={startGame}
            className="bg-red-500 text-white px-6 py-3 rounded-lg text-lg shadow hover:bg-red-600 transition"
          >
            Атаковать
          </button>
          {combo > 2 && (
            <div className="mt-2 text-sm text-yellow-600 font-semibold">
              Комбо x{combo} активен!
            </div>
          )}
        </>
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
