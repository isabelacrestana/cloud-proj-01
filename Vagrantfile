require "dotenv/load"

DB_NAME = ENV["DB_NAME"]
DB_USER = ENV["DB_USER"]
DB_PASSWORD = ENV["DB_PASSWORD"]
DB_HOST = ENV["DB_HOST"]
DB_PORT = ENV["DB_PORT"]

Vagrant.configure("2") do |config|

    config.vm.define "proxy" do |proxy|
        proxy.vm.box = "ubuntu/focal64"
        proxy.vm.hostname = "proxy"
        proxy.vm.network "private_network", ip: "192.168.57.10", netmask: "255.255.255.0"

        proxy.vm.network "private_network", ip: "192.168.56.10",
                         netmask: "255.255.255.0", virtualbox__intnet: "rede_interna"

        proxy.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
            vb.cpus = 2
            vb.name = "VM1-proxy"
        end

        proxy.vm.synced_folder "./nginx", "/home/vagrant/nginx"

        proxy.vm.provision "shell", inline: <<-SHELL

            sudo apt-get -y update && sudo apt-get -y upgrade
            sudo apt-get install -y nginx openssl net-tools
            sudo cp /home/vagrant/nginx/reverse-proxy.conf \
                    /etc/nginx/sites-available/reverse-proxy

            sudo rm -f /etc/nginx/sites-enabled/default

            sudo ln -sf \
                /etc/nginx/sites-available/reverse-proxy \
                /etc/nginx/sites-enabled/reverse-proxy

            sudo nginx -t
            sudo systemctl restart nginx

            echo "=================================================="
            echo "  ACESSE A APLICACAO EM: http://192.168.57.10"
            echo "=================================================="
        SHELL
    end



    config.vm.define "appserver" do |appserver|
        appserver.vm.box = "ubuntu/focal64"
        appserver.vm.hostname = "appserver"
        appserver.vm.network "private_network", ip: "192.168.56.20",
                             netmask: "255.255.255.0", virtualbox__intnet: "rede_interna"

        appserver.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "VM2-appserver"
        end

        #Sincroniza a pasta do projeto com a pasta da VM, permitindo alteracoes em tempo real
        appserver.vm.synced_folder "./web", "/home/vagrant/app"

        appserver.vm.provision "shell", inline: <<-SHELL
            set -e

            echo "==> Atualizando sistema..."
            sudo apt-get update

            echo "==> Instalando pacotes..."
            sudo apt-get install -y \
                net-tools \
                curl \
                git \
                build-essential \
                mysql-client
            
            echo "DB_HOST=#{DB_HOST}" > /home/vagrant/app/.env.local
            echo "DB_PORT=#{DB_PORT}" >> /home/vagrant/app/.env.local
            echo "DB_NAME=#{DB_NAME}" >> /home/vagrant/app/.env.local
            echo "DB_USER=#{DB_USER}" >> /home/vagrant/app/.env.local
            echo "DB_PASSWORD=#{DB_PASSWORD}" >> /home/vagrant/app/.env.local

            echo "==> Instalando Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
            sudo apt-get install -y nodejs

            echo "==> Verificando Node.js..."
            node --version
            npm --version

            echo "==> Instalando dependências do projeto..."
            cd /home/vagrant/app
            npm install

            echo "==> Dependências instaladas com sucesso!"

        SHELL
    end



    config.vm.define "DB" do |db|
        db.vm.box = "ubuntu/focal64"
        db.vm.hostname = "DB"
        db.vm.network "private_network", ip: "192.168.56.30",
                      netmask: "255.255.255.0", virtualbox__intnet: "rede_interna"

        db.vm.provider "virtualbox" do |vb|
            vb.memory = "2048"
            vb.cpus = 2
            vb.name = "VM3-DB"
        end

        db.vm.synced_folder "./db", "/home/vagrant/db"

        db.vm.provision "shell", inline: <<-SHELL

            sudo apt-get -y update && sudo apt-get -y upgrade
            sudo apt-get install -y net-tools mysql-server

            #Libera o mysql para receber requisicoes de outros servidores/computadores
            sudo sed -i 's/127.0.0.1/0.0.0.0/g' /etc/mysql/mysql.conf.d/mysqld.cnf
            #Restarta o mysql para aplicar configuracao
            sudo systemctl restart mysql

            #Configura usuario e senha
            sudo mysql -e "CREATE USER IF NOT EXISTS '#{DB_USER}'@'192.168.56.20' IDENTIFIED BY '#{DB_PASSWORD}';"

            # Importa banco e tabelas
            if [ -f "/home/vagrant/db/schema.sql" ]; then
                echo "--> Importando tabelas do schema.sql..."
                sudo mysql < /home/vagrant/db/schema.sql
            fi      

            #Concede permissoes totais sobre a db ao usuario
            sudo mysql -e "GRANT ALL PRIVILEGES ON #{DB_NAME}.* TO '#{DB_USER}'@'192.168.56.20';"
            sudo mysql -e "FLUSH PRIVILEGES;"


        SHELL
    end

end