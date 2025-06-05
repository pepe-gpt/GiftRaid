export function useTelegram() {
  const tg = (window as any).Telegram?.WebApp;

  const user = tg?.initDataUnsafe?.user;

  return {
    tg,
    user,
    onClose: () => tg?.close(),
  };
}
