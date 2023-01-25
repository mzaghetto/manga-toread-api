import express from 'express'
import Manga from '../models/Manga.js'
import Xray from 'x-ray'

const router = express.Router()

// Listando informações de vários manhwas
router.get('/', async (req, res) => {
  const x = Xray()

  const mangaList = req.body.mangas
  let mangaListReturn = []

  // Use map to generate an array of promises
  const promises = mangaList.map(async manhwa => {
    const manga = await Manga.findOne({ manga_name: manhwa }).catch(error => res.status(500).json(error));
    const classFind = '#chpagedlist > ul > li:nth-child(1) > a > strong'
    return new Promise((resolve, reject) => {
        x(manga.url_crawler, classFind)(async function (err, cap) {
            if (err) reject(err);
            manga._doc.last_ep_released = await cap
            manga._doc.last_ep_released = await manga._doc.last_ep_released.replace(/\n/g, '')
            manga._doc.last_ep_released = await manga._doc.last_ep_released.replace(/ /g, '')
            manga._doc.last_ep_released = await manga._doc.last_ep_released.replace(/-eng-li/g, '')
            manga._doc.last_ep_released = parseInt(manga._doc.last_ep_released)
            resolve(manga._doc);
        })
    });
  });

  // Wait for all promises to resolve
  mangaListReturn = await Promise.all(promises);
  res.json(mangaListReturn);
});

export default router