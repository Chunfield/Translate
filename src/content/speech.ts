/**
 * 使用 Web Speech API 播放语音
 * @param text 要朗读的文本
 * @param lang 语言代码（可选，如 'en-US', 'zh-CN'）
 */
export function speakText(text: string, lang?: string) {
  // 停止之前正在播放的语音
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // 自动检测语言（增强版）
  if (!lang) {
    if (text.match(/[\u4e00-\u9fa5]/)) {
      utterance.lang = 'zh-CN';
    } else if (text.match(/[a-zA-Z]/)) {
      utterance.lang = 'en-US';
    } else if (text.match(/[\u3040-\u309F\u30A0-\u30FF]/)) {
      utterance.lang = 'ja-JP';
    } else if (text.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/)) {
      utterance.lang = 'ko-KR';
    } else {
      utterance.lang = 'en-US';
    }
  } else {
    utterance.lang = lang;
  }

  // 语速、音调、音量
  utterance.rate = 0.9; // 0.1 ~ 2.0
  utterance.pitch = 1; // 0.0 ~ 2.0
  utterance.volume = 1; // 0.0 ~ 1.0

  // 执行朗读
  speechSynthesis.speak(utterance);
}
