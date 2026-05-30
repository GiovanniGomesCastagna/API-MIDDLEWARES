const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

// Ativa os plugins no Day.js
dayjs.extend(utc);
dayjs.extend(timezone);


// const horarioBrasilia = dayjs.tz("America/Sao_Paulo");

dayjs.tz.setDefault("America/Sao_Paulo");
const hoje = dayjs();

const hojeBrasil = dayjs.tz(undefined, "America/Sao_Paulo").startOf('day')
const data_inserida = "2026-05-30"

const data_vencimento = dayjs(data_inserida).tz()

if(hojeBrasil > data_vencimento) {
  console.log(`data inválida`)
} else {
  console.log(`data correta e válida`)
}


console.log(hojeBrasil.format('DD/MM/YYYY HH:mm:ss'))
console.log(data_vencimento.format('DD/MM/YYYY HH:mm:ss'))