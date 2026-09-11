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

| VM | Função | Rede externa | Rede interna |
|---|---|---|---|
| `proxy` | Proxy reverso (Nginx) | `192.168.57.10` | `192.168.56.10` |
| `appserver` | Aplicação Next.js | — | `192.168.56.20` |
| `DB` | Banco MySQL | — | `192.168.56.30` |

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
    │   ├── sessao.ts     # JWT: assinar, verificar, encerrar
    │   └── quadras.ts    # modalidades e tipos compartilhados
    └── app/
        ├── (auth)/       # /login e /cadastro
        ├── cliente/      # area do cliente (exige sessao)
        ├── admin/        # area administrativa (exige papel admin)
        └── api/          # auth, reservas e administracao
```

---

# Rodando do zero

Passo a passo para uma máquina que nunca rodou o projeto.
Tempo estimado: **30 a 40 minutos**, a maior parte esperando downloads.

**Requisitos:** 8 GB de RAM, 15 GB livres em disco e virtualização habilitada na
BIOS (VT-x na Intel, AMD-V na AMD).

## Passo 1 — Instalar VirtualBox e Vagrant

- VirtualBox: https://www.virtualbox.org/wiki/Downloads
- Vagrant: https://developer.hashicorp.com/vagrant/install

Depois de instalar, **feche e reabra o terminal** e confirme:

```powershell
vagrant --version
VBoxManage --version
```

Se o `VBoxManage` não for encontrado, use o caminho completo nos comandos
seguintes: `& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"`

## Passo 2 — Desativar a Integridade de Memória do Windows

**Obrigatório no Windows.** A Segurança Baseada em Virtualização (VBS) toma o
hardware de virtualização para si, e o VirtualBox passa a rodar num modo
degradado em que as VMs **travam no boot de forma aleatória**.

Verifique o estado atual:

```powershell
(Get-CimInstance Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard).VirtualizationBasedSecurityStatus
```

- retornou `0` — siga para o passo 3
- retornou `2` — está ativo, desative:

1. Abra `windowsdefender://coreisolation` e desligue **Integridade de memória**
2. Num PowerShell **como administrador**:

```powershell
bcdedit /set hypervisorlaunchtype off
```

3. **Reinicie o Windows**
4. Confirme que o comando de verificação passou a retornar `0`

> Isso desativa WSL2 e Docker Desktop, que dependem do mesmo hipervisor.
> Para reverter: `bcdedit /set hypervisorlaunchtype auto` e religar a
> Integridade de memória.

## Passo 3 — Plugin dotenv

```powershell
vagrant plugin install dotenv
```

O `Vagrantfile` lê as credenciais do `.env` através dele. Sem o plugin, o
`vagrant up` falha na primeira linha.

## Passo 4 — Adaptador host-only

O VirtualBox cria o adaptador em `192.168.56.1`, a mesma faixa usada aqui pela
**rede interna**. É preciso movê-lo para a faixa da rede externa:

```powershell
VBoxManage hostonlyif ipconfig "VirtualBox Host-Only Ethernet Adapter" --ip 192.168.57.1 --netmask 255.255.255.0
```

Se o adaptador ainda não existir, crie antes com `VBoxManage hostonlyif create`.

Confirme com `VBoxManage list hostonlyifs` — o `IPAddress` deve ser
`192.168.57.1`.

## Passo 5 — Clonar e configurar

```powershell
git clone <url-do-repositorio>
cd proj01-cloud
Copy-Item .env.example .env
```

Abra o `.env` e preencha:

```ini
DB_NAME=clube_reservas
DB_USER=app_user
DB_PASSWORD=escolha_uma_senha
DB_HOST=192.168.56.30
DB_PORT=3306
JWT_SECRET=cole_aqui_a_chave_gerada_abaixo
COOKIE_SECURE=false
```

Para gerar o `JWT_SECRET` (mínimo 32 caracteres):

```powershell
Para Linux:   openssl rand -base64 32
Para windows: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```

A chave é local — cada pessoa gera a sua, não precisa ser igual entre integrantes.

O `COOKIE_SECURE` fica `false` porque o acesso é por HTTP. Só mude para `true`
ao configurar TLS no Nginx, ou o navegador deixa de enviar o cookie e o login
para de funcionar.

## Passo 6 — Subir o ambiente

```powershell
vagrant up
```

Na primeira vez leva de 20 a 40 minutos: baixa a imagem do Ubuntu, cria as três
VMs, instala Nginx, Node e MySQL, importa o banco e compila a aplicação.

Ao final, o provisionamento do `appserver` imprime:

