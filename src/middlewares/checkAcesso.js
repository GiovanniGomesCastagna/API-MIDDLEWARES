async function isAdmin(req, res, next) {
  try {
    const tipo_acesso = req.user.user.tipo_acesso;

    if (tipo_acesso !== "admin") {
      return res.status(403).json({
        status: 'Forbidden',
        message: `Você não permissão para acessar esse conteúdo.`
      })
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: `Internal server error. Error: ${error.message}`,
    });
  }
}

module.exports = {
  isAdmin,
};
