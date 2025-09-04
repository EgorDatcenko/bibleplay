// Оптимизированная система загрузки карт
// Решает проблемы с медленной загрузкой изображений

export interface CardImage {
  id: number;
  front: string;
  back: string;
  loaded: boolean;
  loading: boolean;
  error: boolean;
}

class CardLoader {
  private imageCache = new Map<string, HTMLImageElement>();
  private loadingQueue: string[] = [];
  private maxConcurrent = 3; // Максимум одновременных загрузок
  private currentLoading = 0;

  // Предзагрузка критически важных карт (первые 20)
  preloadCriticalCards(cards: any[]) {
    const criticalCards = cards.slice(0, 20);
    criticalCards.forEach(card => {
      if (card.imageFront) this.preloadImage(card.imageFront);
      if (card.imageBack) this.preloadImage(card.imageBack);
    });
  }

  // Ленивая загрузка карт по требованию
  async loadCardImages(cards: any[], priority: 'high' | 'medium' | 'low' = 'medium') {
    const imageUrls = cards.flatMap(card => [
      card.imageFront,
      card.imageBack
    ]).filter(Boolean);

    if (priority === 'high') {
      // Высокий приоритет - загружаем все сразу
      await Promise.all(imageUrls.map(url => this.loadImage(url)));
    } else if (priority === 'medium') {
      // Средний приоритет - загружаем по очереди, но быстро
      for (const url of imageUrls) {
        await this.loadImage(url);
      }
    } else {
      // Низкий приоритет - добавляем в очередь
      imageUrls.forEach(url => this.addToQueue(url));
    }
  }

  private async loadImage(url: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      
      img.onerror = () => {
        console.warn(`Не удалось загрузить изображение: ${url}`);
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Оптимизация загрузки
      (img as any).decoding = 'async';
      (img as any).loading = 'eager';
      img.src = url;
    });
  }

  private addToQueue(url: string) {
    if (!this.loadingQueue.includes(url) && !this.imageCache.has(url)) {
      this.loadingQueue.push(url);
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.currentLoading >= this.maxConcurrent || this.loadingQueue.length === 0) {
      return;
    }

    this.currentLoading++;
    const url = this.loadingQueue.shift()!;
    
    try {
      await this.loadImage(url);
    } catch (error) {
      console.warn(`Ошибка загрузки изображения из очереди: ${url}`, error);
    } finally {
      this.currentLoading--;
      this.processQueue(); // Обрабатываем следующее изображение
    }
  }

  // Получить изображение (из кэша или загрузить)
  async getImage(url: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!;
    }
    return this.loadImage(url);
  }

  // Очистить кэш для экономии памяти
  clearCache() {
    this.imageCache.clear();
    this.loadingQueue = [];
    this.currentLoading = 0;
  }

  // Получить статистику загрузки
  getStats() {
    return {
      cached: this.imageCache.size,
      queued: this.loadingQueue.length,
      loading: this.currentLoading
    };
  }
}

// Создаем глобальный экземпляр
export const cardLoader = new CardLoader();

// Хук для React компонентов
export function useCardLoader() {
  const preloadCards = (cards: any[], priority: 'high' | 'medium' | 'low' = 'medium') => {
    cardLoader.loadCardImages(cards, priority);
  };

  const getCardImage = (url: string) => {
    return cardLoader.getImage(url);
  };

  const clearCache = () => {
    cardLoader.clearCache();
  };

  return { preloadCards, getCardImage, clearCache };
}
