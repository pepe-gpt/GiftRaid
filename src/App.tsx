import { useEffect, useState } from "react";
import { saveTelegramUser } from "./lib/auth";
import { ProfilePage } from "./pages/ProfilePage";
import { BattlePage } from "./pages/BattlePage";
import { RaidPage } from './pages/RaidPage';
import { BottomNav } from "./components/BottomNav";
import RewardPopup from "./components/RewardPopup";

import { supabase } from "./lib/supabase";
import type { Tab } from "./types";

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("battle");
  const [reward, setReward] = useState<number | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);

  // 1. Получение пользователя
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;

    if (tgUser) {
      console.log("Пользователь Telegram:", tgUser);
      setUser(tgUser);
      saveTelegramUser(tgUser);
    } else {
      console.log("Telegram WebApp user не найден");
    }
  }, []);

  // 2. Проверка наград
  useEffect(() => {
    if (!user) return;

    const checkReward = async () => {
      const { data, error } = await supabase
        .from("pending_rewards")
        .select("tokens")
        .eq("telegram_id", user.id)
        .maybeSingle();

      if (data && data.tokens && !error) {
        setReward(data.tokens);
        setPopupVisible(true);
      }
    };

    const idleTimeout = setTimeout(() => {
      checkReward();
    }, 3000); // через 3 секунды бездействия

    return () => clearTimeout(idleTimeout);
  }, [user]);

  // 3. Получение текущего баланса токенов
  useEffect(() => {
    if (!user) return;

    const fetchTokens = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("tokens")
        .eq("telegram_id", user.id)
        .maybeSingle();

      if (!error && data?.tokens !== undefined) {
        setTokenBalance(data.tokens);
      }
    };

    fetchTokens();
  }, [user]);

  // 4. Получение награды
  const handleClaim = async () => {
    if (!user || reward === null) return;

    const { error: rpcError } = await supabase.rpc("increment_user_tokens", {
      tg_id: user.id,
      value: reward,
    });

    if (rpcError) {
      console.error("Ошибка начисления токенов:", rpcError.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from("pending_rewards")
      .delete()
      .eq("telegram_id", user.id);

    if (deleteError) {
      console.error("Ошибка удаления pending_reward:", deleteError.message);
      return;
    }

    setPopupVisible(false);
    setReward(null);
    setTokenBalance((prev) => prev + reward); // обновить локальный баланс
  };

  // 5. Отображение нужной вкладки
  const renderPage = () => {
    switch (activeTab) {
      case "profile":
        return <ProfilePage user={user} />;
      case "battle":
        return (
          <div>
            <div className="text-right p-2 text-sm font-medium flex items-center justify-end gap-2">
              <img src="/coin.svg" alt="Coin" className="w-5 h-5" />
              <span>{tokenBalance}</span>
            </div>
            <BattlePage user={user} />
          </div>
        );
      case "quests":
        return <div className="text-center p-4">Задания (заглушка)</div>;
      case "raids":
        return <RaidPage />;
      case "shop":
        return <div className="text-center p-4">Магазин (заглушка)</div>;
      default:
        return null;
    }
  };

  if (!user) return <div className="text-center mt-10">Загрузка...</div>;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">{renderPage()}</div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      {popupVisible && reward !== null && (
        <RewardPopup tokens={reward} onClaim={handleClaim} />
      )}
    </div>
  );
}

export default App;
