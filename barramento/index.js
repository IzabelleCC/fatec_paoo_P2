import dotenv from 'dotenv';
import Queue from 'p-queue';
import express from 'express';
import axios from 'axios';

dotenv.config();
const app = express()
app.use(express.json())

const { PORT_BARRAMENTO,
  PORT_CONSULTA,
  PORT_LEMBRETES,
  PORT_OBSERVACOES,
  PORT_CLASSIFICACAO
  } = process.env
  
const eventos = []
  
const queue = new Queue({ concurrency: 5 }); // 5, até 5 requisições simultâneas

const handlers = { //manipulador
  'LembreteCriado': async (evento) => {
    axios.post(`http://localhost:${PORT_CLASSIFICACAO}/eventos`, evento)
    axios.post(`http://localhost:${PORT_CONSULTA}/eventos`, evento)},//classificação e consulta
    'LembreteClassificado': async (evento) => axios.post(`http://localhost:${PORT_LEMBRETES}/eventos`, evento),//lembretes
    'LembreteAtualizado': async (evento) => axios.post(`http://localhost:${PORT_CONSULTA}/eventos`, evento),//consulta
    
    'ObservacaoCriada': async (evento) => {
      axios.post(`http://localhost:${PORT_CLASSIFICACAO}/eventos`, evento)
      axios.post(`http://localhost:${PORT_CONSULTA}/eventos`, evento)},//classificação e consulta
      'ObservacaoClassificada': async (evento) => axios.post(`http://localhost:${PORT_OBSERVACOES}/eventos`, evento),//observacoes
      'ObservacaoAtualizada': async (evento) => axios.post(`http://localhost:${PORT_CONSULTA}/eventos`, evento),//consulta
      
      'default': async (evento) => console.log('Evento não esperado', evento)
};

//aqui recebemos todos os eventos
//e repassamos para todos os mss
app.post('/eventos', async (req, res) => {
  //aqui pegamos o evento
  const evento = req.body
  eventos.push(evento)
  console.log(evento)
  
  queue.add(async () => {
    const handler = handlers[evento.type] || handlers['default']
    try { await handler(evento) }
    catch(e) { console.error(e) }
  });
  res.status(200).end()
})

app.get('/eventos', (req, res) => {
  res.status(200).json(eventos)
})

app.listen(
  PORT_BARRAMENTO, 
  () => console.log(`Barramento: ${PORT_BARRAMENTO}`)
)