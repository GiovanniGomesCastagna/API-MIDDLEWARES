const db = require('../configs')

async function getVendas () {
  const resposta = await db.query('select * from vendas')
  return resposta.rows
}

async function getVendasByID (id) {
  const sql = `
  SELECT USUARIO_ID, TOTAL_VENDA, DATA_VENDA
  FROM VENDAS WHERE ID = $1
  `
  const resposta = await db.query(sql, [id])
  return resposta.rows[0]
}

async function getVendasByUser (usuario_id) {
  const sql = `
  SELECT ID, USUARIO_ID, TOTAL_VENDA, DATA_VENDA
  FROM VENDAS WHERE USUARIO_ID = $1
  `
  const resposta = await db.query(sql, [usuario_id])
  return resposta.rows
}

async function createVenda (params) {
  const { usuario_id, total_venda } = params
  const sql = `
    insert into vendas (
      usuario_id,
      total_venda
    ) values (
      $1,
      $2
    ) returning id, usuario_id, total_venda, data_venda
  `
  const resposta = await db.query(sql, [usuario_id, total_venda])
  return resposta.rows
}

async function updateVenda (params) {
  const campos = []
  const binds = []
  let bindIndex = 1

  if (Object.hasOwn(params, 'usuario_id')) {
    campos.push(` usuario_id = $${bindIndex++} `)
    binds.push(params.usuario_id)
  }

  if (Object.hasOwn(params, 'total_venda')) {
    campos.push(` total_venda = $${bindIndex++} `)
    binds.push(params.total_venda)
  }

  binds.push(params.id)
  const sql = `
    update vendas
       set ${campos.join(',')}
     where id = $${bindIndex++}
     returning *
  `

  const resposta = await db.query(sql, binds)
  return resposta.rows
}

async function deleteVenda (params) {
  const sql = 'delete from vendas where id = $1'
  const resposta = await db.query(sql, [params.id])
  return resposta.rowCount
}

module.exports = {
  getVendas,
  getVendasByID,
  getVendasByUser,
  createVenda,
  updateVenda,
  deleteVenda
}