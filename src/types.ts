export type TelegramUser = {
  telegram_id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
};

export type Tab = 'quests' | 'raids' | 'battle' | 'shop' | 'profile';
