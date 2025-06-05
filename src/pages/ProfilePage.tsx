import { useTelegram } from '../hooks/useTelegram';

export const ProfilePage = () => {
  const { user } = useTelegram();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Debug Info</h2>
      <pre className="text-sm bg-gray-100 p-2 rounded">
        {JSON.stringify(window.Telegram?.WebApp?.initDataUnsafe, null, 2)}
      </pre>

      {!user ? (
        <p className="mt-4 text-red-500 font-bold">User не найден!</p>
      ) : (
        <div className="flex flex-col items-center mt-6">
          <img
            src={user.photo_url}
            alt="avatar"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h2 className="text-xl font-bold">{user.first_name}</h2>
          <p className="text-gray-600">@{user.username}</p>
          <p className="text-gray-500">ID: {user.id}</p>
        </div>
      )}
    </div>
  );
};
