<script lang="ts">
  export let sortBy: 'date' | 'popularity' = 'date';
  export let showImages: boolean = true;
  export let darkMode: boolean = true;
  export let isInTelegramWebApp: boolean = false;

  function openTelegramProfile() {
    if (window?.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink('https://t.me/your_bot_username');
    }
  }
</script>

<div class="settings">
  <h1>Настройки</h1>
  
  <div class="settings-group">
    <h2>Сортировка</h2>
    <div class="setting-item">
      <label>
        <input 
          type="radio" 
          bind:group={sortBy} 
          value="date"
        >
        По дате
      </label>
      <label>
        <input 
          type="radio" 
          bind:group={sortBy} 
          value="popularity"
        >
        По популярности
      </label>
    </div>
  </div>

  <div class="settings-group">
    <h2>Отображение</h2>
    <div class="setting-item">
      <label>
        <input 
          type="checkbox" 
          bind:checked={showImages}
        >
        Показывать изображения
      </label>
    </div>
    <div class="setting-item">
      <label>
        <input 
          type="checkbox" 
          bind:checked={darkMode}
        >
        Тёмная тема
      </label>
    </div>
  </div>

  {#if isInTelegramWebApp}
    <div class="settings-group">
      <h2>Telegram</h2>
      <div class="setting-item">
        <button class="telegram-button" on:click={openTelegramProfile}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 16.01C15.37 16.77 15.09 17.01 14.83 17.04C14.25 17.09 13.81 16.66 13.25 16.29C12.37 15.73 11.87 15.39 11.02 14.85C10.03 14.23 10.67 13.88 11.24 13.29C11.39 13.13 13.95 10.8 14 10.57C14.0069 10.5357 14.006 10.5002 13.9973 10.4666C13.9886 10.433 13.9724 10.4024 13.95 10.377C13.89 10.324 13.81 10.342 13.74 10.357C13.65 10.376 12.15 11.368 9.24 13.333C8.78 13.646 8.37 13.799 8 13.789C7.59 13.779 6.81 13.569 6.22 13.389C5.49 13.17 4.91 13.054 4.96 12.654C4.99 12.445 5.28 12.233 5.83 12.017C8.96 10.674 11.05 9.797 12.11 9.386C15.28 8.172 15.97 7.935 16.43 7.935C16.53 7.935 16.76 7.959 16.91 8.082C17.04 8.184 17.08 8.326 17.09 8.429C17.08 8.508 17.09 8.666 16.64 8.8Z" fill="currentColor"/>
          </svg>
          Открыть профиль в Telegram
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .settings {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }

  .settings-group {
    background: #1e1e1e;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  h1 {
    text-align: center;
    color: rgba(255, 255, 255, 0.87);
  }

  h2 {
    color: rgba(255, 255, 255, 0.87);
    font-size: 1.2rem;
    margin: 0 0 1rem;
  }

  .setting-item {
    margin-bottom: 1rem;
  }

  .setting-item:last-child {
    margin-bottom: 0;
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
      padding: 0.75rem;
    }

    .settings-group {
      padding: 1rem;
    }
  }
</style> 