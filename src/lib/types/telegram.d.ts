interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  auth_date?: string;
  hash?: string;
}

type HapticFeedbackImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type HapticFeedbackNotificationType = 'error' | 'success' | 'warning';

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramWebAppInitData;
  version: string;
  platform: string;
  colorScheme: string;
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  ready(): void;
  expand(): void;
  close(): void;
  openTelegramLink(url: string): void;
  HapticFeedback: {
    impactOccurred: (style: HapticFeedbackImpactStyle) => void;
    notificationOccurred: (type: HapticFeedbackNotificationType) => void;
    selectionChanged: () => void;
  };
}

interface Telegram {
  WebApp?: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram?: Telegram;
  }
}

export type { TelegramWebAppUser, TelegramWebAppInitData, TelegramWebApp, HapticFeedbackImpactStyle, HapticFeedbackNotificationType }; 