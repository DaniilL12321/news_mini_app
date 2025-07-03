<script lang="ts">
  import Modal from './Modal.svelte';
  import { writable } from 'svelte/store';

  interface Address {
    street: string;
    house: string;
  }

  interface NewsItem {
    id: number;
    title: string;
    content: string;
    date: string;
    link: string;
    likes_count: number;
    dislikes_count: number;
  }

  export let news: NewsItem[] = [];
  
  const addressStore = writable<Address | null>(null);
  let selectedNews: NewsItem | null = null;
  
  if (typeof localStorage !== 'undefined') {
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      addressStore.set(JSON.parse(savedAddress));
    }
  }

  addressStore.subscribe(value => {
    if (typeof localStorage !== 'undefined' && value) {
      localStorage.setItem('userAddress', JSON.stringify(value));
    }
  });

  let street = '';
  let house = '';
  let editMode = false;

  function saveAddress() {
    if (street && house) {
      addressStore.set({ street, house });
      editMode = false;
    }
  }

  const streetPattern = /(?:ул(?:ица)?\.?\s+)?([А-Яа-я\s-]+)(?:\s+(?:д(?:ом)?\.?\s*)?(\d+))?/i;
  const housePattern = /(?:д(?:ом)?\.?\s*)?(\d+)/i;

  $: address = $addressStore;
  
  $: relevantNews = address ? news.filter(item => {
    const text = `${item.title} ${item.content}`.toLowerCase();
    const userStreet = address.street.toLowerCase();
    
    if (!text.includes(userStreet)) return false;
    
    if (address.house) {
      const userHouse = address.house;
      const houseMatches = text.match(new RegExp(`(?:д(?:ом)?\.?\\s*)?${userHouse}\\b`, 'i'));
      return !!houseMatches;
    }
    
    return true;
  }) : [];

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function extractImageUrls(content: string): string[] {
    const regex = /(?:📷|🖼️?)\s*(?:И|и)зображени(?:я|e)?:?\s*(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif))/g;
    const matches = [...content.matchAll(regex)];
    return matches.map(match => match[1]);
  }

  function removeImageUrls(content: string): string {
    return content.replace(/(?:📷|🖼️?)\s*(?:И|и)зображени(?:я|e)?:?\s*https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif)/g, '').trim();
  }

  function truncateText(text: string, maxLength: number = 150): string {
    const cleanText = removeImageUrls(text);
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.slice(0, maxLength) + '...';
  }
</script>

<div class="address-news">
  <h1>Мой адрес</h1>

  {#if !address || editMode}
    <div class="address-form">
      <div class="form-group">
        <label for="street">Улица</label>
        <input 
          type="text" 
          id="street" 
          bind:value={street} 
          placeholder="Например: Ленина"
        >
      </div>
      <div class="form-group">
        <label for="house">Дом</label>
        <input 
          type="text" 
          id="house" 
          bind:value={house} 
          placeholder="Например: 4"
        >
      </div>
      <button class="save-button" on:click={saveAddress}>
        Сохранить адрес
      </button>
    </div>
  {:else}
    <div class="current-address">
      <div class="address-display">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
        </svg>
        <span>ул. {address.street}, д. {address.house}</span>
      </div>
      <button class="edit-button" on:click={() => {
        street = address.street;
        house = address.house;
        editMode = true;
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
        </svg>
        Изменить
      </button>
    </div>

    {#if relevantNews.length > 0}
      <div class="news-grid">
        {#each relevantNews as item}
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
          </div>
        {/each}
      </div>
    {:else}
      <div class="no-news">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18Z" fill="currentColor"/>
          <path d="M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z" fill="currentColor"/>
          <path d="M6 14L8 12L10 14L14 10L16 12L18 10V16H6V14Z" fill="currentColor"/>
        </svg>
        <p>Новостей по вашему адресу пока нет</p>
        <p class="hint">Мы уведомим вас, когда появятся новости об отключениях или ремонтных работах по вашему адресу</p>
      </div>
    {/if}
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
          👍 {selectedNews.likes_count}
        </span>
        <span class="reaction">
          👎 {selectedNews.dislikes_count}
        </span>
      </div>
    </div>
  </Modal>
{/if}

<style>
  .address-news {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0rem;
  }

  h1 {
    text-align: center;
    color: rgba(255, 255, 255, 0.87);
  }

  .address-form {
    background: #1e1e1e;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group:last-child {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: rgba(255, 255, 255, 0.6);
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #2a2a2a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.87);
    font-size: 1rem;
  }

  input:focus {
    outline: none;
    border-color: #2563eb;
  }

  .save-button {
    width: 100%;
    padding: 0.75rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .save-button:hover {
    background: #1d4ed8;
  }

  .current-address {
    background: #1e1e1e;
    border-radius: 16px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .address-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: rgba(255, 255, 255, 0.87);
  }

  .address-display span {
    word-wrap: break-word;
    word-break: break-word;
    flex: 1;
  }

  .edit-button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .edit-button:hover {
    color: rgba(255, 255, 255, 0.87);
    background: rgba(255, 255, 255, 0.05);
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
    word-wrap: break-word;
    word-break: break-word;
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
    word-wrap: break-word;
    word-break: break-word;
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

  .no-news {
    text-align: center;
    padding: 3rem 1rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .no-news svg {
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .no-news p {
    margin: 0;
  }

  .hint {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 0.5rem;
  }

  @media (max-width: 640px) {
    .address-news {
      padding: 0rem;
    }

    .news-grid {
      grid-template-columns: 1fr;
    }

    .news-card {
      margin-bottom: 1rem;
    }
  }
</style> 