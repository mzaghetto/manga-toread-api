import express from 'express';
import Manga from '../models/Manga.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Cookie from '../models/Cookie.js';
import Header from '../models/Header.js';

const router = express.Router();

// Listando informações de manga específico
router.get('/:manga_name', async (req, res) => {
  try {
    const manga = await Manga.findOne({ manga_name: req.params.manga_name });

    if (!manga) {
      return res.status(404).json({ message: "Manga not found" });
    }

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

    // Faz a request real com os cookies e headers armazenados
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

    res.json({
      last_ep_released: integerLastEpReleased,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.toString() });
  }
});

export default router;
