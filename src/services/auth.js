const db = require('../configs')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function getUserByID (id) {
  const sql = `
  SELECT ID, NOME, TIPO_ACESSO
  FROM USUARIOS
  WHERE ID = $1
  `

  const result = await db.query(sql, id)
  return result.rows
}

async function getUserByEmail (email) {
  const sql = `
  SELECT ID, NOME, TIPO_ACESSO
  FROM USUARIOS
  WHERE EMAIL = $1
  `

  const result = await db.query(sql, email)
  return result.rows
}

async function register (params) {
  const { email, senha, nome } = params
  const sql = `
    insert into usuarios (
      email,
      senha_hash,
      nome
    ) values (
      $1,
      $2,
      $3
    ) returning id, email, nome, tipo_acesso
  `
  const senhaHash = await bcrypt.hash(senha, 10)
  const result = await db.query(sql, [email, senhaHash, nome])
  return result.rows
}

async function getUserByEmail (params) {
  const { email } = params
  const sql = 'select id, email, nome, senha_hash, tipo_acesso from usuarios where email = $1'
  const result = await db.query(sql, [email])
  return result.rows
}

async function login (params) {
  const { email, senha } = params

  const userExists = await getUserByEmail({ email })
  if (!userExists.length) {
    throw new Error('Usuário não encontrado')
  }

  const user = userExists[0]

  const senhaCorreta = await bcrypt.compare(senha, user.senha_hash)
  if (!senhaCorreta) {
    throw new Error('Senha incorreta')
  }

  delete user.senha_hash

  const token = jwt.sign({ user }, process.env.AUTH_KEY, {
    algorithm: 'HS256', expiresIn: '8h'
  })

  return {
    user,
    token
  }
}

async function update (params) {
  const campos = []
  const binds = []
  let bindIndex = 1

  if (Object.hasOwn(params, 'nome')) {
    campos.push(` nome = $${bindIndex++} `)
    binds.push(params.nome)
  }

  if (Object.hasOwn(params, 'email')) {
    campos.push(` email = $${bindIndex++} `)
    binds.push(params.senha)
  }

  if (Object.hasOwn(params, 'senha')) {
    campos.push(` senha = $${bindIndex++} `)
    const senhaHash = await bcrypt.hash(params.senha, 10)
    binds.push(senhaHash)
  }

  if (Object.hasOwn(params, 'tipo_acesso')) {
    campos.push(` tipo_acesso = $${bindIndex++} `)
    binds.push(params.tipo_acesso)
  }

  binds.push(params.id)
  const sql = `
    update usuarios
       set ${campos.join(',')}
     where id = $${bindIndex++}
     returning *
  `

  const result = await db.query(sql, binds)
  return result.rows
}

module.exports = {
  register,
  getUserByEmail,
  login,
  update
}