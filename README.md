# Projeto 01 — Computação em Nuvem

Aplicação web de reserva de quadras distribuída em VMs (Vagrant + VirtualBox):
proxy Nginx, app Next.js e banco MySQL, em duas redes virtuais segregadas.

## Arquitetura

```text
                    navegador (S.O. hospedeiro)
                              │
        ══════════════════════╪═══════════  REDE EXTERNA
                              │              192.168.57.0/24 (host-only)
                     ┌────────┴────────┐
                     │      proxy      │  192.168.57.10
                     │      Nginx      │  192.168.56.10
                     └────────┬────────┘
                              │
        ══════════════╤═══════╪═══════════  REDE INTERNA
                      │       │              192.168.56.0/24 (intnet)
              ┌───────┴───┐ ┌─┴──────────┐
              │ appserver │ │     DB     │
              │  Next.js  │→│   MySQL    │
              │   :3000   │ │   :3306    │
              └───────────┘ └────────────┘
```

O `proxy` é a **única VM com interface nas duas redes** — é a barreira de proteção
entre a rede externa e a interna. As VMs `appserver` e `DB` são inalcançáveis a
partir do hospedeiro: todo acesso passa obrigatoriamente pelo proxy reverso.

| VM | Função | Rede externa | Rede interna | Recursos |
|---|---|---|---|---|
| `proxy` | Proxy reverso (Nginx) | `192.168.57.10` | `192.168.56.10` | 1 GB RAM / 2 CPUs |
| `appserver` | Aplicação Next.js | — | `192.168.56.20` | 1 GB RAM / 1 CPU |
| `DB` | Banco MySQL | — | `192.168.56.30` | 2 GB RAM / 2 CPUs |

Cada VM possui também uma interface NAT criada automaticamente pelo Vagrant, usada
apenas para `vagrant ssh` e instalação de pacotes. Ela não aceita conexões de
entrada e não transporta tráfego da aplicação.

## Tecnologias

Vagrant, VirtualBox, Ubuntu 20.04, Nginx, Next.js, Node.js, MySQL 8

## Estrutura

```text
proj01-cloud/
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

### 1. Plugin dotenv

```bash
vagrant plugin install dotenv
```

O `Vagrantfile` lê as credenciais do `.env` através desse plugin. Sem ele, o
`vagrant up` falha na primeira linha.

### 2. Adaptador host-only

O VirtualBox cria o adaptador host-only em `192.168.56.1` por padrão — a mesma
faixa usada aqui pela **rede interna**. É necessário movê-lo para a faixa da rede
externa, uma única vez por máquina:

```bash
VBoxManage hostonlyif ipconfig "VirtualBox Host-Only Ethernet Adapter" --ip 192.168.57.1 --netmask 255.255.255.0
```

Confira com `VBoxManage list hostonlyifs` — o `IPAddress` deve ser `192.168.57.1`.

### 3. Credenciais

```bash
cp .env.example .env
```

Preencha o `.env` (não versionado). Consulte o `.env.example` para as variáveis
necessárias.

## Uso

```bash
vagrant up
```

### Acessar a aplicação

| Via | URL |
|---|---|
| Proxy (Nginx) | `http://192.168.57.10` |

Este é o **único** ponto de entrada. O acesso direto ao Next.js
(`192.168.56.20:3000`) e ao MySQL (`192.168.56.30:3306`) é intencionalmente
inacessível a partir do hospedeiro — é o que caracteriza a barreira de proteção.

O Next.js precisa estar rodando na VM `appserver` para o acesso funcionar; caso
contrário o Nginx responde `502 Bad Gateway`.

### Subir o Next.js

```bash
vagrant ssh appserver
cd /home/vagrant/app
npm run dev -- --webpack
```

A flag `--webpack` é necessária: o Turbopack (empacotador padrão do Next 16) falha
ao gravar seu cache em `/home/vagrant/app`, porque essa pasta é um `synced_folder`
do VirtualBox (`vboxsf`), que não implementa `fsync` em diretórios.

### Proxy (Nginx)

```bash
vagrant ssh proxy
sudo systemctl status nginx
sudo nginx -t
```

### MySQL

Administração, a partir da própria VM do banco:

```bash
vagrant ssh DB
sudo mysql
```

```sql
USE clube_reservas;
SHOW TABLES;
```

O `root` do MySQL usa `auth_socket`: autentica pelo usuário do sistema
operacional, sem senha, e só localmente.

Já o usuário da aplicação existe apenas para conexões vindas do appserver
(`'app_user'@'192.168.56.20'`), então precisa ser testado de lá:

```bash
vagrant ssh appserver
mysql -h 192.168.56.30 -u <DB_USER> -p clube_reservas
```

## Verificando a segregação de redes

A partir do hospedeiro (PowerShell):

```powershell
@(@{n='proxy (externa)';ip='192.168.57.10';p=80},
  @{n='proxy (interna)';ip='192.168.56.10';p=80},
  @{n='appserver';      ip='192.168.56.20';p=3000},
  @{n='MySQL';          ip='192.168.56.30';p=3306}) | ForEach-Object {
  $r = Test-NetConnection $_.ip -Port $_.p -WarningAction SilentlyContinue
  [PSCustomObject]@{ Alvo=$_.n; Alcancado=$r.TcpTestSucceeded }
} | Format-Table -AutoSize
```

Resultado esperado: apenas `proxy (externa)` retorna `True`. Os demais são
inalcançáveis do hospedeiro, mas continuam se comunicando pela rede interna.

## Comandos úteis

| Comando | Descrição |
|---|---|
| `vagrant ssh <proxy\|appserver\|DB>` | Acessar uma VM |
| `vagrant status` | Status das VMs |
| `vagrant provision` | Reexecutar provisionamento |
| `vagrant reload` | Reiniciar VMs (reaplica configuração de rede) |
| `vagrant halt` | Parar VMs |
| `vagrant destroy` | Destruir VMs |

## Status

- [x] VMs, redes virtuais, Nginx, Next.js, MySQL e variáveis de ambiente
- [x] Segregação entre rede externa e interna, com o proxy como barreira
- [ ] Carga inicial de dados (`db/seed.sql`)
- [ ] Integração da aplicação com o banco
- [ ] Endurecimento do MySQL (bind-address, menor privilégio, firewall)
- [ ] Acesso a partir de outras máquinas da rede (`forwarded_port`)
- [ ] SSL/TLS e redirecionamento HTTP → HTTPS
