// src/content/translator.ts

interface GoogleTranslateResponse {
  [0]: Array<{
    [0]: string;
    [1]: string;
    [2]: string;
  }>;
}

export interface TranslationResult {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export async function translateText(
  text: string,
  to = 'zh',
  from = 'auto'
): Promise<TranslationResult> {
  const encodedText = encodeURIComponent(text);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodedText}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`翻译请求失败: ${response.status}`);
    }

    const data = (await response.json()) as GoogleTranslateResponse;

    const translatedText = data[0][0][0];
    const detectedLang = data[0][0][2] || from;

    return {
      text: translatedText,
      sourceLang: detectedLang,
      targetLang: to,
    };
  } catch (error) {
    console.error('[翻译失败]', error);
    throw error;
  }
}
