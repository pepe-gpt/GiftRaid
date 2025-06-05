import { useEffect, useState } from "react";
import { getTelegramUser, saveUserToSupabase } from "./lib/auth";

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const tgUser = getTelegramUser();

    if (tgUser) {
      console.log("Пользователь Telegram:", tgUser);
      setUser(tgUser);
      saveUserToSupabase(tgUser);
    } else {
      console.log("Telegram WebApp user не найден");
    }
  }, []);

  if (!user) return <div>Загрузка...</div>;

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <img
        src={user.photo_url}
        alt="User"
        style={{ width: 100, borderRadius: "50%" }}
      />
      <h2>{user.first_name}</h2>
      <p>@{user.username}</p>
    </div>
  );
}

export default App;
