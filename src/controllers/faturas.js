const service = require("../services/faturas");
const vendasService = require("../services/vendas");
const authService = require("../services/auth");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// Ativa os plugins no Day.js
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Sao_Paulo");

async function getFaturas(req, res) {
  try {
    const { tipo_acesso } = await authService.getUserByID(req.user.user.id);

    const params = {
      tipo_acesso: tipo_acesso,
      usuario_id: req.user.user.id,
    };

    const faturas = await service.getFaturas(params);
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
    const params = {
      ...req.body,
      usuario_id: req.user.user.id,
    };

    const { tipo_acesso } = await authService.getUserByID(params.usuario_id);

    if (!params.venda_id || !params.status || !params.data_vencimento) {
      let erros = [];

      if (!params.venda_id) erros.push("venda_id");
      if (!params.data_vencimento) erros.push("data_vencimento");

      return res.status(404).json({
        status: "error",
        message: `Campos faltando. Preencha os campos: ${erros.join(", ")}`,
      });
    }

    const venda = await vendasService.getVendasByID(params.venda_id);

    if (!venda) {
      return res.status(400).json({
        status: "error",
        message: `Venda inexistente. Favor inserir o ID de outra venda.`,
      });
    }

    if (venda.usuario_id !== params.usuario_id && tipo_acesso != "admin") {
      return res.status(403).json({
        status: "error",
        message: `Não é possível criar uma fatura a partir da venda de outro usuário.`,
      });
    }

    const hoje = dayjs.tz(undefined, "America/Sao_Paulo").startOf("day");
    const dataInserida = dayjs.tz(params.data_vencimento, "America/Sao_Paulo");

    if (hoje > dataInserida) {
      return res.status(400).json({
        status: "error",
        message: `Data de vencimento não pode ser anterior que a data atual.`,
      });
    }
    params.data_pagamento = null;
    const { total_venda } = venda;

    params.valor_fatura = total_venda;

    if (params.status == "pago") {
      params.data_pagamento = dayjs
        .tz(undefined, "America/Sao_Paulo")
        .startOf("day");
    }

    const fatura = await service.createFatura(params);
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

    if (params.valor_fatura) {
      return res.status(403).json({
        status: "error",
        message: `Não é possível alterar o valor da fatura diretamente.`,
      });
    }

    if (!params.status) {
      return res.status(400).json({
        status: "error",
        message: `Informe ao menos um cmapo para atualizar: status.`,
      });
    }

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
      params.data_pagamento = dayjs
        .tz(undefined, "America/Sao_Paulo")
        .startOf("day");
    }

    if (params.status == "pendente" || params.status == "cancelado") {
      params.data_pagamento = null;
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
    const fatura = await service.deleteFatura(req.params);
    if (fatura == 0) {
      return res.status(400).json({
        status: "error",
        message: `Não foi encontrado uma fatura com o id ${req.params.id}`,
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
  getFaturas,
  createFatura,
  updateFatura,
  deleteFatura,
};
