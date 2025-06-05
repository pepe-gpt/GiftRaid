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
    console.log('TG объект:', window.Telegram); // Проверка Telegram

    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();

      const initData = window.Telegram.WebApp.initData;
      console.log('initData:', initData); // Проверка initData

      fetch('https://mecjaydtuxkvwrvnsqqj.supabase.co/functions/v1/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Ответ от Supabase:', data); // Проверка ответа
          setUser(data.user);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Ошибка запроса:', err);
          setLoading(false);
        });
    } else {
      console.log('Telegram WebApp недоступен');
      setLoading(false);
    }
  }, []);

  const renderPage = () => {
    if (loading) {
      return <div className="mt-10 text-center text-gray-500">Загрузка...</div>;
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
