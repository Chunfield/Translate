// src/content/translator.ts

interface GoogleTranslateDetailedResponse {
  [0]: [string, string, string][];
  [1]?: [string, [string][]][];
  [5]?: {
    [0]: string; // 词性
    [1]: [string, string, number, number][]; // 同义词
    [2]: string; // 定义
    [3]: [string][]; // 例句
  }[];
}

export interface TranslationResult {
  text: string;
  sourceLang: string;
  targetLang: string;
  // 新增：详细信息
  posEntries?: Array<{
    pos: string;
    definition: string;
    examples: string[];
    synonyms: string[];
  }>;
}

export async function translateText(
  text: string,
  to = 'zh',
  from = 'auto'
): Promise<TranslationResult> {
  const encodedText = encodeURIComponent(text);
  // 添加 dt=bd 获取详细信息（词性、定义、同义词、例句）
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&dt=bd&dt=ex&q=${encodedText}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`翻译请求失败: ${response.status}`);
    }

    const data = (await response.json()) as GoogleTranslateDetailedResponse;

    const translatedText = data[0][0][0];
    const detectedLang = data[0][0][2] || from;

    // 解析详细信息 (data[5])
    const posEntries: TranslationResult['posEntries'] = [];

    if (data[5]) {
      for (const item of data[5]) {
        const pos = item[0];
        const definition = item[2];
        const examples = item[3]?.map(([ex]) => ex) || [];
        const synonyms = item[1]?.map(([syn]) => syn) || [];

        posEntries.push({
          pos,
          definition,
          examples,
          synonyms,
        });
      }
    }

    return {
      text: translatedText,
      sourceLang: detectedLang,
      targetLang: to,
      posEntries,
    };
  } catch (error) {
    console.error('[翻译失败]', error);
    throw error;
  }
}
