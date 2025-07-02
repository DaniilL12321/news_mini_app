<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
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
  }

  let selectedNews: NewsItem | null = null;

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
    // Поддержка разных вариантов записи эмодзи камеры и текста
    const regex = /(?:📷|🖼️?)\s*(?:И|и)зображени(?:я|e)?:?\s*(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif))/g;
    const matches = [...content.matchAll(regex)];
    return matches.map(match => match[1]);
  }

  /** @param {string} content */
  function removeImageUrls(content: string): string {
    // Удаляем ссылки на изображения из текста
    return content.replace(/(?:📷|🖼️?)\s*(?:И|и)зображени(?:я|e)?:?\s*https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif)/g, '').trim();
  }

  /** @param {string} text */
  function truncateText(text: string, maxLength: number = 150): string {
    const cleanText = removeImageUrls(text);
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.slice(0, maxLength) + '...';
  }
</script>

<div class="container">
  <h1>Новости</h1>
  
  {#if 'error' in data && data.error}
    <div class="error">Ошибка: {data.error}</div>
  {:else if 'news' in data && Array.isArray(data.news)}
    <div class="news-grid">
      {#each data.news as item}
        <div class="news-card" on:click={() => selectedNews = item}>
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
          <div class="news-preview">
            <h2>{item.title}</h2>
            <p class="news-excerpt">{truncateText(item.content)}</p>
            <div class="news-footer">
              <div class="reactions">
                <span class="reaction">
                  👍 {item.likes_count || 0}
                </span>
                <span class="reaction">
                  👎 {item.dislikes_count || 0}
                </span>
              </div>
              <div class="read-more">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if selectedNews}
  <Modal 
    show={true} 
    onClose={() => selectedNews = null}
  >
    <div class="modal-news">
      <h2>{selectedNews.title}</h2>
      <div class="news-date">{formatDate(selectedNews.date)}</div>
      
      {#if extractImageUrls(selectedNews.content).length > 0}
        <div class="news-images">
          {#each extractImageUrls(selectedNews.content) as imageUrl}
            <img 
              src={imageUrl} 
              alt="Изображение к новости" 
              class="news-image" 
              loading="lazy" 
            />
          {/each}
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
          👍 {selectedNews.likes_count || 0}
        </span>
        <span class="reaction">
          👎 {selectedNews.dislikes_count || 0}
        </span>
      </div>
    </div>
  </Modal>
{/if}

<style>
  :global(body) {
    background: #121212;
    color: rgba(255, 255, 255, 0.87);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  }

  h1 {
    color: rgba(255, 255, 255, 0.87);
    text-align: center;
    margin-bottom: 2rem;
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
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .news-image {
    width: 100%;
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
  }
</style>
