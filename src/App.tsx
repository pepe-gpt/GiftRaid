import './index.css';
import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { ProfilePage } from './pages/ProfilePage';
import { BattlePage } from './pages/BattlePage';

type Tab = 'quests' | 'raids' | 'battle' | 'shop' | 'profile';

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!window.Telegram || !window.Telegram.WebApp) return;

      window.Telegram.WebApp.ready();
      const initData = window.Telegram.WebApp.initData;

      try {
        const res = await fetch(
  'https://mecjaydtuxkvwrvnsqqj.supabase.co/functions/v1/auth',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ initData }),
  }
);

const data = await res.json();
console.log('Ответ от Supabase:', data); // <--- Добавь эту строку
setUser(data.user);

      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const renderPage = () => {
    if (loading) {
      return (
        <div className="text-center mt-10 text-gray-400 text-lg">Загрузка...</div>
      );
    }

    if (!user) {
      return (
        <div className="text-center mt-10 text-red-500">
          Не удалось авторизоваться 😢
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return <ProfilePage user={user} />;
      case 'battle':
        return <BattlePage />;
      default:
        return (
          <div className="mt-10 text-center text-gray-500">
            Раздел в разработке
          </div>
        );
    }
  };

  return (
    <div className="pb-16">
      {renderPage()}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
