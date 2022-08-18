import express from 'express'
import Manga from '../models/Manga.js'

const router = express.Router()

// Listando todos os mangas do BD
router.get('/', (req, res) => {
  Manga.find()
    .then(mangas => {
      res.json(mangas);
    })
    .catch(error => res.status(500).json(error));
});

// Listando informações de manga específico
router.get('/buscar', (req, res) => {
  console.log('req.manga_name', req.body.manga_name)
  Manga.findOne({manga_name: req.body.manga_name})
    .then(manga => {
      res.json(manga);
    })
    .catch(error => res.status(500).json(error));
});

// Cria um novo campo e salva no bd
router.post('/add', async (req, res) => {
  const novoManga = new Manga({
    manga_name: req.body.manga_name,
    manga_thumb: req.body.manga_thumb,
    release_day: req.body.release_day,
    last_episode_read: req.body.last_episode_read,
    url_manga: req.body.url_manga,
    url_crawler: req.body.url_crawler,
    site: req.body.site,
  });

  const mangaAlreadyExists = await Manga.findOne({manga_name: req.body.manga_name})

  if (mangaAlreadyExists) {
    return res.status(409).json({
      message: 'Manga já existe no banco de dados'
    })
  }
  
  novoManga
    .save()
    .then(result => {
      res.json(result);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Atualização de um campo já existente
router.put('/editar/:id', (req, res) => {
  const novosDados = {
    manga_name: req.body.manga_name,
    manga_thumb: req.body.manga_thumb,
    release_day: req.body.release_day,
    last_episode_read: req.body.last_episode_read,
    url_manga: req.body.url_manga,
    url_crawler: req.body.url_crawler,
    site: req.body.site,
  }

  Manga.findOneAndUpdate({ _id: req.params.id }, novosDados, { new: true })
    .then(manga => {
      res.json(manga);
    })
    .catch(error => res.status(500).json(error));
});

// Deletando um campo do bd
router.delete('/delete/:id', (req, res) => {
  Manga.findOneAndDelete({ _id: req.params.id })
    .then(manga => {
      res.json(manga);
    })
    .catch(error => res.status(500).json(error));
});

export default router