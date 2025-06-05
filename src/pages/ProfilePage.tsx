import React from 'react';

interface Props {
  user: {
    first_name?: string;
    username?: string;
    photo_url?: string;
  };
}

export const ProfilePage: React.FC<Props> = ({ user }) => {
  return (
    <div className="flex flex-col items-center mt-10">
      {user?.photo_url && (
        <img src={user.photo_url} alt="avatar" className="w-24 h-24 rounded-full mb-4 shadow" />
      )}
      <h1 className="text-xl font-semibold">{user?.first_name || 'Пользователь'}</h1>
      <p className="text-gray-500">@{user?.username}</p>
    </div>
  );
};
