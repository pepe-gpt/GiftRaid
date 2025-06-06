import { useState, useEffect, useRef } from 'react';

interface Indicator {
  id: number;
  x: number;
  speed: number;
  direction: number;
}

interface Zone {
  start: number;
  end: number;
}

const getRandomZoneSize = () => {
  const roll = Math.random();
  if (roll < 0.1) return 0.5; // маленькая (10%)
  if (roll < 0.5) return 1;   // средняя (40%)
  return 1.5;                 // большая (50%)
};

const getRandomSpeedMultiplier = () => {
  const roll = Math.random();
  if (roll < 0.1) return 1.3;
  if (roll < 0.4) return 1.1;
  if (roll < 0.9) return 1.0;
  return 0.9;
};

const getRandomIndicatorCount = () => {
  const roll = Math.random();
  if (roll < 0.01) return 3;
  if (roll < 0.10) return 2;
  return 1;
};

export const BattlePage = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
 

  const baseSpeed = 1.5;
  const baseDamage = 10;

  const startGame = () => {
    setResult(null);
    const count = getRandomIndicatorCount();
    const zoneSizeMultiplier = getRandomZoneSize();
    const speedMultiplier = getRandomSpeedMultiplier();

    const zoneWidth = 10 * zoneSizeMultiplier; // %
    const gap = 20;
    const zoneSpacing = 100 / count;

    const generatedZones: Zone[] = Array.from({ length: count }, (_, i) => {
      const start = zoneSpacing * i + gap / 2;
      return {
        start,
        end: start + zoneWidth,
      };
    });

    const generatedIndicators: Indicator[] = Array.from({ length: count }, (_, i) => {
      return {
        id: i,
        x: i % 2 === 0 ? 0 : 100,
        speed: baseSpeed * speedMultiplier * (0.95 + Math.random() * 0.1),
        direction: i % 2 === 0 ? 1 : -1,
      };
    });

    setZones(generatedZones);
    setIndicators(generatedIndicators);
    setIsActive(true);

    intervalRef.current = setInterval(() => {
      setIndicators(prev => prev.map(ind => {
        let newX = ind.x + ind.direction * ind.speed;
        if (newX >= 100) {
          newX = 100;
          ind.direction = -1;
        } else if (newX <= 0) {
          newX = 0;
          ind.direction = 1;
        }
        return { ...ind, x: newX };
      }));
    }, 16);
  };

  const stopGame = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);

    const hits = indicators.filter((ind, i) => {
      const z = zones[i];
      return ind.x >= z.start && ind.x <= z.end;
    });

    if (hits.length !== indicators.length) return setResult('❌ Промах!');

    const sizeBonus = ((1.5 - (zones[0].end - zones[0].start) / 10) / 1.0) * 200;
    const speedBonus = ((indicators[0].speed / baseSpeed - 1.0) / 0.4) * 100;
    const multi = indicators.length;
    let total = baseDamage * (1 + (sizeBonus + speedBonus) / 100) * multi;

    if (Math.random() < 0.05) {
      total *= 2.5;
      setResult(`💥 Крит! Урон: ${Math.round(total)}`);
    } else {
      setResult(`✅ Урон: ${Math.round(total)}`);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center mt-10 px-4">
      <h2 className="text-xl font-bold mb-4">Битва с Боссом</h2>

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
          {zones.map((zone, i) => (
            <div
              key={`zone-${i}`}
              className="absolute top-0 h-full bg-green-400 opacity-60"
              style={{
                left: `${zone.start}%`,
                width: `${zone.end - zone.start}%`,
              }}
            />
          ))}
          {indicators.map((ind) => (
            <div
              key={`ind-${ind.id}`}
              className="absolute top-0 h-full w-[4px] bg-black"
              style={{ left: `${ind.x}%` }}
            />
          ))}
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

      {result && <div className="mt-6 text-xl font-semibold text-center">{result}</div>}
    </div>
  );
};
