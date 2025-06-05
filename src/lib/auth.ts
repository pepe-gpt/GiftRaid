import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mecjaydtuxkvwrvnsqqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lY2pheWR0dXhrdndydm5zcXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzUyOTUsImV4cCI6MjA2NDcxMTI5NX0.h95WbmbWgExW_E_FUiK8S0tHTBOOBarDQdEDOfmDLJU';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveTelegramUser(user: any) {
  if (!user?.id) return;

  try {
    const { error } = await supabase.from('users').upsert(
      {
        telegram_id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        language_code: user.language_code,
        photo_url: user.photo_url,
        is_premium: user.is_premium || false,
      },
      { onConflict: 'telegram_id' }
    );

    if (error) {
      console.error('Ошибка сохранения:', error.message);
    } else {
      console.log('Данные пользователя успешно сохранены.');
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
  }
}
