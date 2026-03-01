// 翻译按钮组件
// 用于触发文本翻译

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TranslateButtonProps {
  text: string;
  onTranslated: (translatedText: string) => void;
  from?: string;
  to?: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * 翻译按钮组件
 */
export function TranslateButton({
  text,
  onTranslated,
  from = 'auto',
  to = 'en',
  className = '',
  showIcon = true,
}: TranslateButtonProps) {
  const { translate, isLoading, isAvailable, checkAvailability } = useTranslation();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    checkAvailability().then(() => setHasChecked(true));
  }, [checkAvailability]);

  const handleTranslate = async () => {
    const result = await translate(text, from, to);
    onTranslated(result);
  };

  // 如果翻译服务未配置，不显示按钮
  if (hasChecked && !isAvailable) {
    return null;
  }

  return (
    <button
      onClick={handleTranslate}
      disabled={isLoading || !text.trim()}
      className={`
        inline-flex items-center gap-1 px-2 py-1 text-xs
        bg-blue-50 text-blue-600 rounded hover:bg-blue-100
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {showIcon && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
      )}
      {isLoading ? '翻译中...' : '翻译'}
    </button>
  );
}

interface TranslatableTextProps {
  text: string;
  defaultTranslated?: string;
  className?: string;
  showTranslateButton?: boolean;
}

/**
 * 可翻译文本组件
 * 显示原文，并提供翻译按钮
 */
export function TranslatableText({
  text,
  defaultTranslated,
  className = '',
  showTranslateButton = true,
}: TranslatableTextProps) {
  const [translatedText, setTranslatedText] = useState(defaultTranslated || '');
  const [showTranslated, setShowTranslated] = useState(false);
  const { isAvailable, checkAvailability } = useTranslation();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    checkAvailability().then(() => setHasChecked(true));
  }, [checkAvailability]);

  const handleTranslated = (result: string) => {
    setTranslatedText(result);
    setShowTranslated(true);
  };

  const toggleTranslation = () => {
    setShowTranslated(!showTranslated);
  };

  // 如果没有翻译服务且不显示按钮，直接显示原文
  if (!showTranslateButton || (hasChecked && !isAvailable)) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {showTranslated && translatedText ? translatedText : text}
      
      {translatedText ? (
        <button
          onClick={toggleTranslation}
          className="ml-2 text-xs text-blue-500 hover:text-blue-700 underline"
        >
          {showTranslated ? '显示原文' : '显示译文'}
        </button>
      ) : (
        <TranslateButton
          text={text}
          onTranslated={handleTranslated}
          className="ml-2"
        />
      )}
    </span>
  );
}

export default TranslateButton;
