require('dotenv').config()
const express = require('express')
const axios = require ('axios')
const app = express()
app.use(express.json())

const { PORT_BARRAMENTO, PORT_CLASSIFICACAO } = process.env

const funcoes = {
  ObservacaoCriada: async (observacao) => {
    observacao.status = 
      observacao.texto.toLowerCase().includes('importante') ? 'importante':'comum'
    await axios.post(
      `http://localhost:${PORT_BARRAMENTO}/eventos`,
      {
        type: 'ObservacaoClassificada',
        payload: observacao
      }
    )
  },
  LembreteCriado: async (lembrete) => {
    if(lembrete.texto.toLowerCase().includes('importante')){
      lembrete.status = 'importante'
    }
    else{
      if(lembrete.texto.toLowerCase().includes('urgente')){
        lembrete.status = 'urgente'
      }
      else{
        lembrete.status = 'comum'
      }
    }
    await axios.post(
      `http://localhost:${PORT_BARRAMENTO}/eventos`,
      {
        type: 'LembreteClassificado',
        payload: lembrete
      }
    )
  }
}

app.post('/eventos', async (req, res) => {
  const evento = req.body
  console.log(evento)
  try{
    funcoes[req.body.type](req.body.payload)
  } 
  catch(e){} 
  res.status(200).end()
})

app.listen(PORT_CLASSIFICACAO, () => {
  console.log(`Classificação. Porta ${PORT_CLASSIFICACAO}`)
})

