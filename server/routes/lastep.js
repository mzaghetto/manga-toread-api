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
    const lastChapterElement = $('.chapter-list li:first-child'); // Seleciona o último elemento da lista de capítulos

    const lastChapterNumber = lastChapterElement.find('.chapter-no').text().trim(); // Extrai o número do último capítulo
    const lastChapterTitle = lastChapterElement.find('.chapter-title').text().trim(); // Extrai o título do último capítulo
    const lastChapterUpdate = lastChapterElement.find('.chapter-update').text().trim(); // Extrai a data de atualização do último capítulo

    // Limpa e prepara a string do último episódio lançado
    const cleanedLastEpReleased = `${lastChapterNumber} ${lastChapterTitle}`.replace(/\s+/g, '').replace('-eng-li', '');

    res.json({
      last_ep_released: cleanedLastEpReleased,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.toString() });
  }
});

export default router;