const axios = require('axios');

const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * @desc   Translate text(s) using Google Translate API
 * @route  POST /api/translate
 * @access Private (requires auth token)
 *
 * Body:
 *   text   : string | string[]   – text(s) to translate
 *   target : 'en' | 'si'         – target language code
 *   source : 'en' | 'si'         – (optional) source language code; auto-detect if omitted
 */
exports.translate = async (req, res, next) => {
  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (!apiKey) {
      // Return original text when no API key is configured so the app still works
      const texts = Array.isArray(req.body.text) ? req.body.text : [req.body.text];
      return res.json({
        success: true,
        translations: texts,
        source: 'passthrough',
      });
    }

    const { text, target, source } = req.body;

    if (!text || !target) {
      return res.status(400).json({
        success: false,
        message: 'text and target language are required',
      });
    }

    const texts = Array.isArray(text) ? text : [text];

    // Filter out blank strings to avoid wasted API calls
    const nonEmpty = texts.filter(t => t && t.trim().length > 0);
    if (!nonEmpty.length) {
      return res.json({ success: true, translations: texts, source: 'passthrough' });
    }

    const params = {
      key: apiKey,
      target,
      format: 'text',
    };
    if (source) params.source = source;

    const response = await axios.post(
      GOOGLE_TRANSLATE_URL,
      { q: nonEmpty },
      { params, timeout: 10000 }
    );

    const raw = response.data?.data?.translations ?? [];

    // Re-insert blanks at their original positions
    const resultMap = new Map();
    let apiIdx = 0;
    texts.forEach((t, i) => {
      if (t && t.trim().length > 0) {
        resultMap.set(i, raw[apiIdx]?.translatedText ?? t);
        apiIdx++;
      } else {
        resultMap.set(i, t);
      }
    });

    const translations = texts.map((_, i) => resultMap.get(i));

    res.json({
      success: true,
      translations,
      source: 'google',
    });
  } catch (error) {
    // Log but don't crash – return original text as fallback
    console.error('[translateController] Google Translate error:', error.response?.data || error.message);
    const texts = Array.isArray(req.body.text) ? req.body.text : [req.body.text || ''];
    res.json({
      success: true,
      translations: texts,
      source: 'passthrough',
    });
  }
};
