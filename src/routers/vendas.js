const controller = require('../controllers/vendas')
const authMiddleware = require('../middlewares/auth')
const acessoMiddleware = require('../middlewares/checkAcesso')

module.exports = (app) => {
  app.get('/vendas', authMiddleware.verifyJWT, controller.getVendas)
  app.post('/vendas', authMiddleware.verifyJWT, controller.createVenda)
  app.patch('/vendas/:id', authMiddleware.verifyJWT, controller.updateVenda)
  app.delete('/vendas/:id', authMiddleware.verifyJWT, acessoMiddleware.isAdmin, controller.deleteVenda)
}