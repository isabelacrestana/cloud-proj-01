Vagrant.configure("2") do |config|

    config.vm.define "proxy" do |proxy|
        proxy.vm.box = "ubuntu/focal64"
        proxy.vm.hostname = "proxy"
        proxy.vm.network "private_network", ip: "192.168.56.10", netmask: "255.255.255.0"

        proxy.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
            vb.cpus = 2
            vb.name = "VM1-proxy"
        end

        proxy.vm.provision "shell", inline: <<-SHELL

            sudo apt-get -y update && sudo apt-get -y upgrade
            sudo apt-get install -y nginx
            sudo apt-get install -y openssl
            sudo apt-get install -y net-tools
        
        SHELL
    end



    config.vm.define "appserver" do |appserver|
        appserver.vm.box = "ubuntu/focal64"
        appserver.vm.hostname = "appserver"
        appserver.vm.network "private_network", ip: "192.168.56.20", netmask: "255.255.255.0"

        appserver.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "VM2-appserver"
        end

        #Sincroniza a pasta do projeto com a pasta da VM, permitindo alteracoes em tempo real
        appserver.vm.synced_folder ".", "/home/vagrant/app"

        appserver.vm.provision "shell", inline: <<-SHELL
            #Interrompe a execucao do script caso qualquer comando falhe
            set -e 

            #Atualiza SO
            sudo apt-get -y update && sudo apt-get -y upgrade

            #Baixa os pacotes basicos
            sudo apt-get install -y net-tools curl git build-essential mysql-client

            sudo -u vagrant cat << 'EOF' > $TARGET_DIR/.env
                # String de conexão padrão para ORMs (Prisma, Drizzle, TypeORM, etc)
                DATABASE_URL="mysql://app_user:admin@192.168.56.30:3306/app_db"

                # Variáveis individuais (caso utilize o driver 'mysql2' diretamente)
                DB_HOST="192.168.56.30"
                DB_PORT="3306"
                DB_USER="app_user"
                DB_PASSWORD="admin"
                DB_NAME="app_db"
            EOF

        SHELL
    end



    config.vm.define "DB" do |db|
        db.vm.box = "ubuntu/focal64"
        db.vm.hostname = "DB"
        db.vm.network "private_network", ip: "192.168.56.30", netmask: "255.255.255.0"

        db.vm.provider "virtualbox" do |vb|
            vb.memory = "2048"
            vb.cpus = 2
            vb.name = "VM3-DB"
        end

        db.vm.provision "shell", inline: <<-SHELL

            sudo apt-get -y update && sudo apt-get -y upgrade
            sudo apt-get install -y net-tools mysql-server

            #Libera o mysql para receber requisicoes de outros servidores/computadores
            sudo sed -i 's/127.0.0.1/0.0.0.0/g' /etc/mysql/mysql.conf.d/mysqld.cnf
            #Restarta o mysql para aplicar configuracao
            sudo systemctl restart mysql

            #Cria database e configura usuario e senha
            sudo mysql -e "CREATE DATABASE IF NOT EXISTS app_db;"
            sudo mysql -e "CREATE USER IF NOT EXISTS 'app_user'@'192.168.56.20' IDENTIFIED BY 'admin';"

            #Concede permissoes totais sobre o banco app_db ao usuario
            sudo mysql -e "GRANT ALL PRIVILEGES ON app_db.* TO 'app_user'@'192.168.56.20';"
            sudo mysql -e "FLUSH PRIVILEGES;"
        SHELL
    end

end