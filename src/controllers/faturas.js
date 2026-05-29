const service = require("../services/faturas");
const vendasService = require("../services/vendas");

async function getFaturas(req, res) {
  try {
    const faturas = await service.getFaturas();
    return res.status(200).json({
      status: "ok",
      data: faturas,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function createFatura(req, res) {
  try {
    if (
      !req.body.venda_id ||
      !req.body.usuario_id ||
      !req.body.valor_fatura ||
      !req.body.status.data_vencimento ||
      !req.body.data_pagamento
    ) {
      let erros = [];

      if (!req.body.venda_id) erros.push("venda_id");
      if (!req.body.data_vencimento) erros.push("data_vencimento");

      return res.status(404).json({
        status: "error",
        message: `Campos faltando. Preencha os campos: ${erros.join(", ")}`,
      });
    }

    const agora = new Date()
      .toLocaleString()
      .substring(0, 10)
      .split("/")
      .reverse()
      .join("-");
    const dataInserida = new Date(req.body.data_vencimento)
      .toISOString()
      .split("T")[0];

    if (agora > dataInserida) {
      return res.status(400).json({
        status: "error",
        message: `Data de vencimento não pode ser anterior que a data atual.`,
      });
    }

    const venda = await vendasService.getVendasByID(req.body.venda_id);

    if (venda == 0) {
      return res.status(400).json({
        status: "error",
        message: `Venda inexistente. Favor inserir o ID de outra venda.`,
      });
    }

    const { total_venda, usuario_id } = venda;

    req.body.valor_fatura = total_venda;
    req.body.usuario_id = usuario_id;

    const fatura = await service.createFatura(req.body);
    return res.status(201).json({
      status: "ok",
      message: "Fatura cadastrada com sucesso",
      data: fatura,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function updateFatura(req, res) {
  try {
    const params = {
      ...req.body,
      id: req.params.id,
    };

    const faturaPesquisa = await service.getFaturaByID(params.id);

    if (faturaPesquisa.length == 0) {
      return res.status(400).json({
        status: "error",
        message: `Fatura inexistente. Escolha outra fatura.`,
      });
    }

    const { status } = faturaPesquisa;

    if (status == "pago") {
      return res.status(400).json({
        status: "error",
        message: `Status da fatura é pago. Não é possível alterá-la.`,
      });
    }

    if (params.status == "pago") {
      params.data_pagamento = new Date()
        .toLocaleString()
        .substring(0, 10)
        .split("/")
        .reverse()
        .join("-");
    }

    if (params.status == "pendente" || params.status == "cancelado") {
      params.data_pagamento = null
    }

    const fatura = await service.updateFatura(params);

    return res.status(200).json({
      status: "ok",
      message: "Fatura atualizada com sucesso",
      data: fatura,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function deleteFatura(req, res) {
  try {
    await service.deleteFatura(req.params);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

module.exports = {
  getFaturas,
  createFatura,
  updateFatura,
  deleteFatura,
};
