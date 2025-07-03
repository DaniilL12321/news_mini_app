<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  
  export let show = false;
  export let onClose = () => {};

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && show) {
      onClose();
    }
  };

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<button class="modal-backdrop" 
     class:show
     on:click={onClose}
     on:keydown={(e) => e.key === 'Escape' && onClose()}
     type="button"
     transition:fade={{duration: 200}}>
  <button class="modal-content"
       class:show
       on:click|stopPropagation
       on:keydown|stopPropagation
       type="button"
       transition:slide={{duration: 300, easing: quintOut}}>
    <button class="close-button" on:click={onClose}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <slot />
  </button>
</button>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 1000;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s linear 0.2s, opacity 0.2s;
    border: none;
    padding: 0;
    text-align: left;
  }

  .modal-backdrop.show {
    visibility: visible;
    opacity: 1;
    transition-delay: 0s;
  }

  .modal-content {
    background: #1a1a1a;
    width: 100%;
    max-height: 80vh;
    max-width: 80vh;
    border-radius: 24px 24px 0 0;
    padding: 24px;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.2);
    word-wrap: break-word;
    word-break: break-word;
    border: none;
    text-align: left;
  }

  .modal-content.show {
    transform: translateY(0);
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    padding: 0;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    transform: scale(1.05);
  }

  .close-button:active {
    transform: scale(0.95);
  }
</style> 