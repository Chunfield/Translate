// src/content/content.ts

import { translateText } from './translator';
import { showTooltip, hideTooltip } from './tooltip';

// ✅ 定义缺失的函数
function removeTranslateIcon() {
  const icon = document.getElementById('translator-icon');
  if (icon) icon.remove();
}

async function handleTranslationRequest() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    hideTooltip();
    removeTranslateIcon();
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const text = selection.toString().trim();

  if (!text) {
    hideTooltip();
    removeTranslateIcon();
    return;
  }

  try {
    const result = await translateText(text, 'zh');

    // ✅ 改为返回 Promise 的普通函数，避免 require-await
    const loadDetails = (): Promise<void> => {
      return new Promise(resolve => {
        const detailPanel = document.querySelector(
          '#translator-tooltip .detail-panel'
        ) as HTMLElement;

        if (!result.posEntries || result.posEntries.length === 0) {
          detailPanel.textContent = '暂无详细解释';
          resolve();
          return;
        }

        detailPanel.innerHTML = '';

        for (const item of result.posEntries) {
          const group = document.createElement('div');
          group.style.marginBottom = '6px';

          const pos = document.createElement('div');
          pos.style.color = '#88c';
          pos.textContent = item.pos;
          group.appendChild(pos);

          const def = document.createElement('div');
          def.textContent = item.definition;
          group.appendChild(def);

          if (item.examples.length > 0) {
            const exTitle = document.createElement('div');
            exTitle.style.color = '#ccc';
            exTitle.style.fontSize = '12px';
            exTitle.textContent = '例句:';
            group.appendChild(exTitle);

            for (const example of item.examples) {
              const ex = document.createElement('div');
              ex.style.marginLeft = '10px';
              ex.style.fontSize = '12px';
              ex.style.color = '#ddd';
              ex.textContent = example;
              group.appendChild(ex);
            }
          }

          if (item.synonyms.length > 0) {
            const syn = document.createElement('div');
            syn.style.fontSize = '12px';
            syn.style.color = '#aaa';
            syn.textContent = '同义词: ' + item.synonyms.slice(0, 3).join(', ');
            group.appendChild(syn);
          }

          detailPanel.appendChild(group);
        }

        resolve();
      });
    };

    removeTranslateIcon();
    showTooltip(text, result.text, rect, loadDetails);
  } catch {
    console.error('[划词翻译] 翻译失败');
    removeTranslateIcon();
    showTooltip(text, '翻译失败', rect);
  }
}

// ✅ 注册事件，让函数被“使用”
document.addEventListener('mouseup', () => {
  setTimeout(handleTranslationRequest, 50); // 延迟确保 selection 更新完成
});
