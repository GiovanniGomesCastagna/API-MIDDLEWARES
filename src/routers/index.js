const authRoute = require('./auth')
const vendasRoute = require('./vendas')
const faturasRoute = require('./faturas')

module.exports = (app) => {
  authRoute(app)
  vendasRoute(app)
  faturasRoute(app)
}