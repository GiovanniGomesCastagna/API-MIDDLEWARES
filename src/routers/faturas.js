const controller = require('../controllers/faturas')
const authMiddleware = require('../middlewares/auth')
const acessoMiddleware = require('../middlewares/checkAcesso')

module.exports = (app) => {
  app.get('/faturas', authMiddleware.verifyJWT, controller.getFaturas)
  app.post('/faturas', authMiddleware.verifyJWT, controller.createFatura)
  app.patch('/faturas/:id', authMiddleware.verifyJWT, controller.updateFatura)
  app.delete('/faturas/:id', authMiddleware.verifyJWT, acessoMiddleware.isAdmin, controller.deleteFatura)
}