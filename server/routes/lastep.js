import express from 'express';
import Manga from '../models/Manga.js';
import axios from 'axios';
import cheerio from 'cheerio';

const router = express.Router();

// Listando informações de manga específico
router.get('/:manga_name', async (req, res) => {
  try {
    const manga = await Manga.findOne({ manga_name: req.params.manga_name });

    if (!manga) {
      return res.status(404).json({ message: "Manga not found" });
    }

    const { data } = await axios.get(manga.url_crawler);

    const $ = cheerio.load(data);

    // Seleciona o primeiro elemento da lista de capítulos
    const lastChapterElement = $('.chapter-list li:first-child'); 

    // Extrai o número do capítulo a partir de .chapter-number e limpa o sufixo "-eng-li"
    const lastChapterRaw = lastChapterElement.find('.chapter-number').text().trim();
    const cleanedLastEpReleased = lastChapterRaw.replace('-eng-li', '').trim();

    // Converte para inteiro
    const integerLastEpReleased = parseInt(cleanedLastEpReleased, 10);

    res.json({
      last_ep_released: integerLastEpReleased,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.toString() });
  }
});

export default router;