import { useEffect, useState } from "react";
import { saveTelegramUser } from "./lib/auth";
import { ProfilePage } from "./pages/ProfilePage";
import { BottomNav } from "./components/BottomNav";

type Tab = "quests" | "raids" | "battle" | "shop" | "profile";

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

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
      case "quests":
        return <div className="text-center p-4">Задания (заглушка)</div>;
      case "raids":
        return <div className="text-center p-4">Рейды (заглушка)</div>;
      case "battle":
        return <div className="text-center p-4">Битва (заглушка)</div>;
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
