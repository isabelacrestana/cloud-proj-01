-- Projeto 01 - Computacao em Nuvem / PUC-Campinas
-- Carga inicial do banco: administrador, clientes de exemplo e quadras.
--
-- Executado por vagrant up, depois do schema.sql.
-- Usa INSERT IGNORE para poder ser reaplicado: se o registro ja existe
-- (email e nome da quadra sao UNIQUE), a linha e ignorada em vez de dar erro.
--
-- CREDENCIAIS DE DESENVOLVIMENTO
--   admin@example.com       /  admin12345   (administrador)
--   ana.souza@example.com   /  cliente123   (cliente)
--   bruno.lima@example.com  /  cliente123   (cliente)

USE clube_reservas;

INSERT IGNORE INTO usuario (nome, email, senha_hash, telefone, papel) VALUES
  ('Administrador do Clube', 'admin@example.com',
   '$2b$12$lBlMk8iXIREdmAlDA0/KzOW81LNhvk.HjJZzNCH3SmCowt4KT7z0C',
   '(19) 3000-0000', 'admin');

INSERT IGNORE INTO usuario (nome, email, senha_hash, telefone, papel) VALUES
  ('Ana Souza', 'ana.souza@example.com',
   '$2b$12$evICxhulx62BEn2LDacnguw74xa8k3CqbXMy0KLC.rsVo4tsrPf7G',
   '(19) 99999-0001', 'cliente'),
  ('Bruno Lima', 'bruno.lima@example.com',
   '$2b$12$evICxhulx62BEn2LDacnguw74xa8k3CqbXMy0KLC.rsVo4tsrPf7G',
   '(19) 99999-0002', 'cliente');

INSERT IGNORE INTO quadra (nome, modalidade, coberta, valor_hora) VALUES
  ('Quadra 1 - Saibro', 'tenis',         FALSE,  60.00),
  ('Quadra 2 - Rapida', 'tenis',         FALSE,  55.00),
  ('Ginasio Coberto',   'poliesportiva', TRUE,  120.00),
  ('Society A',         'futsal',        FALSE,  90.00),
  ('Arena de Areia',    'beach_tennis',  FALSE,  70.00);
