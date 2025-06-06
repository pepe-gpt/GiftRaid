export interface TelegramUser {
  id: number; // ← добавь эту строку
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

export type Tab = 'quests' | 'raids' | 'battle' | 'shop' | 'profile';
