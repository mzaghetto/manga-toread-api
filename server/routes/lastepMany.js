import express from 'express';
import Manga from '../models/Manga.js';
import * as cheerio from 'cheerio';
import Cookie from '../models/Cookie.js';
import Header from '../models/Header.js';
import axios from 'axios';
import colorConsole from '../../lib/color.js';
import util from 'util';

const router = express.Router();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, config, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, config);
      return response;
    } catch (error) {
      lastError = error;
      
      if (error.response?.status === 520 || error.response?.status === 429) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        colorConsole('FgYellow', `Tentativa ${attempt} falhou para ${url}. Aguardando ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

router.get('/', async (req, res) => {
  try {
    const { noCookie } = req.query;
    const allManga = await Manga.find();

    let headers = {};
    
    if (!noCookie) {
      const cookieDocs = await Cookie.find({});
      if (!cookieDocs || cookieDocs.length === 0) {
        return res.status(400).json({ message: 'No cookies found. Please generate cookies first.' });
      }

      const cookieString = cookieDocs.map(c => `${c.name}=${c.value}`).join('; ');

      const headerDocs = await Header.find({});
      if (!headerDocs || headerDocs.length === 0) {
        return res.status(400).json({ message: 'No headers found. Please generate cookies and headers first.' });
      }
      
      const storedHeaders = headerDocs.reduce((acc, h) => {
        acc[h.name] = h.value;
        return acc;
      }, {});

      headers = {
        ...storedHeaders,
        'User-Agent': storedHeaders['User-Agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        Cookie: cookieString,
      };
    } else {
      headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      };
    }

    const mangasUpdated = {success: {}, error: {}};

    for (const manga of allManga) {
      try {
        await delay(1000 + Math.random() * 2000);

        const { data } = await fetchWithRetry(manga.url_crawler, {
          headers,
          timeout: 30000,
          decompress: true
        });

        const $ = cheerio.load(data);

        const lastChapterElement = $('.chapter-list li:first-child');

        if (!lastChapterElement.length) {
          throw new Error('Capítulo não encontrado no HTML');
        }

        const lastChapterRaw = lastChapterElement.find('.chapter-number').text().trim();
        const cleanedLastEpReleased = lastChapterRaw.replace('-eng-li', '').trim();

        const integerLastEpReleased = parseInt(cleanedLastEpReleased, 10);

        if (isNaN(integerLastEpReleased)) {
          throw new Error(`Número do capítulo inválido: ${cleanedLastEpReleased}`);
        }

        const mangaUpdated = await Manga.findOneAndUpdate(
          { manga_name: manga.manga_name }, 
          { last_episode_released: integerLastEpReleased }, 
          { new: true }
        );

        mangasUpdated.success[mangaUpdated.manga_name] = {
          last_ep_read: mangaUpdated.last_episode_read,
          last_ep_released: mangaUpdated.last_episode_released,
        };

      } catch (error) {
        mangasUpdated.error[manga.manga_name] = {
          error: error.message || error.toString(),
          url: manga.url_crawler
        };
      }
    }
    
    colorConsole('FgGreen', `Released Manhwas Atualizado:\n${util.inspect(mangasUpdated, { colors: true, depth: null })}`);
    res.json(mangasUpdated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.toString() });
  }
});

export default router;
