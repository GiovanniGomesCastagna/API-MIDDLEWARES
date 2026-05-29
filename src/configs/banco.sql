CREATE TYPE tipo_acesso_usuario AS ENUM ('admin', 'padrao');
CREATE TYPE status_fatura AS ENUM ('pendente', 'pago', 'cancelado');

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  tipo_acesso tipo_acesso_usuario DEFAULT 'padrao',
  criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendas (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  total_venda NUMERIC(10, 2) NOT NULL CHECK (total_venda >= 0),
  data_venda TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_venda_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE TABLE faturas (
  id SERIAL PRIMARY KEY,
  venda_id INT UNIQUE NOT NULL,
  usuario_id INT NOT NULL,
  valor_fatura NUMERIC(10, 2) NOT NULL CHECK (valor_fatura >= 0),
  status status_fatura DEFAULT 'pendente',
  data_vencimento DATE NOT NULL,
  data_pagamento TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fatura_venda FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
  CONSTRAINT fk_fatura_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE INDEX idx_vendas_usuario ON vendas(usuario_id);
CREATE INDEX idx_faturas_usuario ON faturas(usuario_id);
CREATE INDEX idx_faturas_status ON faturas(status);
