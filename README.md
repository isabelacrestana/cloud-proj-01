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

Vagrant, VirtualBox, Ubuntu 20.04, Nginx, Next.js 16, Node.js 22, MySQL 8,
mysql2, bcryptjs e jose (JWT)

## Estrutura

```text
proj01-cloud/
├── Vagrantfile
├── .env.example
├── nginx/reverse-proxy.conf
├── db/
│   ├── schema.sql        # tabelas (usuario, quadra, reserva)
│   └── seed.sql          # carga inicial (admin, clientes, quadras)
└── web/                  # Next.js (sincronizado em /home/vagrant/app)
    ├── proxy.ts          # protege as rotas antes de chegarem na aplicacao
    ├── lib/
    │   ├── db.ts         # pool de conexao MySQL
    │   └── sessao.ts     # JWT: assinar, verificar, encerrar
    └── app/
        ├── (auth)/       # /login e /cadastro
        ├── cliente/      # area do cliente (exige sessao)
        ├── admin/        # area administrativa (exige papel admin)
        └── api/auth/     # cadastro, login, logout
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

Preencha o `.env` (não versionado). Além das credenciais do banco, é preciso
gerar uma chave para assinar os tokens de sessão:

```bash
openssl rand -base64 32
```

No PowerShell, sem `openssl`:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```

Cole o resultado em `JWT_SECRET`. **Cada integrante gera a sua** — a chave é
local, não precisa ser igual entre vocês, e um token assinado numa máquina não
vale na outra. A aplicação recusa chaves com menos de 32 caracteres.

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

## Acessando o sistema

O `seed.sql` cria três contas no primeiro `vagrant up`:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@example.com` | `admin12345` |
| Cliente | `ana.souza@example.com` | `cliente123` |
| Cliente | `bruno.lima@example.com` | `cliente123` |

São credenciais de desenvolvimento: as senhas ficam no banco apenas como hash
bcrypt, e o domínio `example.com` é reservado pela RFC 2606, então nenhum
endereço real é usado.

O administrador **precisa** vir do seed: a tela de cadastro cria sempre
`cliente`, e o papel nunca é lido do corpo da requisição — caso contrário
qualquer visitante poderia se cadastrar como admin.

## Autenticação e proteção de rotas

Cadastro e login gravam e consultam a tabela `usuario`:

- a senha nunca chega ao banco — é armazenada como hash **bcrypt** (custo 12)
- o login devolve um **JWT** assinado com `JWT_SECRET`, guardado num cookie
  `httpOnly` de 8 horas
- todas as consultas usam *prepared statements*

O arquivo `web/proxy.ts` (a convenção do Next 16 que substitui o
`middleware.ts`) verifica o token **antes** de a requisição chegar na aplicação:

| Situação | Página | Rota de API |
|---|---|---|
| sem sessão | redireciona para `/login` | `401` |
| sessão de cliente em rota de admin | redireciona para `/cliente` | `403` |
| sessão válida | segue | segue |

As rotas cobertas estão no `matcher` do `proxy.ts`: `/admin/*`, `/cliente/*`,
`/api/admin/*` e `/api/reservas/*`. Login, cadastro e a landing ficam de fora,
senão não seria possível autenticar.

**Para quem for escrever novas rotas:** as que casam com o `matcher` já chegam
autenticadas. Para saber quem está logado:

```ts
import { lerSessao } from "@/lib/sessao";

const sessao = await lerSessao();   // { id, papel }
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
- [x] Carga inicial de dados (`db/seed.sql`)
- [x] Cadastro e login integrados ao banco, com senha em hash bcrypt
- [x] Sessão por JWT e proteção de rotas por papel (`web/proxy.ts`)
- [ ] Telas de reserva de quadra (cliente)
- [ ] Dashboard com estatísticas (admin)
- [ ] Endurecimento do MySQL (bind-address, menor privilégio, firewall)
- [ ] Acesso a partir de outras máquinas da rede (`forwarded_port`)
- [ ] SSL/TLS e redirecionamento HTTP → HTTPS
