import mongoose from 'mongoose'
import colorConsole from '../lib/color.js'
import app from './app.js'
import 'dotenv/config'
import cron from 'node-cron'
import axios from 'axios'

console.log(process.env.DB_URL)

mongoose
 .connect(process.env.DB_URL, {
  useNewUrlParser: true
 })
 .then(result => {
  console.log('MongoDB Conectado');
 })
 .catch(error => {
  console.log(error);
 });

const port = process.env.PORT || 5001

app.listen(port, () => {
 colorConsole('FgWhite', '----------------')
 colorConsole('FgRed', 'Server listening')
 colorConsole('FgWhite', '----------------')
 colorConsole('FgRed', `Porta: ${port}`)
 colorConsole('FgWhite', '----------------')
})

cron.schedule('0 * * * *', async () => {
  try {
    colorConsole('FgWhite', 'Executando atualização de episódios...')

    if (process.env.NODE_ENV === 'production') {
      colorConsole('FgRed', 'A atualização automática foi desabilitada em ambiente de produção.')
      return
    }
    
    const response = await axios.get(`http://localhost:${port}/api/lastepmany`)
    colorConsole('FgGreen', 'Atualização concluída:', response.data)
  } catch (error) {
    colorConsole('FgRed', 'Erro na atualização automática:', error.toString())
  }
})

export default app