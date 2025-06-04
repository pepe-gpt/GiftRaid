export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            username?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        close: () => void;
        sendData: (data: string) => void;
      };
    };
  }
}
