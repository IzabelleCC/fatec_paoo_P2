require('dotenv').config()
//usamos para definir endpoints
//para receber requisições HTTP
const express = require('express')
//usamos para enviar requisições HTTP
const axios = require('axios')
const app = express();
//middleware
app.use(express.json())

const {PORT_BARRAMENTO, PORT_LEMBRETES} = process.env

/*
  {
    "1": {"id": "1", "texto": "Fazer café"},
    "2": {"id": "2", "texto": "Ver um filme"}
  }
*/
const lembretes = {}
let id = 1

//GET /lembretes
app.get('/lembretes', (req, res) => res.send(lembretes))


const funcoes = {
  LembreteClassificado: async (lembrete) => {
    const lembreteParaAtualizar = lembretes[lembrete.id]
    lembreteParaAtualizar.status = lembrete.status
    await axios.post(
      `http://localhost:${PORT_BARRAMENTO}/eventos`, 
      {
        type: 'LembreteAtualizado',
        payload: {
          id: lembrete.id,
          texto: lembrete.texto,
          status: lembrete.status
        }
      }
    )
  }
}

//POST /eventos
app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    console.log(evento)
    funcoes[req.body.type](req.body.payload)
  }
  catch(e){}
  res.status(200).end()
})

//POST /lembretes {texto: "Fazer cafe"}
app.post('/lembretes', async (req, res) => {
  const texto = req.body.texto
  const lembrete = {id, texto, status: 'aguardando'}
  lembretes[id] = lembrete
  id++
  //isso é a emissão de um evento
  //ou seja, só uma requisição HTTP
  await axios.post(`http://localhost:${PORT_BARRAMENTO}/eventos`, {
    type: "LembreteCriado",
    payload: lembrete
    
  })
  // HTTP 201 Created
  res.status(201).send(lembrete)
})

app.listen(
  PORT_LEMBRETES,
  () => console.log(`Lembretes: ${PORT_LEMBRETES}`)
)