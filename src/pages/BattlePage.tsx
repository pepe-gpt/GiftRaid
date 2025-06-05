import { useState, useRef, useEffect } from 'react';

export const BattlePage = () => {
  const [isGameActive, setIsGameActive] = useState(false);
  const [indicatorX, setIndicatorX] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [greenZone, setGreenZone] = useState({ start: 30, end: 40 });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef(1); // 1 = вправо, -1 = влево

  const startGame = () => {
    setResult(null);
    setIsGameActive(true);
    setIndicatorX(0);
    directionRef.current = 1;

    // Случайная зелёная зона
    const start = Math.random() * 70;
    setGreenZone({ start, end: start + 10 });

    intervalRef.current = setInterval(() => {
      setIndicatorX((prev) => {
        let next = prev + directionRef.current * 1.5;
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

  const stopGame = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsGameActive(false);

    const { start, end } = greenZone;
    if (indicatorX >= start && indicatorX <= end) {
      const center = (start + end) / 2;
      const distance = Math.abs(indicatorX - center);
      const critChance = distance < 1 ? 30 : distance < 2 ? 20 : 10;
      const roll = Math.random() * 100;
      setResult(roll < critChance ? '💥 Критический урон!' : '✅ Урон по боссу!');
    } else {
      setResult('❌ Промах!');
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

      {!isGameActive && (
        <button
          onClick={startGame}
          className="bg-red-500 text-white px-6 py-3 rounded-lg text-lg shadow hover:bg-red-600 transition"
        >
          Атаковать
        </button>
      )}

      {isGameActive && (
        <div className="relative w-[300px] h-10 mt-6 bg-gray-300 rounded overflow-hidden border border-black">
          {/* Зелёная зона */}
          <div
            className="absolute top-0 h-full bg-green-400 opacity-60"
            style={{
              left: `${greenZone.start}%`,
              width: `${greenZone.end - greenZone.start}%`,
            }}
          />
          {/* Индикатор */}
          <div
            className="absolute top-0 h-full w-[4px] bg-black"
            style={{ left: `${indicatorX}%` }}
          />
        </div>
      )}

      {isGameActive && (
        <button
          onClick={stopGame}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Остановить
        </button>
      )}

      {result && (
        <div className="mt-6 text-xl font-semibold text-center">{result}</div>
      )}
    </div>
  );
};
