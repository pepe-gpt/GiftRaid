// ✅ Обновлённый App.tsx
import { useEffect, useState } from "react";
import { saveTelegramUser } from "./lib/auth";
import { ProfilePage } from "./pages/ProfilePage";
import { BattlePage } from "./pages/BattlePage";
import { WorldBossPage } from "./pages/WorldBossPage";
import { BottomNav } from "./components/BottomNav";
import type { Tab } from "./types";

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("battle");

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
    </div>
  );
}

export default App;


// ✅ lib/supabase.ts (без изменений)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mecjaydtuxkvwrvnsqqj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJI...'; // ключ уже указан

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// ✅ Обновление строки в BattlePage.tsx (внизу)

