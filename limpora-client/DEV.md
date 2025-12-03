# Iniciar el proyecto

**La primera vez que lo descarges:**
```sh
git clone https://github.com/Garkatron/ProyectoDaw2.git
cd limpora-client # O abrir con vscode
git checkout develop
git checkout -b feature/kevin # Tu rama
```

**Cada vez que empieces a trabajar:**
```sh
git checkout feature/kevin    # Asegúrate de estar en tu rama
git pull origin develop       # Trae los últimos cambios de develop
```

**Al terminar:**
```sh
git add .
git commit -m "Descripción corta de mis cambios"
git push origin feature/kevin  # Push a TU rama
```

**Para integrar tus cambios a develop:**
1. Ve a GitHub y crea un **Pull Request** desde `feature/kevin` hacia `develop`
2. Espera revisión de tu equipo (No lo hagas vos)
3. Una vez aprobado, haz merge en GitHub


# Notas importantes
* No necesitas instalar Node.js en tu máquina
* No necesitas ejecutar npm install manualmente
* Todo funciona dentro del contenedor
* Tu código está en tu máquina (Windows), no dentro del contenedor

**Docker**
1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Instala y reinicia Windows si te lo pide
3. Abre Docker Desktop y espera a que inicie (icono de ballena en la bandeja del sistema)
4. Verifica la instalación abriendo PowerShell o CMD:

**Proyecto**

Revisar si estan:
* Dockerfile.dev
* docker-compose.yml

# Comandos basicos

```sh
docker-compose up --build   # Ejecutar la primera vez

docker-compose up           # Ejecutar el proyecto las demas veces
docker-compose up -d        # Ejecutar en segundo plano

docker-compose logs -f      # Ver logs

docker-compose down         # Parar y eliminar el contenedor (Mejor si usas este, si no se te llena el disco)
docker-compose stop         # Parar el contenedor

# Los dos siguientes juntos para reconstruir desde 0 (No creo que sea necesario)
docker-compose down -v 
docker-compose up --build
```

Acceder a la App Web **Abre tu navegador en: http://localhost:5173**
**Los cambios q hagas se reflejaran al guardar, no hace falta reiniciar el proyecto**

# Comandos utiles
```sh
docker-compose restart  # Cuando los cambios no se reflejan

# Reinstalar dependencias
docker-compose down -v
docker-compose up --build

# Ver contenedores en ejecución
docker ps

# Ver todos los contenedores (incluso detenidos)
docker ps -a

# Ejecutar comandos dentro del contenedor
docker-compose exec limpora-client npm install <paquete>

# Acceder a la terminal del contenedor
docker-compose exec limpora-client sh

# Ver uso de recursos
docker stats
```