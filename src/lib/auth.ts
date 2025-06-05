import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mecjaydtuxkvwrvnsqqj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // твой ключ

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Получить initDataUnsafe от Telegram
export function getTelegramUser() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
}

// Сохранить пользователя в Supabase
export async function saveUserToSupabase(user: any) {
  if (!user?.id) return;

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_url: user.photo_url,
        language_code: user.language_code,
        is_premium: user.is_premium,
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("Ошибка сохранения:", error.message);
  }

  return data;
}

export default supabase;
