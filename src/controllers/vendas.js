const service = require("../services/vendas");
const authService = require("../services/auth");
const auth = require("./auth");

async function getVendas(req, res) {
  try {
    const vendas = await service.getVendas();
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
    const params = {
      ...req.body,
      id: req.params.id,
    };

    if (!params.total_venda) {
      return res.status(400).json({
        status: "error",
        message: "Informe ao menos um campo para atualizar: valor total",
      });
    }
    
    const venda = await service.updateVenda(params);
    if (!venda.length) {
      return res.status(404).json({
        status: "error",
        message: `Não foi encontrado uma venda com o id &{params.id}`,
      });
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