```
==> Aplicacao disponivel via proxy em http://192.168.57.10 ou http://localhost:8080
```

Confirme com `vagrant status` que as três estão `running`.

## Passo 7 — Acessar

```
http://192.168.57.10
```

A aplicação já está no ar: o serviço `clube-app` sobe junto com a VM, em modo
produção. Não é preciso executar mais nada.

---

# Acessando o sistema

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

---

# Se algo der errado

## `vagrant up` trava em "Waiting for machine to boot"

Quase sempre é a **Integridade de Memória** do Windows (passo 2):

```powershell
(Get-CimInstance Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard).VirtualizationBasedSecurityStatus
```

Se retornar `2`, refaça o passo 2. Para confirmar, procure no log da VM
(`%USERPROFILE%\VirtualBox VMs\VM1-proxy\Logs\VBox.log`) por:

```
HM: HMR3Init: Attempting fall back to NEM: AMD-V is not available
```

Essa linha significa que o VirtualBox não tem acesso ao processador e está
emulando por cima do Hyper-V — nesse modo o boot falha de forma intermitente.

## Erro em `dotenv/load` no início do `vagrant up`

Falta o plugin (passo 3): `vagrant plugin install dotenv`

## Erro de faixa de rede ao criar as VMs

O adaptador host-only está na faixa errada. Refaça o passo 4.

## `npm error EPROTO ... symlink`

O `Vagrantfile` já usa `npm install --no-bin-links` para evitar isso — a pasta
sincronizada do VirtualBox não suporta symlinks. Se aparecer, confirme que está
com a versão atualizada do repositório (`git pull`).

## A página não abre ou retorna `502 Bad Gateway`

Verifique o serviço da aplicação:

```powershell
vagrant ssh appserver -c "systemctl status clube-app"
```

Se estiver parado:

```powershell
vagrant ssh appserver -c "sudo systemctl restart clube-app"
```

## Alterei o código e o site não mudou

Esperado: a aplicação roda em **modo produção**, servindo um build pronto. Para
ver alterações:

```powershell
vagrant ssh appserver
cd /home/vagrant/app
npm run build -- --webpack
sudo systemctl restart clube-app
```

## Recomeçar do zero

```powershell
vagrant destroy -f
vagrant up
```

Apaga as três VMs e recria. O banco volta ao estado do `seed.sql` — contas e
reservas criadas pela interface se perdem.

---

# Autenticação e proteção de rotas

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

# Verificando a segregação de redes

A partir do hospedeiro, apenas o proxy pela rede externa deve responder:

```powershell
Test-NetConnection 192.168.57.10 -Port 80     # True  (proxy, rede externa)
Test-NetConnection 192.168.56.10 -Port 80     # False (proxy, rede interna)
Test-NetConnection 192.168.56.20 -Port 3000   # False (appserver)
Test-NetConnection 192.168.56.30 -Port 3306   # False (MySQL)
```

As três últimas são inalcançáveis do hospedeiro, mas continuam se comunicando
entre si pela rede interna — o que se confirma pelo site funcionar.

# Comandos úteis

| Comando | Descrição |
|---|---|
| `vagrant up` | cria ou liga as VMs |
| `vagrant halt` | desliga (mantém os dados) |
| `vagrant destroy -f` | apaga as VMs e os dados |
| `vagrant status` | estado das VMs |
| `vagrant ssh <proxy\|appserver\|DB>` | acessa uma VM |
| `vagrant provision` | reexecuta o provisionamento |
| `vagrant reload` | reinicia (reaplica rede e hardware) |

Acesso ao banco:

```powershell
vagrant ssh DB
sudo mysql
```

```sql
USE clube_reservas;
SHOW TABLES;
SELECT id, nome, email, papel FROM usuario;
```

# Status

- [x] VMs, redes virtuais, Nginx, Next.js, MySQL e variáveis de ambiente
- [x] Segregação entre rede externa e interna, com o proxy como barreira
- [x] Carga inicial de dados (`db/seed.sql`)
- [x] Cadastro e login integrados ao banco, com senha em hash bcrypt
- [x] Sessão por JWT e proteção de rotas por papel (`web/proxy.ts`)
- [x] Reserva de quadras e dashboard administrativo
- [x] Execução em modo produção (build no provisionamento)
- [ ] SSL/TLS no Nginx e `COOKIE_SECURE=true`
- [ ] Endurecimento do MySQL (bind-address específico, menor privilégio, firewall)
- [ ] Acesso a partir de outras máquinas da rede (`forwarded_port`)
