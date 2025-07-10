<script lang="ts">
  import type { TelegramWebApp, TelegramWebAppUser } from '$lib/types/telegram';

  export let sortBy: 'date' | 'popularity' = 'date';
  export let showImages: boolean = true;
  export let darkMode: boolean = true;
  export let isInTelegramWebApp: boolean = false;

  interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  }

  let telegramUser: TelegramUser | null = null;

  if (typeof window !== 'undefined' && window?.Telegram?.WebApp) {
    try {
      const webApp = window.Telegram.WebApp;
      if (webApp.initDataUnsafe?.user) {
        telegramUser = webApp.initDataUnsafe.user;
      }
    } catch (e) {
      console.error('Ошибка при получении данных пользователя:', e);
    }
  }

  function handleSettingChange() {
    if (typeof window !== 'undefined' && window?.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  }

  function openTelegramProfile() {
    if (window?.Telegram?.WebApp?.openTelegramLink) {
      if (window?.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      window.Telegram.WebApp.openTelegramLink('https://t.me/your_bot_username');
    }
  }
</script>

{#if !isInTelegramWebApp}
  <div class="telegram-prompt">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <h2>Откройте в Telegram</h2>
    <p>Для доступа к настройкам, пожалуйста, откройте это приложение в Telegram.</p>
    <a href="https://t.me/your_bot_username/app" class="telegram-button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 16.01C15.37 16.77 15.09 17.01 14.83 17.04C14.25 17.09 13.81 16.66 13.25 16.29C12.37 15.73 11.87 15.39 11.02 14.85C10.03 14.23 10.67 13.88 11.24 13.29C11.39 13.13 13.95 10.8 14 10.57C14.0069 10.5357 14.006 10.5002 13.9973 10.4666C13.9886 10.433 13.9724 10.4024 13.95 10.377C13.89 10.324 13.81 10.342 13.74 10.357C13.65 10.376 12.15 11.368 9.24 13.333C8.78 13.646 8.37 13.799 8 13.789C7.59 13.779 6.81 13.569 6.22 13.389C5.49 13.17 4.91 13.054 4.96 12.654C4.99 12.445 5.28 12.233 5.83 12.017C8.96 10.674 11.05 9.797 12.11 9.386C15.28 8.172 15.97 7.935 16.43 7.935C16.53 7.935 16.76 7.959 16.91 8.082C17.04 8.184 17.08 8.326 17.09 8.429C17.08 8.508 17.09 8.666 16.64 8.8Z" fill="currentColor"/>
      </svg>
      Открыть в Telegram
    </a>
  </div>
{:else}
  <div class="settings">
    {#if telegramUser}
      <div class="user-profile">
        {#if telegramUser.photo_url}
          <img src={telegramUser.photo_url} alt="Фото профиля" class="profile-photo" />
        {:else}
          <div class="profile-photo-placeholder">
            {telegramUser.first_name[0]}
          </div>
        {/if}
        <div class="user-info">
          <h3>{telegramUser.first_name} {telegramUser.last_name || ''}</h3>
          {#if telegramUser.username}
            <p class="username">@{telegramUser.username}</p>
          {/if}
        </div>
      </div>
    {/if}

    <div class="settings-group">
      <h3>Сортировка новостей</h3>
      <div class="radio-group">
        <label>
          <input 
            type="radio" 
            bind:group={sortBy} 
            value="date"
            on:change={handleSettingChange}
          >
          <span>По дате</span>
        </label>
        <label>
          <input 
            type="radio" 
            bind:group={sortBy} 
            value="popularity"
            on:change={handleSettingChange}
          >
          <span>По популярности</span>
        </label>
      </div>
    </div>

    <div class="settings-group">
      <h3>Внешний вид</h3>
      <label class="toggle">
        <span>Показывать изображения</span>
        <input 
          type="checkbox" 
          bind:checked={showImages}
          on:change={handleSettingChange}
        >
        <div class="toggle-slider"></div>
      </label>
      <label class="toggle">
        <span>Тёмная тема</span>
        <input 
          type="checkbox" 
          bind:checked={darkMode}
          on:change={handleSettingChange}
        >
        <div class="toggle-slider"></div>
      </label>
    </div>
  </div>
{/if}

<style>
  .settings {
    max-width: 600px;
    margin: 0 auto;
    padding: 0rem;
  }

  .settings-group {
    background: #1e1e1e;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  h2 {
    color: rgba(255, 255, 255, 0.87);
    font-size: 1.2rem;
    margin: 0 0 1rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: rgba(255, 255, 255, 0.87);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  label:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  input[type="radio"],
  input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    accent-color: #2563eb;
  }

  .telegram-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 1rem;
    background: #2563eb;
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .telegram-button:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
  }

  .telegram-button:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    .settings {
      padding: 0rem;
    }

    .settings-group {
      padding: 1rem;
    }
  }

  .user-profile {
    background: #1e1e1e;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .profile-photo {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
  }

  .profile-photo-placeholder {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #2563eb;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 500;
  }

  .user-info h3 {
    margin: 0;
    color: rgba(255, 255, 255, 0.87);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .username {
    margin: 0.25rem 0 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }

  .settings-group h3 {
    margin: 0 0 1rem;
    color: rgba(255, 255, 255, 0.87);
    font-size: 1.1rem;
    font-weight: 500;
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .toggle:last-child {
    margin-bottom: 0;
  }

  .toggle input[type="checkbox"] {
    display: none;
  }

  .toggle-slider {
    width: 48px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .toggle-slider::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.2s ease;
  }

  input[type="checkbox"]:checked + .toggle-slider {
    background: #2563eb;
  }

  input[type="checkbox"]:checked + .toggle-slider::after {
    transform: translateX(24px);
  }

  .telegram-prompt {
    text-align: center;
    padding: 2rem;
    background: #1e1e1e;
    border-radius: 16px;
    margin: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .telegram-prompt svg {
    margin-bottom: 1rem;
    color: #2563eb;
  }

  .telegram-prompt h2 {
    margin: 0 0 0.5rem;
    color: rgba(255, 255, 255, 0.87);
  }

  .telegram-prompt p {
    margin: 0 0 1.5rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .telegram-prompt .telegram-button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: #2563eb;
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .telegram-prompt .telegram-button:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
  }

  .telegram-prompt .telegram-button:active {
    transform: translateY(0);
  }
</style> 