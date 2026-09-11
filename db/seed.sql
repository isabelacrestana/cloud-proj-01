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
  ('Arena de Areia',    'beach_tennis',  FALSE,  70.00),
  -- Novas quadras adicionadas abaixo:
  ('Ginasio Volei Principal', 'volei',         TRUE,  100.00),
  ('Quadra Externa Volei',    'volei',         FALSE,  50.00),
  ('Basquete Street',         'basquete',      FALSE,  40.00),
  ('Basquete Premium',        'basquete',      TRUE,   95.00),
  ('Arena Beach 2',           'beach_tennis',  FALSE,  70.00),
  ('Quadra 3 - Coberta',      'tenis',         TRUE,   85.00);

-- Reservas de teste para alimentar os graficos e a agenda de hoje
-- (Ana Souza id=2, Bruno Lima id=3)
INSERT IGNORE INTO reserva (usuario_id, quadra_id, data_reserva, hora_inicio, hora_fim, status) VALUES
  (2, 1, CURDATE(), '08:00:00', '09:00:00', 'confirmada'),
  (3, 5, CURDATE(), '10:00:00', '11:00:00', 'confirmada'),
  (2, 4, CURDATE(), '18:00:00', '19:00:00', 'confirmada'),
  (3, 3, CURDATE(), '19:00:00', '20:00:00', 'confirmada'),
  (2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '10:00:00', 'confirmada'),
  (3, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '18:00:00', '19:00:00', 'confirmada'),
  (2, 5, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '17:00:00', '18:00:00', 'confirmada'),
  (3, 4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '20:00:00', '21:00:00', 'confirmada'),
  (2, 3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '14:00:00', '15:00:00', 'confirmada'),
  (3, 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '08:00:00', '09:00:00', 'cancelada');

