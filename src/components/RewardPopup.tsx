// src/components/RewardPopup.tsx
import React from 'react';

type Props = {
  tokens: number;
  onClaim: () => void;
};

const RewardPopup: React.FC<Props> = ({ tokens, onClaim }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-xs w-full text-center">
        <h2 className="text-xl font-bold mb-4">🎉 Награда!</h2>
        <p className="text-lg mb-4">Вы получили <strong>{tokens}</strong> токенов!</p>
        <button
          onClick={onClaim}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full hover:bg-blue-700 transition"
        >
          Получить
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;

