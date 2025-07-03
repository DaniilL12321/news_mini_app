<script lang="ts">
  export let value: string = '';
  export let placeholder: string = 'Поиск новостей...';
</script>

<div class="search-container">
  <div class="search-bar">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
    </svg>
    <input 
      type="text" 
      bind:value 
      {placeholder}
      on:input
    />
    {#if value}
      <button class="clear-button" on:click={() => value = ''}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
        </svg>
      </button>
    {/if}
  </div>
</div>

<style>
  .search-container {
    padding-top: 16px;
    padding-bottom: 16px;
    position: sticky;
    top: 0;
    background: #121212;
    z-index: 10;
  }

  .search-bar {
    background: #1e1e1e;
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  }

  .search-bar:focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }

  .search-bar svg {
    color: rgba(255, 255, 255, 0.6);
  }

  input {
    flex: 1;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.87);
    font-size: 1rem;
    outline: none;
    padding: 0;
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .clear-button {
    background: none;
    border: none;
    padding: 4px;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .clear-button:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
  }
</style> 