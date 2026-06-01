const db = require('../configs')

async function getFaturas (params) {
  const { tipo_acesso, usuario_id} = params

  let sql = `
  SELECT * FROM FATURAS WHERE 1=1
  `
  if (tipo_acesso == 'padrao') {
    sql += `AND USUARIO_ID = ${usuario_id};`
  }
  
  const resposta = await db.query(sql)
  return resposta.rows
}

async function getFaturaByID(id) {
  const sql = `
  SELECT 
  ID,
  VENDA_ID,
  USUARIO_ID,
  VALOR_FATURA,
  STATUS_FATURA,
  DATA_VENCIMENTO,
  DATA_PAGAMENTO,
  CRIADO_EM
  FROM FATURAS
  WHERE ID = $1;
  `

  const resposta = await db.query(sql, [id])
  return resposta.rows[0]
}

async function getFaturaByVendaID(venda_id) {
  const sql = `
  SELECT 
  ID,
  VENDA_ID,
  USUARIO_ID,
  VALOR_FATURA,
  STATUS,
  DATA_VENCIMENTO,
  DATA_PAGAMENTO,
  CRIADO_EM
  FROM FATURAS
  WHERE VENDA_ID = $1;
  `

  const resposta = await db.query(sql, [venda_id])
  return resposta.rows[0]
}

async function createFatura (params) {
  const { venda_id, usuario_id, valor_fatura, status, data_vencimento, data_pagamento } = params
  const sql = `
    insert into faturas (
      venda_id,
      usuario_id,
      valor_fatura,
      status,
      data_vencimento,
      data_pagamento
    ) values (
      $1,
      $2,
      $3,
      coalesce($4, 'pendente'::status_fatura),
      $5,
      $6
    ) returning id, venda_id, usuario_id, valor_fatura, status, data_vencimento, data_pagamento, criado_em
  `
  const resposta = await db.query(sql, [
    venda_id,
    usuario_id,
    valor_fatura,
    status,
    data_vencimento,
    data_pagamento
  ])
  return resposta.rows
}

async function updateFatura (params) {
  const campos = []
  const binds = []
  let bindIndex = 1

  if (Object.hasOwn(params, 'status')) {
    campos.push(` status = $${bindIndex++} `)
    binds.push(params.status)
  }

  if (Object.hasOwn(params, 'data_pagamento')) {
    campos.push(` data_pagamento = $${bindIndex++} `)
    binds.push(params.data_pagamento)
  }

  if (Object.hasOwn(params, 'valor_fatura')) {
    campos.push(` valor_fatura = $${bindIndex++} `)
    binds.push(params.valor_fatura)
  }

  binds.push(params.id)
  const sql = `
    update faturas
       set ${campos.join(',')}
     where id = $${bindIndex++}
     returning *
  `

  const resposta = await db.query(sql, binds)
  return resposta.rows
}

async function deleteFatura (params) {
  const sql = 'delete from faturas where id = $1'
  const resposta = await db.query(sql, [params.id])
  return resposta.rowCount
}

module.exports = {
  getFaturas,
  getFaturaByID,
  createFatura,
  getFaturaByVendaID,
  updateFatura,
  deleteFatura
}