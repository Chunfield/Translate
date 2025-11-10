// src/content/tooltip.ts

let currentTooltip: HTMLDivElement | null = null;
let isExpanded = false;

/**
 * 显示翻译 Tooltip（可展开详情）
 */
export function showTooltip(
  originalText: string,
  translatedText: string,
  rect?: DOMRect,
  onExpand?: () => Promise<void>
) {
  hideTooltip();

  const tooltip = document.createElement('div');
  tooltip.id = 'translator-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    max-width: 300px;
    z-index: 10001;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    word-break: break-word;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: auto;
    cursor: default;
  `;

  // 主体内容
  const contentDiv = document.createElement('div');
  contentDiv.style.display = 'flex';
  contentDiv.style.alignItems = 'center';
  contentDiv.style.justifyContent = 'space-between';

  const left = document.createElement('div');

  const b = document.createElement('b');
  b.textContent = originalText;
  left.appendChild(b);
  left.appendChild(document.createElement('br'));

  const span = document.createElement('span');
  span.textContent = translatedText;
  left.appendChild(span);

  contentDiv.appendChild(left);

  // ▶ 展开按钮
  const expandBtn = document.createElement('button');
  expandBtn.textContent = '▶';
  expandBtn.style.cssText = `
    background: none;
    border: none;
    color: #ddd;
    font-size: 12px;
    margin-left: 8px;
    cursor: pointer;
    transform: rotate(0deg);
    transition: transform 0.2s;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  expandBtn.title = '查看详细解释';

  contentDiv.appendChild(expandBtn);
  tooltip.appendChild(contentDiv);

  // 详情面板（默认隐藏）
  const detailPanel = document.createElement('div');
  detailPanel.style.cssText = `
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid #555;
    font-size: 13px;
    display: none;
  `;
  tooltip.appendChild(detailPanel);

  document.body.appendChild(tooltip);

  // 展开/收起逻辑
  expandBtn.addEventListener('click', e => {
    e.stopPropagation();
    isExpanded = !isExpanded;
    expandBtn.style.transform = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
    detailPanel.style.display = isExpanded ? 'block' : 'none';

    if (isExpanded && detailPanel.children.length === 0 && onExpand) {
      void (async () => {
        try {
          await onExpand();
        } catch {
          detailPanel.textContent = '加载失败';
        }
      })();
    }
  });

  // 定位
  requestAnimationFrame(() => {
    if (!document.body.contains(tooltip)) return;

    let left: number;
    let top: number;

    if (rect) {
      left = rect.left + window.scrollX;
      top = rect.bottom + window.scrollY + 8;

      const tooltipWidth = tooltip.offsetWidth;
      if (left + tooltipWidth > window.innerWidth + window.scrollX) {
        left = window.innerWidth + window.scrollX - tooltipWidth - 8;
      }
      if (left < window.scrollX) {
        left = 8 + window.scrollX;
      }
    } else {
      left = window.innerWidth / 2 - tooltip.offsetWidth / 2 + window.scrollX;
      top = window.innerHeight / 2 + window.scrollY;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.opacity = '1';
  });

  currentTooltip = tooltip;
}

export function hideTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
    isExpanded = false;
  }
}
