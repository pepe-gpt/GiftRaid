// ✅ Обновлённый App.tsx
import { useEffect, useState } from "react";
import { saveTelegramUser } from "./lib/auth";
import { ProfilePage } from "./pages/ProfilePage";
import { BattlePage } from "./pages/BattlePage";
import { WorldBossPage } from "./pages/WorldBossPage";
import { BottomNav } from "./components/BottomNav";
import { RewardPopup } from './components/RewardPopup';
import { supabase } from "./lib/supabase";
import type { Tab } from "./types";

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("battle");
  const [reward, setReward] = useState<number | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

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
    }, 3000); // показать через 3 сек бездействия

    return () => clearTimeout(idleTimeout);
  }, [user]);

  const handleClaim = async () => {
    if (!user || reward === null) return;

    const { error: updateError } = await supabase
      .from("users")
      .update({ tokens: supabase.rpc('increment_user_tokens', { tg_id: user.id, value: reward }) })
      .eq("telegram_id", user.id);

    const { error: deleteError } = await supabase
      .from("pending_rewards")
      .delete()
      .eq("telegram_id", user.id);

    if (!updateError && !deleteError) {
      setPopupVisible(false);
      setReward(null);
    }
  };

  if (!user) return <div className="text-center mt-10">Загрузка...</div>;

  const renderPage = () => {
    switch (activeTab) {
      case "profile":
        return <ProfilePage user={user} />;
      case "battle":
        return <BattlePage user={user} />;
      case "quests":
        return <div className="text-center p-4">Задания (заглушка)</div>;
      case "raids":
        return <WorldBossPage />;
      case "shop":
        return <div className="text-center p-4">Магазин (заглушка)</div>;
      default:
        return null;
    }
  };

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
