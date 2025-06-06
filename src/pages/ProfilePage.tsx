import React from "react";

export type TelegramUser = {
  telegram_id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
};

type ProfilePageProps = {
  user: TelegramUser;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  if (!user) return <div className="text-center mt-10">Пользователь не найден</div>;

  return (
    <div className="p-4 text-center">
      {user.photo_url && (
        <img
          src={user.photo_url}
          alt="avatar"
          className="mx-auto w-24 h-24 rounded-full mb-2 border"
        />
      )}
      <h1 className="text-xl font-bold">{user.first_name}</h1>
      {user.username && <p className="text-gray-500">@{user.username}</p>}
    </div>
  );
};
