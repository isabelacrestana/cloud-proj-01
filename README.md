# Projeto 01 — Computação em Nuvem

Aplicação web distribuída em VMs (Vagrant + VirtualBox): proxy Nginx, app Next.js e banco MySQL.

## Arquitetura

```text
Cliente → Nginx (proxy, 192.168.56.10) → Next.js (appserver, 192.168.56.20:3000) → MySQL (DB, 192.168.56.30:3306)
```

| VM | Função | IP | Recursos |
|---|---|---|---|
| `proxy` | Proxy reverso | `192.168.56.10` | 1 GB RAM / 2 CPUs |
| `appserver` | Aplicação Next.js | `192.168.56.20` | 1 GB RAM / 1 CPU |
| `DB` | MySQL | `192.168.56.30` | 2 GB RAM / 2 CPUs |

Rede privada: `192.168.56.0/24`

## Tecnologias

Vagrant, VirtualBox, Ubuntu 20.04, Nginx, Next.js, Node.js, MySQL 8

## Estrutura

```text
cloud-proj-01/
├── Vagrantfile
├── .env.example
├── nginx/reverse-proxy.conf
├── web/          # Next.js (sincronizado em /home/vagrant/app)
└── db/schema.sql # Banco e tabelas (usuario, quadra, reserva)
```

## Pré-requisitos

- VirtualBox
- Vagrant
- Git

## Configuração

```bash
cp .env.example .env
```

Preencha as credenciais no `.env` (não versionado). Consulte `.env.example` para as variáveis necessárias.

## PLUGINS

```bash
vagrant plugin install dotenv
gem install dotenv
```

## Uso

```bash
vagrant up
```

### Acessar a aplicação no navegador

| Via | URL |
|---|---|
| Proxy (Nginx) | `http://192.168.56.10` |
| App direto | `http://192.168.56.20:3000` |

O Next.js precisa estar rodando na VM `appserver` para qualquer um dos acessos funcionar.

### Subir o Next.js

```bash
vagrant ssh appserver
cd /home/vagrant/app
npm run dev -- --hostname 0.0.0.0 --webpack
```

### Proxy (Nginx)

```bash
vagrant ssh proxy
sudo systemctl status nginx
sudo nginx -t
```

### MySQL

```bash
vagrant ssh DB
sudo mysql
```

Dentro do MySQL:

```sql
USE clube_reservas;
SHOW TABLES;
```

Para conectar com o usuário da aplicação (credenciais definidas no `.env`):

```bash
mysql -u <DB_USER> -p -h 127.0.0.1 clube_reservas
```

## Comandos úteis

| Comando | Descrição |
|---|---|
| `vagrant ssh <proxy\|appserver\|DB>` | Acessar uma VM |
| `vagrant status` | Status das VMs |
| `vagrant provision` | Reexecutar provisionamento |
| `vagrant reload` | Reiniciar VMs |
| `vagrant halt` | Parar VMs |
| `vagrant destroy` | Destruir VMs |

## Status

- [x] VMs, rede, Nginx, Next.js, MySQL e variáveis de ambiente
- [ ] SSL/TLS e redirecionamento HTTP → HTTPS