import express, { application } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import routerCampo from './routes/campo.js'
import routerLastEP from './routes/lastep.js'

const app = express()

app.use(cors());
app.use(bodyParser.json())
app.use('/api/manga', routerCampo)
app.use('/api/lastep', routerLastEP)

export default app