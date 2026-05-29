const service = require('../services/vendas')

async function getVendas(req, res) {
  try {
    const vendas = await service.getVendas()
    return res.status(200).json({
      status: 'ok',
      data: vendas
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

async function createVenda(req, res) {
  try {
    if (!req.body.valor_total || !req.body.venda_id || !req.body.usuario_id) {
      let erros = []
      if (!req.body.valor_total) erros.push("valor_total");
      if (!req.body.venda_id) erros.push("venda_id");
      if (!req.body.usuario_id) erros.push("usuario_id");
      return res.status(400).json({
        status: 'error',
        message: 'Campo obrigatorio não preenchido: ${erros.join(", ")}'
      })
    }

    if (req.body.valor_total <= 0 && typeof req.body.valor_total !== "number") {
      return res.status(400).json({
        status: 'error',
        message: 'Valor total deve ser um numero maior que zero',
      })}

    const venda = await service.createVenda(req.body)
      return res.status(201).json({
        status: 'ok',
        message: 'Venda cadastrada com sucesso',
        data: venda
      })
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }

async function updateVenda(req, res) {
    try {
      if (!req.body.valor_total) {
        return res.status(400).json({
          status: 'error',
          message: 'Informe ao menos um campo para atualizar: valor total'
        })
      }
      const params = {
        ...req.body,
        id: req.params.id
      }
      const venda = await service.updateVenda(params)
      if (!venda.length) {
        return res.status(404).json({
          status: 'error',
          message: `Não foi encontrado uma venda com o id &{params.id}`
        })
      }
      return res.status(200).json({
        status: 'ok',
        message: 'Venda atualizada com sucesso',
        data: venda
      })
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }

  async function deleteVenda(req, res) {
    try {
      const venda = await service.deleteVenda(req.params)
      if (venda == 0) {
        return res.status(400).json({
          status: 'error',
          message: `Não foi encontrado uma venda com o id ${req.params.id}`
        })
      }
      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }

  module.exports = {
    getVendas,
    createVenda,
    updateVenda,
    deleteVenda
  }