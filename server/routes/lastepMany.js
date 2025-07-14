import express from 'express';
import Manga from '../models/Manga.js';
import * as cheerio from 'cheerio';
import Cookie from '../models/Cookie.js';
import Header from '../models/Header.js';
import axios from 'axios';
import colorConsole from '../../lib/color.js';
import util from 'util';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const allManga = await Manga.find();

    // Recupera cookies do banco
    const cookieDocs = await Cookie.find({});
    if (!cookieDocs || cookieDocs.length === 0) {
      return res.status(400).json({ message: 'No cookies found. Please generate cookies first.' });
    }

    // Monta os cookies no formato "name=value; name2=value2"
    const cookieString = cookieDocs.map(c => `${c.name}=${c.value}`).join('; ');

    // Recupera headers do banco
    const headerDocs = await Header.find({});
    if (!headerDocs || headerDocs.length === 0) {
      return res.status(400).json({ message: 'No headers found. Please generate cookies and headers first.' });
    }
    // Monta headers para a request
    const storedHeaders = headerDocs.reduce((acc, h) => {
      acc[h.name] = h.value;
      return acc;
    }, {});

    const mangasUpdated = {success: {}, error: {}};

    // update each manga
    for (const manga of allManga) {

      try {
      const { data } = await axios.get(manga.url_crawler, {
        headers: {
          ...storedHeaders,
          Cookie: cookieString,
        },
      });      

      const $ = cheerio.load(data);

      // Seleciona o primeiro elemento da lista de capítulos
      const lastChapterElement = $('.chapter-list li:first-child');

      const lastChapterRaw = lastChapterElement.find('.chapter-number').text().trim();
      const cleanedLastEpReleased = lastChapterRaw.replace('-eng-li', '').trim();

      const integerLastEpReleased = parseInt(cleanedLastEpReleased, 10);

      const mangaUpdated = await Manga.findOneAndUpdate({ manga_name: manga.manga_name }, { last_episode_released: integerLastEpReleased }, { new: true });

      mangasUpdated.success[mangaUpdated.manga_name] = {
        last_ep_read: mangaUpdated.last_episode_read,
        last_ep_released: mangaUpdated.last_episode_released,
      };

      } catch (error) {
        mangasUpdated.error[manga.manga_name] = error.toString();
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
