import React from 'react';

type Tab = 'quests' | 'raids' | 'battle' | 'shop' | 'profile';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-2">
      {[
        { key: 'quests', label: 'Задания' },
        { key: 'raids', label: 'Рейды' },
        { key: 'battle', label: 'Битва' },
        { key: 'shop', label: 'Магазин' },
        { key: 'profile', label: 'Профиль' },
      ].map((item) => (
        <button
          key={item.key}
          className={`text-sm ${activeTab === item.key ? 'font-bold text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab(item.key as Tab)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
