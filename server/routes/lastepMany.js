import express from 'express'
import Manga from '../models/Manga.js'
import axios from 'axios'
import * as cheerio from 'cheerio'
import Cookie from '../models/Cookie.js'
import Header from '../models/Header.js'
import colorConsole from '../../lib/color.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const mangas = await Manga.find({});
    
    if (!mangas || mangas.length === 0) {
      return res.status(404).json({ message: "No mangas found in database" });
    }

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

    const successResults = [];
    const errorResults = [];

    for (const manga of mangas) {
      try {
        colorConsole('FgCyan', `Processing manga: ${manga.manga_name}`);
        
        const { data } = await axios.get(manga.url_crawler, {
          headers: {
            ...storedHeaders,
            Cookie: cookieString,
          },
        });

        const $ = cheerio.load(data);

        const lastChapterElement = $('.chapter-list li:first-child');
        const lastChapterRaw = lastChapterElement.find('.chapter-number').text().trim();
        const cleanedLastEpReleased = lastChapterRaw.replace('-eng-li', '').trim();
        const integerLastEpReleased = parseInt(cleanedLastEpReleased, 10);

        // Atualiza o mangá no banco de dados
        await Manga.updateOne(
          { _id: manga._id },
          { $set: { last_episode_released: integerLastEpReleased } }
        );

        successResults.push({
          manga_name: manga.manga_name,
          last_episode_released: integerLastEpReleased,
          last_episode_read: manga.last_episode_read
        });

        colorConsole('FgGreen', `Success: Last Episode Released: ${integerLastEpReleased}`);
      } catch (error) {
        colorConsole('FgRed', error.toString());
        
        errorResults.push({
          manga_name: manga.manga_name,
        });
      }
    }

    res.json({
      success: {
        count: successResults.length,
        mangas: successResults
      },
      errors: {
        count: errorResults.length,
        mangas: errorResults
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.toString() });
  }
});

export default router