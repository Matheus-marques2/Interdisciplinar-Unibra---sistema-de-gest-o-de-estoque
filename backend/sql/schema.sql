-- Schema do banco de dados - Sistema de Gestão de Estoque (MercaFácil)
-- Engine: MySQL 8+

CREATE DATABASE IF NOT EXISTS mercafacil
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mercafacil;

-- ================= USUÁRIOS =================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cargo VARCHAR(50) NOT NULL DEFAULT 'operador',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================= FORNECEDORES =================
CREATE TABLE IF NOT EXISTS fornecedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  nome VARCHAR(150) NOT NULL,
  descricao VARCHAR(255),
  telefone VARCHAR(20),
  email VARCHAR(150),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================= PRODUTOS =================
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_barras VARCHAR(50) NOT NULL UNIQUE,
  nome VARCHAR(150) NOT NULL,
  marca VARCHAR(100),
  categoria VARCHAR(80),
  preco DECIMAL(10,2) NOT NULL DEFAULT 0,
  estoque INT NOT NULL DEFAULT 0,
  estoque_minimo INT NOT NULL DEFAULT 0,
  validade DATE NULL,
  fornecedor_id INT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_produto_fornecedor FOREIGN KEY (fornecedor_id)
    REFERENCES fornecedores(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_nome ON produtos(nome);

-- ================= VENDAS =================
CREATE TABLE IF NOT EXISTS vendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  forma_pagamento VARCHAR(30) NOT NULL DEFAULT 'dinheiro',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_venda_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================= ITENS DA VENDA =================
CREATE TABLE IF NOT EXISTS itens_venda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venda_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_item_venda FOREIGN KEY (venda_id)
    REFERENCES vendas(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_produto FOREIGN KEY (produto_id)
    REFERENCES produtos(id)
) ENGINE=InnoDB;

CREATE INDEX idx_itens_venda_venda ON itens_venda(venda_id);
