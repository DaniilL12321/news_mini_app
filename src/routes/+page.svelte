<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import Settings from '$lib/components/Settings.svelte';
  import AddressNews from '$lib/components/AddressNews.svelte';
  import ImageCarousel from '$lib/components/ImageCarousel.svelte';
  import type { TelegramWebApp, TelegramWebAppUser } from '$lib/types/telegram';
  /** @type {import('./$types').PageData} */
  export let data;

  interface NewsItem {
    id: number;
    title: string;
    content: string;
    date: string;
    link: string;
    likes_count: number;
    dislikes_count: number;
    category?: string;
  }

  interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  }

  interface Category {
    emoji: string;
    name: string;
    pattern: RegExp;
  }

  const categories: Category[] = [
    { emoji: '⚡', name: 'Отключения электричества', pattern: /электроэнерг|электроснабжен/i },
    { emoji: '💧', name: 'Отключения воды', pattern: /водоснабжен|отключен.*вод/i },
    { emoji: '📝', name: 'Памятки', pattern: /памятка|правила|профилактик/i },
    { emoji: '❗', name: 'Важное', pattern: /^внимание|^срочно|^важно|учения|сбор помощи|погорельц/i },
    { emoji: '🚗', name: 'Движение транспорта', pattern: /организации движени|движени.*транспорт|организац.*движен/i },
    { emoji: '🎉', name: 'Мероприятия', pattern: /концерт|выставк|праздни|фестивал|меропри/i },
    { emoji: '📌', name: 'Другое', pattern: /.*/ }
  ];

  let selectedNews: NewsItem | null = null;
  let activeTab: 'news' | 'address' | 'settings' = 'news';
  let searchQuery: string = '';
  let sortBy: 'date' | 'popularity' = 'date';
  let showImages: boolean = true;
  let darkMode: boolean = true;
  let selectedCategory: string | null = null;
  let telegramUser: TelegramUser | null = null;

  $: isInTelegramWebApp = typeof window !== 'undefined' && 
    window?.Telegram?.WebApp?.initData && 
    window?.Telegram?.WebApp?.initData.length > 0 ? true : false;

  $: if (isInTelegramWebApp && window?.Telegram?.WebApp) {
    try {
      const webApp = window.Telegram.WebApp;
      if (webApp.initDataUnsafe?.user) {
        telegramUser = webApp.initDataUnsafe.user;
      }
    } catch (e) {
      console.error('Ошибка при получении данных пользователя:', e);
    }
  }

  $: showTelegramPrompt = !isInTelegramWebApp && activeTab === 'settings';

  function determineCategory(item: NewsItem): string {
    const text = `${item.title} ${item.content}`.toLowerCase();
    for (const category of categories) {
      if (category.pattern.test(text)) {
        return category.name;
      }
    }
    return 'Другое';
  }

  $: processedNews = data.items?.map((item: NewsItem) => ({
    ...item,
    category: determineCategory(item)
  })) ?? [];

  $: filteredNews = processedNews
    .filter((item: NewsItem) => {
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }
      const query = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(query) || 
             item.content.toLowerCase().includes(query);
    })
    .sort((item1: NewsItem, item2: NewsItem) => {
      if (sortBy === 'date') {
        return new Date(item2.date).getTime() - new Date(item1.date).getTime();
      } else {
        return (item2.likes_count - item2.dislikes_count) - (item1.likes_count - item1.dislikes_count);
      }
    });

  $: categoryCounts = categories.map(cat => ({
    ...cat,
    count: processedNews.filter((item: NewsItem) => item.category === cat.name).length
  }));

  /** @param {string} dateString */
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /** @param {string} content */
  function extractImageUrls(content: string): string[] {
    const regex = /(?:📷|🖼️?)\s*(?:И|и)зображени(?:я|e)?:?\s*((?:https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif)(?:\s|$))+)/g;
    const matches = content.match(regex);
    if (!matches) return [];
    
    const urls: string[] = [];
    matches.forEach(match => {
      const urlMatches = match.match(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif))/g);
      if (urlMatches) {
        urls.push(...urlMatches);
      }
    });
    return urls;
  }

  /** @param {string} content */
  function removeImageUrls(content: string): string {
    return content.replace(/(?:📷|🖼️?)\s*(?:И|и)зображени(?:я|e)?:?\s*(?:https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif)(?:\s|$))+/g, '').trim();
  }

  /** @param {string} text */
  function truncateText(text: string, maxLength: number = 150): string {
    const cleanText = removeImageUrls(text);
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.slice(0, maxLength) + '...';
  }

  let pageTitle = "Новости города Нерехта - официальное приложение";
  let pageDescription = "Актуальные новости города Нерехта: отключения, ремонтные работы, события и важная информация для жителей.";

  $: if (selectedCategory) {
    pageTitle = `${selectedCategory} - Новости города Нерехта`;
    pageDescription = `Актуальные новости города Нерехта в категории "${selectedCategory}". Оперативная информация для жителей города.`;
  }

  $: if (searchQuery) {
    pageTitle = `Поиск: ${searchQuery} - Новости города Нерехта`;
    pageDescription = `Результаты поиска по запросу "${searchQuery}" в новостях города Нерехта.`;
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
</svelte:head>

<main class="container" class:no-images={!showImages}>
  {#if showTelegramPrompt}
    <section class="telegram-prompt" aria-label="Предложение открыть в Telegram">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h2>Откройте в Telegram</h2>
      <p>Для доступа к настройкам, пожалуйста, откройте это приложение в Telegram.</p>
      <a href="https://t.me/your_bot_username/app" class="telegram-button">
        Открыть миниапу
      </a>
    </section>
  {:else}
    {#if activeTab === 'news'}
      <header>
        <h1>Новости города Нерехта</h1>
        <nav class="categories-chips" aria-label="Категории новостей">
          <button 
            class="category-chip" 
            class:active={selectedCategory === null}
            on:click={() => selectedCategory = null}
          >
            <span>🔍 Все</span>
            <span class="count">{processedNews.length}</span>
          </button>
          {#each categoryCounts as { emoji, name, count }}
            <button 
              class="category-chip" 
              class:active={selectedCategory === name}
              on:click={() => selectedCategory = selectedCategory === name ? null : name}
            >
              <span>{emoji} {name}</span>
              <span class="count">{count}</span>
            </button>
          {/each}
        </nav>
      </header>

      <section class="search-section" aria-label="Поиск новостей">
        <SearchBar bind:value={searchQuery} />
      </section>

      {#if 'error' in data && data.error}
        <section class="error" role="alert">Ошибка: {data.error}</section>
      {:else if filteredNews.length > 0}
        <section class="news-grid" aria-label="Список новостей">
          {#each filteredNews as item}
            <article 
              class="news-card" 
              on:click={() => selectedNews = item}
              on:keydown={(e) => e.key === 'Enter' && (selectedNews = item)}
              role="article"
            >
              {#if showImages}
                <div class="news-image-container">
                  {#if extractImageUrls(item.content).length > 0}
                    <img 
                      src={extractImageUrls(item.content)[0]} 
                      alt="Изображение к новости"
                      class="news-thumbnail"
                      loading="lazy"
                    />
                  {:else}
                    <div class="news-thumbnail placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 16L8.586 11.414C8.96106 11.0389 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0389 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0389 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0389 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  {/if}
                  <div class="news-date-badge">{formatDate(item.date)}</div>
                </div>
              {/if}
              <div class="news-preview">
                <h2>{item.title}</h2>
                <p class="news-excerpt">{truncateText(item.content)}</p>
                <div class="news-footer">
                  <div class="reactions">
                    <span class="reaction">
                      👍 {item.likes_count}
                    </span>
                    <span class="reaction">
                      👎 {item.dislikes_count}
                    </span>
                  </div>
                  <div class="read-more">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </article>
          {/each}
        </section>
      {:else}
        <section class="no-results" aria-label="Новости не найдены">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
          </svg>
          <p>Новости не найдены</p>
        </section>
      {/if}
    {:else if activeTab === 'address'}
      <AddressNews news={processedNews} />
    {:else if activeTab === 'settings'}
      <Settings 
        bind:sortBy
        bind:showImages
        bind:darkMode
        {isInTelegramWebApp}
      />
    {/if}
  {/if}

  {#if activeTab === 'news' && filteredNews.length > 0}
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": ${JSON.stringify(filteredNews.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "NewsArticle",
            "headline": item.title,
            "articleBody": removeImageUrls(item.content),
            "datePublished": item.date,
            "image": extractImageUrls(item.content),
            "author": {
              "@type": "Organization",
              "name": "Администрация города Нерехта"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Новости города Нерехта",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Нерехта",
                "addressRegion": "Костромская область",
                "addressCountry": "Россия"
              }
            }
          }
        })))}
      }
    </script>
  {/if}
</main>

<nav class="bottom-nav" aria-label="Основная навигация">
  <BottomNav bind:activeTab />
</nav>

{#if selectedNews}
  <Modal 
    show={true} 
    onClose={() => selectedNews = null}
  >
    <article class="modal-news" role="article">
      <h2>{selectedNews.title}</h2>
      <div class="news-date">{formatDate(selectedNews.date)}</div>
      
      {#if showImages && extractImageUrls(selectedNews.content).length > 0}
        <div class="news-images">
          <ImageCarousel images={extractImageUrls(selectedNews.content)} />
        </div>
      {/if}
      
      <p class="news-content">{removeImageUrls(selectedNews.content)}</p>
      
      <a 
        href={selectedNews.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        class="read-more-button"
      >
        <span>Читать на официальном сайте</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>

      <div class="reactions">
        <span class="reaction">
          👍 {selectedNews.likes_count}
        </span>
        <span class="reaction">
          👎 {selectedNews.dislikes_count}
        </span>
      </div>
    </article>
  </Modal>
{/if}

<style>
  :global(body) {
    background: #121212;
    color: rgba(255, 255, 255, 0.87);
    padding-bottom: 72px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  }

  .container.no-images .news-card {
    grid-template-columns: 1fr;
  }

  h1 {
    color: rgba(255, 255, 255, 0.87);
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
  }

  .error {
    text-align: center;
    padding: 2rem;
    color: #ff4d4d;
    background: rgba(255, 77, 77, 0.1);
    border-radius: 12px;
  }

  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .news-card {
    background: #1e1e1e;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: 100%;
    text-align: left;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .news-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .news-image-container {
    width: 100%;
    height: 200px;
    position: relative;
    overflow: hidden;
    background: #1a1a1a;
  }

  .news-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .news-card:hover .news-thumbnail {
    transform: scale(1.05);
  }

  .placeholder {
    background: #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
  }

  .news-date-badge {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .news-preview {
    padding: 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .news-preview h2 {
    margin: 0;
    color: rgba(255, 255, 255, 0.87);
    font-size: 1.25rem;
    line-height: 1.4;
    margin-bottom: 0.75rem;
    font-weight: 600;
  }

  .news-excerpt {
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .news-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: auto;
  }

  .reactions {
    display: flex;
    gap: 1rem;
  }

  .reaction {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .read-more {
    color: rgba(255, 255, 255, 0.4);
    transition: color 0.2s ease;
  }

  .news-card:hover .read-more {
    color: rgba(255, 255, 255, 0.8);
  }

  .modal-news {
    color: rgba(255, 255, 255, 0.87);
  }

  .modal-news h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    padding-right: 2rem;
  }

  .modal-news .news-date {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .news-images {
    margin: 1.5rem 0;
    border-radius: 12px;
    overflow: hidden;
  }

  .news-image {
    max-width: 100%;
    max-height: 40vh;
    margin: 0 auto;
    border-radius: 12px;
    overflow: hidden;
  }

  .news-content {
    color: rgba(255, 255, 255, 0.87);
    line-height: 1.6;
    margin: 1.5rem 0;
    white-space: pre-line;
  }

  .read-more-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 500;
    margin: 1rem 0;
    transition: all 0.2s ease;
  }

  .read-more-button:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
  }

  .read-more-button:active {
    transform: translateY(0);
  }

  .no-results {
    text-align: center;
    padding: 3rem 1rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .no-results svg {
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .telegram-prompt {
    text-align: center;
    padding: 2rem;
    background: #1e1e1e;
    border-radius: 16px;
    margin: 2rem auto;
    max-width: 400px;
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

  .categories-chips {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.5rem;
    padding-top: 0.5rem;
    padding-bottom: 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .categories-chips::-webkit-scrollbar {
    display: none;
  }

  .category-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #1e1e1e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.87);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .category-chip:hover {
    background: #2a2a2a;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .category-chip.active {
    background: #2563eb;
    border-color: #2563eb;
    color: white;
  }

  .count {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    font-size: 0.8rem;
  }

  @media (max-width: 640px) {
    .news-grid {
      grid-template-columns: 1fr;
    }

    .container {
      padding: 0.75rem;
    }

    h1 {
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
    }

    .category-chip {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }
  }

  .cache-indicator {
    text-align: center;
    padding: 4px 8px;
    background: rgba(37, 99, 235, 0.1);
    color: #2563eb;
    border-radius: 8px;
    font-size: 0.8rem;
    margin: -0.5rem 0 1rem;
  }
</style>
