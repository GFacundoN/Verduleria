# Verdulería - Sistema de Gestión de Pedidos

Aplicación de escritorio para gestión de pedidos de verdulería con emisión de remitos y confirmación de entrega mediante códigos QR.

## 📦 Tecnologías

- **Frontend**: React 18 + Vite
- **Desktop**: Electron
- **Styling**: TailwindCSS + shadcn/ui
- **Backend**: Java Spring Boot (separado)
- **Base de Datos**: MySQL

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar la URL del backend en `src/config/api.js`

## 💻 Desarrollo

```bash
# Ejecutar solo React (navegador)
npm run dev

# Ejecutar con Electron (aplicación de escritorio)
npm run electron:dev
```

## 📬 Construcción

```bash
# Construir aplicación de escritorio
npm run electron:build
```

El instalador se generará en la carpeta `dist-electron/`.

## ✨ Funcionalidades

- ✅ Gestión de Productos
- ✅ Gestión de Clientes
- ✅ Registro de Pedidos
- ✅ Emisión de Remitos con QR
- ✅ Confirmación de Entrega
- ✅ Reportes de Ventas Diarias

## 📁 Estructura del Proyecto

```
frontend-electron/
├── electron/           # Configuración de Electron
├── src/
│   ├── components/     # Componentes React
│   ├── pages/         # Páginas principales
│   ├── services/      # Servicios API
│   ├── config/        # Configuración
│   ├── hooks/         # Custom hooks
│   └── lib/           # Utilidades
├── public/            # Archivos estáticos
└── build/             # Recursos para build
```

## 🔧 Configuración del Backend

Asegúrate de que el backend esté corriendo en `http://localhost:8080` antes de iniciar la aplicación.

## 📱 App Móvil (Futuro)

Para la funcionalidad de escaneo de QR y confirmación de entrega, se desarrollará una app móvil con React Native.

## 📝 Licencia

MIT