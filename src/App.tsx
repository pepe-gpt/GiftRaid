import { useEffect, useState } from "react";
import { saveTelegramUser } from "./lib/auth";

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;

    if (tgUser) {
      console.log("Пользователь Telegram:", tgUser);
      setUser(tgUser);
      saveTelegramUser(tgUser);
    } else {
      console.log("Telegram WebApp user не найден");
    }
  }, []);

  if (!user) return <div>Загрузка...</div>;

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      {user.photo_url && (
        <img
          src={user.photo_url}
          alt="User"
          style={{ width: 100, borderRadius: "50%" }}
        />
      )}
      <h2>{user.first_name}</h2>
      {user.username && <p>@{user.username}</p>}
    </div>
  );
}

export default App;
