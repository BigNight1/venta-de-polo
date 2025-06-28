# Gestión de Imágenes de Polos

Este documento explica cómo se gestionan las imágenes de los productos tipo polo.

## Funcionalidades Implementadas

### 1. Eliminación Automática de Imágenes
Cuando eliminas un tour, el sistema automáticamente elimina las imágenes asociadas del sistema de archivos.

**Archivos modificados:**
- `src/tours/tours.service.ts` - Lógica de eliminación de imágenes
- `src/upload/upload.service.ts` - Servicio para manejo de archivos

### 2. Limpieza de Imágenes Huérfanas
Puedes limpiar todas las imágenes que no están siendo utilizadas por ningún tour.

**Endpoints disponibles:**
- `GET /tours/admin/cleanup-images` - Limpia imágenes huérfanas
- `GET /tours/admin/upload-stats` - Obtiene estadísticas de archivos

### 3. Dashboard de Administración Mejorado
El dashboard ahora incluye:
- Estadísticas de archivos (total, en uso, huérfanos, tamaño)
- Botón para limpiar imágenes huérfanas
- Actualización automática de estadísticas después de eliminar tours

## Cómo Usar

### Eliminar un Tour
1. Ve al dashboard de administración
2. Haz clic en "Eliminar" junto al tour que quieres borrar
3. Confirma la acción
4. El tour y sus imágenes se eliminarán automáticamente

### Limpiar Imágenes Huérfanas
1. Ve al dashboard de administración
2. Revisa las estadísticas de archivos
3. Si hay archivos huérfanos, haz clic en "Limpiar Imágenes Huérfanas"
4. Confirma la acción

### Ver Estadísticas
Las estadísticas se muestran automáticamente en el dashboard e incluyen:
- Total de archivos en `/public/uploads`
- Archivos en uso por tours
- Archivos huérfanos (no utilizados)
- Tamaño total de archivos

## Estructura de Archivos

```
backend/
├── src/
│   ├── tours/
│   │   ├── tours.service.ts     # Lógica de eliminación de tours e imágenes
│   │   └── tours.controller.ts  # Endpoints de administración
│   └── upload/
│       ├── upload.service.ts    # Servicio de manejo de archivos
│       └── upload.controller.ts # Endpoints de upload y limpieza
└── public/
    └── uploads/                 # Directorio de imágenes
```

## Dependencias Agregadas

```bash
pnpm add fs-extra @types/fs-extra
```

## Consideraciones de Seguridad

- Solo usuarios autenticados pueden eliminar tours y limpiar imágenes
- Se verifica que las rutas de archivos sean seguras antes de eliminarlas
- Los errores de eliminación de archivos no impiden la eliminación del tour

## Logs

El sistema registra las siguientes acciones:
- Archivos eliminados al borrar tours
- Archivos huérfanos eliminados durante la limpieza
- Errores durante la eliminación de archivos

## Mantenimiento

Para mantener el sistema limpio:
1. Revisa regularmente las estadísticas en el dashboard
2. Ejecuta la limpieza de imágenes huérfanas cuando sea necesario
3. Monitorea los logs del servidor para detectar errores de eliminación 