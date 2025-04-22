import express, { application } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import routerCampo from './routes/campo.js'
import routerLastEP from './routes/lastep.js'
import routerLastEPMany from './routes/lastepMany.js'
import routerCookie from './routes/cookie.js'

const app = express()

app.use(cors());
app.use(bodyParser.json())

app.get('/api/healthCheck', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/manga', routerCampo)
app.use('/api/lastep', routerLastEP)
app.use('/api/lastepmany', routerLastEPMany)
app.use('/api/cookie', routerCookie)

export default app