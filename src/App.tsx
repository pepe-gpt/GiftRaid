import './index.css';
import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { ProfilePage } from './pages/ProfilePage';
import { BattlePage } from './pages/BattlePage';
import { authorizeUser } from './lib/auth';


type Tab = 'quests' | 'raids' | 'battle' | 'shop' | 'profile';

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        console.log('TG объект:', window.Telegram);

        const initData = window.Telegram.WebApp.initData || '';
        console.log('initData:', initData);

        try {
          const userData = await authorizeUser(initData);
          console.log('Ответ от Supabase:', userData);
          setUser(userData);
        } catch (err) {
          console.error('Ошибка авторизации:', err);
        }
      } else {
        console.error('Telegram WebApp недоступен');
      }
    };

    init();
  }, []);

  const renderPage = () => {
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
