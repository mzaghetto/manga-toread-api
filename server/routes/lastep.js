import express from 'express'
import Manga from '../models/Manga.js'
import Xray from 'x-ray'

const router = express.Router()

// Listando informações de manga específico
router.get('/:manga_name', (req, res) => {
  const x = Xray()

  Manga.findOne({ manga_name: req.params.manga_name })
    .then(manga => {
      let dados = {}
      const classFind = '#chpagedlist > ul > li:nth-child(1) > a > strong'

      x(manga.url_crawler, classFind)(function (err, cap) {
        getData(cap)
      })

      function getData(data) {
        dados.last_ep_released = data
        // replace all '\n' in last_ep_released
        // replace all ' ' in last_ep_released
        // replace '-eng-li' in last_ep_released for ' '
        dados.last_ep_released = dados.last_ep_released.replace(/\n/g, '')
        dados.last_ep_released = dados.last_ep_released.replace(/ /g, '')
        dados.last_ep_released = dados.last_ep_released.replace(/-eng-li/g, '')

        // // transform last_ep_released string to integer
        dados.last_ep_released = parseInt(dados.last_ep_released)

        res.json(dados)
      }
    })
    .catch(error => res.status(500).json(error));
});

export default router