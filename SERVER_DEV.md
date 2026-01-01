
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