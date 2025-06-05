import './index.css';
import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { ProfilePage } from './pages/ProfilePage';
import { BattlePage } from './pages/BattlePage';

type Tab = 'quests' | 'raids' | 'battle' | 'shop' | 'profile';

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  useEffect(() => {
    // Инициализируем Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePage />;
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
