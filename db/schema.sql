-- Projeto 1 - Computacao em Nuvem / PUC-Campinas
-- Sistema de reserva de quadras: criacao do banco e das tabelas.

CREATE DATABASE IF NOT EXISTS clube_reservas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE clube_reservas;


-- Clientes do clube e administradores.
CREATE TABLE IF NOT EXISTS usuario (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(120)  NOT NULL,
  email       VARCHAR(180)  NOT NULL,
  senha_hash  CHAR(60)      NOT NULL,
  telefone    VARCHAR(20)   NULL,
  papel       ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
  criado_em   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB;


-- Quadras disponiveis para reserva.
CREATE TABLE IF NOT EXISTS quadra (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(80)   NOT NULL,
  modalidade  ENUM('tenis','futsal','volei','basquete','beach_tennis','poliesportiva') NOT NULL,
  coberta     BOOLEAN       NOT NULL DEFAULT FALSE,
  valor_hora  DECIMAL(8,2)  NOT NULL,
  ativa       BOOLEAN       NOT NULL DEFAULT TRUE,

  PRIMARY KEY (id),
  UNIQUE KEY uq_quadra_nome (nome)
) ENGINE=InnoDB;


-- Reservas.
--
-- A UNIQUE no fim da tabela impede duas pessoas reservarem a mesma quadra
-- no mesmo dia e horario: o banco recusa a segunda com erro 1062.
--
-- Ela nao usa data_reserva direto, e sim horario_ocupado: uma coluna
-- calculada pelo proprio MySQL, que repete a data enquanto a reserva vale
-- e fica NULL quando ela e cancelada. Como o MySQL nao trata dois NULL
-- como iguais, as reservas canceladas ficam de fora da regra - ou seja,
-- cancelar libera o horario, sem precisar apagar o registro.
CREATE TABLE IF NOT EXISTS reserva (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id    INT UNSIGNED  NOT NULL,
  quadra_id     INT UNSIGNED  NOT NULL,
  data_reserva  DATE          NOT NULL,
  hora_inicio   TIME          NOT NULL,
  hora_fim      TIME          NOT NULL,
  status        ENUM('confirmada','cancelada') NOT NULL DEFAULT 'confirmada',
  criado_em     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  horario_ocupado DATE GENERATED ALWAYS AS (
    IF(status = 'cancelada', NULL, data_reserva)
  ) STORED,

  PRIMARY KEY (id),
  UNIQUE KEY uq_reserva_horario (quadra_id, horario_ocupado, hora_inicio),

  CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
  CONSTRAINT fk_reserva_quadra  FOREIGN KEY (quadra_id)  REFERENCES quadra (id)
) ENGINE=InnoDB;
