import express from 'express';
import axios from 'axios';
import Cookie from '../models/Cookie.js';
import Header from '../models/Header.js';
import 'dotenv/config'

const router = express.Router();
const scrapingServiceUrl = process.env.SCRAPING_SERVICE_URL || 'http://localhost:5002/scrape';

// Gera e armazena cookies para bypass Cloudflare
// Expects JSON body: { url: string }
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL is required to generate cookies.' });
    }

    // Chama serviço de scraping local para obter cookies
    const scrapeResponse = await axios.post(scrapingServiceUrl, {
      url,
      timeout: 60000,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    const { cookies, headers } = scrapeResponse.data;

    if (!Array.isArray(cookies) || cookies.length === 0) {
      return res.status(500).json({ message: 'No cookies returned from scrape service.' });
    }

    // Armazena/atualiza cookies no MongoDB
    const savedCookies = [];
    for (const c of cookies) {
      const filter = { name: c.name };
      const update = {
        name: c.name,
        value: c.value,
        path: c.path,
        domain: c.domain,
        secure: c.secure,
        httpOnly: c.httpOnly,
        expires: c.expires ? new Date(c.expires) : undefined,
      };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      const doc = await Cookie.findOneAndUpdate(filter, update, options);
      savedCookies.push(doc);
    }

    // Armazena/atualiza headers no MongoDB
    const savedHeaders = [];
    if (headers && typeof headers === 'object') {
      for (const [key, val] of Object.entries(headers)) {
        const filterH = { name: key };
        const updateH = { name: key, value: String(val) };
        const optionsH = { upsert: true, new: true, setDefaultsOnInsert: true };
        const docH = await Header.findOneAndUpdate(filterH, updateH, optionsH);
        savedHeaders.push(docH);
      }
    }
    res.json({ message: 'Cookies and headers generated and stored.', cookies: savedCookies, headers: savedHeaders });
  } catch (error) {
    console.error('Error generating cookies:', error);
    res.status(500).json({ message: 'Error generating cookies.', error: error.toString() });
  }
});

export default router;