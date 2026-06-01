const service = require("../services/auth");

async function register(req, res) {
  try {
    if (
      !req.body.email ||
      !req.body.senha ||
      !req.body.senha_confirm ||
      !req.body.nome
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Campos obrigatórios faltando: email, senha, senha_confirm, nome",
      });
    }

    const userExists = await service.getUserByEmail({ email: req.body.email });
    if (userExists.length) {
      return res.status(409).json({
        status: "error",
        message: `O email "${params.email}" já está em uso`,
      });
    }

    if (req.body.senha !== req.body.senha_confirm) {
      return res.status(400).json({
        status: "error",
        message: "Os campos senha e senha_confirm precisam ser iguais",
      });
    }

    if (req.body.senha.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "A senha deve ter ao menos 8 caracteres",
      });
    }

    const usuario = await service.register(req.body);
    return res.status(201).json({
      status: "ok",
      message: "Usuário registrado com sucesso!",
      data: usuario,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function login(req, res) {
  try {
    if (!req.body.email || !req.body.senha) {
      return res.status(400).json({
        status: "error",
        message: "Campos obrigatórios faltando: email, senha",
      });
    }

    const usuario = await service.login(req.body);
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}


module.exports = {
  register,
  login,
};
