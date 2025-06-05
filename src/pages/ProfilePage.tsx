import { useTelegram } from '../hooks/useTelegram';

export const ProfilePage = () => {
  const { user } = useTelegram();

  if (!user) return <div className="mt-10 text-center">Загрузка...</div>;

  return (
    <div className="flex flex-col items-center mt-10">
      <img
        src={user.photo_url}
        alt="avatar"
        className="w-24 h-24 rounded-full mb-4"
      />
      <h2 className="text-xl font-bold">{user.first_name}</h2>
      <p className="text-gray-600">@{user.username}</p>
      <p className="text-gray-500">ID: {user.id}</p>
    </div>
  );
};
