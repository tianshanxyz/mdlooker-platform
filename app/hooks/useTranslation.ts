// 翻译Hook
// 用于前端调用百度翻译API

import { useState, useCallback } from 'react';

interface TranslationResult {
  translatedText: string;
  sourceText: string;
  from: string;
  to: string;
}

interface UseTranslationReturn {
  translate: (text: string, from?: string, to?: string) => Promise<string>;
  translateBatch: (texts: string[], from?: string, to?: string) => Promise<string[]>;
  isLoading: boolean;
  error: string | null;
  isAvailable: boolean;
  checkAvailability: () => Promise<boolean>;
}

/**
 * 翻译Hook
 */
export function useTranslation(): UseTranslationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  /**
   * 检查翻译服务是否可用
   */
  const checkAvailability = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/translate');
      const data = await response.json();
      const available = data.status === 'available';
      setIsAvailable(available);
      return available;
    } catch (err) {
      setIsAvailable(false);
      return false;
    }
  }, []);

  /**
   * 翻译单个文本
   */
  const translate = useCallback(async (
    text: string,
    from: string = 'auto',
    to: string = 'en'
  ): Promise<string> => {
    if (!text.trim()) return text;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, from, to }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }

      const result = await response.json();
      return result.data.translatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      return text; // 失败时返回原文
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 批量翻译
   */
  const translateBatch = useCallback(async (
    texts: string[],
    from: string = 'auto',
    to: string = 'en'
  ): Promise<string[]> => {
    if (texts.length === 0) return [];

    setIsLoading(true);
    setError(null);

    try {
      // 合并文本（用特殊分隔符）
      const combinedText = texts.join('\n---TRANSLATE_SEPARATOR---\n');
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: combinedText, from, to }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }

      const result = await response.json();
      const translatedTexts = result.data.translatedText
        .split('\n---TRANSLATE_SEPARATOR---\n')
        .map((t: string) => t.trim());
      
      return translatedTexts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      return texts; // 失败时返回原文数组
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    translate,
    translateBatch,
    isLoading,
    error,
    isAvailable,
    checkAvailability,
  };
}

export default useTranslation;
