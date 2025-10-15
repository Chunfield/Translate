// src/content/tooltip.ts

import { speakText } from './speech'; // ✅ 引入语音功能

let tooltip: HTMLElement | null = null;

export function showTooltip(text: string, translation: string) {
  hideTooltip();

  tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: fixed;
    background: #333;
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    max-width: 300px;
    word-break: break-word;
    pointer-events: auto; /* ✅ 改为 auto，否则按钮无法点击 */
    opacity: 0;
    transition: opacity 0.2s;
  `;

  // ✅ 添加语音按钮（🔊）
  tooltip.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
      <strong>${text}</strong>
      <button data-action="speak" 
              style="background: none; border: none; color: #ccc; font-size: 16px; cursor: pointer; padding: 0 4px;"
              title="朗读原文">
        🔊
      </button>
    </div>
    <div style="margin-top: 4px; opacity: 0.9;">${translation}</div>
  `;

  // ✅ 绑定语音播放事件
  const speakButton = tooltip.querySelector('[data-action="speak"]');
  speakButton?.addEventListener('click', e => {
    e.stopPropagation(); // 防止触发 hideTooltip
    speakText(text); // 播放原文
  });

  document.body.appendChild(tooltip);

  // 获取选区位置
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // 定位在选区上方
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.top + window.scrollY - 40}px`;

  // 触发显示动画
  requestAnimationFrame(() => {
    if (tooltip) tooltip.style.opacity = '1';
  });

  // 3秒后自动消失
  setTimeout(hideTooltip, 3000);
}

export function hideTooltip() {
  if (tooltip && tooltip.parentElement) {
    tooltip.parentElement.removeChild(tooltip);
  }
  tooltip = null;
}
