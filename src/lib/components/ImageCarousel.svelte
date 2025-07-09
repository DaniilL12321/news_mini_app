<script lang="ts">
  export let images: string[] = [];
  
  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let containerElement: HTMLElement;
  let lastWheelTime = 0;
  let wheelDelta = 0;
  
  function next() {
    currentIndex = (currentIndex + 1) % images.length;
  }
  
  function prev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }

  function goToSlide(index: number) {
    currentIndex = index;
  }

  function handleTouchStart(event: TouchEvent) {
    touchStartX = event.touches[0].clientX;
  }

  function handleTouchMove(event: TouchEvent) {
    touchEndX = event.touches[0].clientX;
  }

  function handleTouchEnd() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        prev();
      } else {
        next();
      }
    }
  }

  function handleWheel(event: WheelEvent) {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      event.preventDefault();
      
      const now = Date.now();
      const timeDiff = now - lastWheelTime;
      
      wheelDelta += event.deltaX;
      
      if (timeDiff > 500 && Math.abs(wheelDelta) > 50) {
        if (wheelDelta > 0) {
          next();
        } else {
          prev();
        }
        
        wheelDelta = 0;
        lastWheelTime = now;
      }
      
      if (timeDiff > 1000) {
        wheelDelta = 0;
      }
    }
  }
</script>

{#if images.length > 0}
  <div 
    class="carousel"
    bind:this={containerElement}
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
    on:wheel={handleWheel}
  >
    <div class="carousel-container">
      <img 
        src={images[currentIndex]} 
        alt="Изображение {currentIndex + 1} из {images.length}"
        class="carousel-image"
        draggable="false"
      />
      
      {#if images.length > 1}
        <button class="carousel-button prev" on:click={prev}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="carousel-button next" on:click={next}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      {/if}
    </div>
    
    {#if images.length > 1}
      <div class="carousel-dots">
        {#each images as _, i}
          <button 
            class="dot" 
            class:active={i === currentIndex}
            on:click={() => goToSlide(i)}
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .carousel {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    position: relative;
    touch-action: pan-y pinch-zoom;
    user-select: none;
  }

  .carousel-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: 12px;
    overflow: hidden;
  }

  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #1a1a1a;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
  }

  .carousel-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .carousel-button:hover {
    background: rgba(0, 0, 0, 0.7);
  }

  .carousel-button.prev {
    left: 16px;
  }

  .carousel-button.next {
    right: 16px;
  }

  .carousel-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.3);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dot:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  .dot.active {
    background: #2563eb;
    width: 24px;
  }

  @media (max-width: 640px) {
    .carousel-button {
      width: 32px;
      height: 32px;
    }

    .carousel-button.prev {
      left: 8px;
    }

    .carousel-button.next {
      right: 8px;
    }
  }
</style> 