# Sistema de Gestión para Verdulería

Un sistema completo de gestión de pedidos para verdulerías, con aplicación de escritorio para gestión de pedidos, emisión de remitos con códigos QR y aplicación móvil para confirmación de entregas.

[🇬🇧 English Version](./README.md)

## 📋 Descripción General

Este proyecto es una solución completa de gestión para verdulerías que permite:
- Gestión de productos y clientes
- Registro y seguimiento de pedidos
- Generación de remitos con códigos QR
- Confirmación de entregas mediante app móvil
- Reportes de ventas diarias

## 🏗️ Estructura del Proyecto

```
Verduleria/
├── verduleria/              # Backend (Java Spring Boot + MySQL)
├── frontend-electron/       # Aplicación de Escritorio (React + Electron)
├── verduleria-mobile/       # Aplicación Móvil (React)
└── README.es.md            # Este archivo
```

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Java Spring Boot
- **Base de Datos**: MySQL
- **Arquitectura**: API RESTful

### Aplicación de Escritorio
- **Frontend**: React 18 + Vite
- **Framework de Escritorio**: Electron
- **Librería de UI**: TailwindCSS + shadcn/ui
- **Iconos**: Lucide React
- **Generación de QR**: qrcode.react

### Aplicación Móvil
- **Framework**: React
- **Propósito**: Escaneo de QR y confirmación de entregas

## 🚀 Comenzando

### Requisitos Previos
- Java JDK 11 o superior
- Node.js 16 o superior
- MySQL 8.0 o superior
- npm o yarn

### Configuración del Backend

1. Navega al directorio del backend:
```bash
cd verduleria
```

2. Configura la conexión a la base de datos en `application.properties`

3. Ejecuta la aplicación Spring Boot:
```bash
./mvnw spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

### Configuración de la Aplicación de Escritorio

1. Navega al directorio de la aplicación de escritorio:
```bash
cd frontend-electron
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura la URL del backend en `src/config/api.js`

4. Ejecuta en modo desarrollo:
```bash
# Modo navegador
npm run dev

# Modo escritorio (Electron)
npm run electron:dev
```

5. Construir para producción:
```bash
npm run electron:build
```

El instalador se generará en la carpeta `dist-electron/`.

### Configuración de la Aplicación Móvil

1. Navega al directorio de la aplicación móvil:
```bash
cd verduleria-mobile
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta en modo desarrollo:
```bash
npm start
```

## ✨ Funcionalidades

### Aplicación de Escritorio
- ✅ Gestión de Productos (operaciones CRUD)
- ✅ Gestión de Clientes
- ✅ Registro de Pedidos
- ✅ Emisión de Remitos con Códigos QR
- ✅ Confirmación de Entregas
- ✅ Reportes de Ventas Diarias

### Aplicación Móvil
- ✅ Escaneo de Códigos QR
- ✅ Confirmación de Entregas
- ✅ Búsqueda de Pedidos

## 📱 Flujo de Uso

1. **Creación de Pedidos**: Crea pedidos en la aplicación de escritorio
2. **Remito de Entrega**: Genera remitos con códigos QR únicos
3. **Entrega**: El repartidor usa la app móvil para escanear el QR y confirmar la entrega
4. **Reportes**: Visualiza reportes de ventas y entregas diarias

## 🔧 Configuración

### Configuración del Backend
Configura lo siguiente en `verduleria/src/main/resources/application.properties`:
- Conexión a la base de datos
- Puerto del servidor
- Secret JWT (si aplica)

### Configuración de la App de Escritorio
Configura en `frontend-electron/src/config/api.js`:
- URL de la API del backend
- Configuraciones por defecto

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Autor

**Facundo Nicolas Gandolfo**

## 🐛 Problemas Conocidos

- Algunas funcionalidades pueden requerir configuración adicional

---

Hecho con ❤️ para la gestión de verdulerías
