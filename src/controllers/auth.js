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
        message: `O email "${req.body.email}" já está em uso`,
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

async function update(req, res) {
  try {
    const params = {
      ...req.body,
      id: req.user.id,
    };

    // if (Number(params.id) != Number(req.user.id)) {
    //   return res.status(403).json({
    //     status: 'error',
    //     message: `Você não pode alterar os dados de outro usuário.`
    //   })
    // }

    if (!params.email && !params.senha && !params.nome && !params.tipo_acesso) {
      return res.status(400).json({
        status: "error",
        message: `Preencha ao menos um campo para atualizar o usuário. Campos disponíveis: email, senha, nome, tipo_acesso`,
      });
    }

    if (params.email) {
      const checkEmail = await service.getUserByEmail(params.email)
      if (checkEmail.rowCount == 0) {
        return res.status(409).json({
          status: 'error',
          message: `Este email já está em uso. Tente novamente com outro email.`
        })
      }
    }

    if (params.senha || !params.senha_confirm) {
      return res.status(400).json({
        status: 'error',
        message: `Preencha o campo senha_confirm para atualizar a senha.`
      })
    }

    if (params.senha !== params.senha_confirm) {
      return res.status(418).json({
        status: 'error',
        message: `Os campos senha e senha_confirm precisam ser iguais.`
      })
    }

    const updateUsuario = await service.update(params)

    return res.status(200).json({
      status: 'Successful update',
      message: `Atualizado com sucesso.`,
      data: updateUsuario
    })

  } catch (error) {
    return res.status(500).json({
      status: 'Internal Error',
      message: `Erro interno do servidor. Mensagem de erro: ${error.message}`
    })
  }
}

module.exports = {
  register,
  login,
  update,
};
