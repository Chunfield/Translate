// src/content/content.ts

import { translateText } from './translator';
import { showTooltip, hideTooltip } from './tooltip';

/**
 * 防抖函数
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 划词翻译主函数
 */
const translateSelection = debounce(async () => {
  const text = window.getSelection()?.toString().trim();
  if (!text || text.length < 1) {
    hideTooltip();
    return;
  }

  try {
    const result = await translateText(text, 'zh'); // 翻译成中文
    showTooltip(text, result.text);
  } catch (err) {
    console.error('[划词翻译] 翻译失败', err);
    showTooltip(text, '翻译失败');
  }
}, 300);

// 监听鼠标松开事件
document.addEventListener('mouseup', translateSelection);

// 可选：点击页面其他地方隐藏 Tooltip
document.addEventListener('click', () => {
  hideTooltip();
});
