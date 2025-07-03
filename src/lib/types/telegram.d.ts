interface TelegramWebApp {
  openTelegramLink: (url: string) => void;
}

interface Telegram {
  WebApp?: TelegramWebApp;
}

interface Window {
  Telegram?: Telegram;
}

export {}; 