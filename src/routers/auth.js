const controller = require('../controllers/auth')
const authMiddleware = require('../middlewares/auth')

module.exports = (app) => {
  app.post('/auth/register', controller.register)
  app.post('/auth/login', controller.login)
  app.patch('/auth/update', authMiddleware.verifyJWT, controller.update)
}