const service = require("../services/vendas");
const authService = require("../services/auth");
const faturaService = require("../services/faturas");

async function getVendas(req, res) {
  try {
    const { tipo_acesso } = await authService.getUserByID(req.user.user.id);

    const params = {
      tipo_acesso: tipo_acesso,
      usuario_id: req.user.user.id,
    };

    const vendas = await service.getVendas(params);
    return res.status(200).json({
      status: "ok",
      data: vendas,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function createVenda(req, res) {
  try {
    const params = {
      ...req.body,
      usuario_id: req.user.user.id,
    };
    if (!params.total_venda) {
      return res.status(400).json({
        status: "error",
        message: `Campo obrigatório faltando. Campo obrigatório: total_venda`,
      });
    }

    if (
      isNaN(params.total_venda) ||
      params.total_venda <= 0 ||
      typeof params.total_venda !== "number"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Valor total deve ser um numero maior que zero",
      });
    }

    const venda = await service.createVenda(params);
    return res.status(201).json({
      status: "ok",
      message: "Venda cadastrada com sucesso",
      data: venda,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function updateVenda(req, res) {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        status: 'error',
        message: `Informe o ID da venda para atualizá-la.`
      })
    }
    const params = {
      ...req.body,
      usuario_logado: req.user.user.id,
      id: req.params.id,
    };
    const venda = await service.getVendasByID(params.id);

    if (!venda) {
      return res.status(404).json({
        status: "error",
        message: `Não foi encontrado uma venda com o id ${params.id}`,
      });
    }

    if (!params.total_venda && !params.usuario_id) {
      return res.status(400).json({
        status: "error",
        message: "Informe ao menos um campo para atualizar: total_venda, usuario_id",
      });
    }

    const { tipo_acesso } = await authService.getUserByID(params.usuario_logado);

    if (venda.usuario_id !== params.usuario_logado && tipo_acesso !== "admin") {
      return res.status(403).json({
        status: "error",
        message: `Não é possível alterar a venda de outro usuário.`,
      });
    }

    if (params.usuario_id && tipo_acesso !== "admin") {
      return res.status(403).json({
        status: 'error',
        message: `Não é possível alterar o usuário da venda sendo um usuário comum.`
      })
    }

    if (
      isNaN(params.total_venda) ||
      params.total_venda <= 0 ||
      typeof params.total_venda !== "number"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Valor total deve ser um numero maior que zero",
      });
    }

    const fatura = await faturaService.getFaturaByVendaID(params.id);

    if (fatura && fatura.status == "pago") {
      return res.status(403).json({
        status: "error",
        message: `Não é possível alterar o valor de uma venda atribuida a uma fatura paga.`,
      });
    }

    const vendaAtualizada = await service.updateVenda(params);

    if (fatura && fatura.status !== 'pago') {
      const paramsFatura = {
        id: fatura.id ,
        valor_fatura: params.total_venda,
      };
      const updateFatura = await faturaService.updateFatura(paramsFatura);
    }

    return res.status(200).json({
      status: "ok",
      message: "Venda atualizada com sucesso",
      data: venda,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function deleteVenda(req, res) {
  try {
    const venda = await service.deleteVenda(req.params);
    if (venda == 0) {
      return res.status(400).json({
        status: "error",
        message: `Não foi encontrado uma venda com o id ${req.params.id}`,
      });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

module.exports = {
  getVendas,
  createVenda,
  updateVenda,
  deleteVenda,
};
