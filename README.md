# SciFi Vault

SciFi Vault es un archivo digital interconectado de ciencia ficción, cultura geek e ideas especulativas. No separa blog y wiki: cada página es un **nodo** de conocimiento enlazado por rutas internas, etiquetas y relaciones declaradas.

## Tecnología

- Astro + TypeScript.
- Contenido en Markdown/MDX mediante la colección `nodes`.
- Sitio completamente estático, sin base de datos, CMS, autenticación ni backend.
- CSS propio, oscuro, responsive y accesible.
- Preparado para Vercel con sitemap y RSS.

## Instalación y uso local

```bash
npm install
npm run dev
npm run validate:content
npm run build
npm run preview
```

> Nota: si el registro de npm de tu entorno bloquea paquetes, repetí la instalación en una red con acceso a `astro`, `@astrojs/mdx`, `@astrojs/sitemap` y `@astrojs/rss`.

## Estructura

```txt
src/content/nodes/        Nodos Markdown/MDX
src/content.config.ts     Esquema validado de metadatos
src/lib/taxonomy.ts       Mapeo central de tipos a secciones
src/lib/content.ts        Utilidades de nodos y relaciones
src/pages/archivo/        Archivo, nodos, secciones, tipos, etiquetas y buscador integrado
scripts/validate-content.mjs Validación editorial adicional
templates/node-template.md Plantilla para nuevos nodos
```

## Crear un nodo

1. Escribí el artículo en Word, Google Docs, Notes o cualquier editor.
2. Convertí o copiá el texto a Markdown/MDX.
3. Copiá `templates/node-template.md` a `src/content/nodes/mi-slug.md`.
4. Completá los metadatos obligatorios: `title`, `slug`, `type`, `description`, `tags`, `relatedNodes`, `status`, `createdAt` y `updatedAt`.
5. Marcá `status: draft` para trabajo local o `status: published` para publicación.
6. Validá con `npm run validate:content`.
7. Hacé commit y push a GitHub.
8. Vercel puede publicar automáticamente el cambio desde el repositorio.

## Enlaces internos

Usá enlaces Markdown normales hacia la URL pública del nodo:

```md
[viajes en el tiempo](/archivo/viajes-en-el-tiempo)
```

Estos enlaces no dependen de JavaScript, tienen estilos visibles de hover/focus y el script de validación detecta enlaces internos rotos cuando apuntan a `/archivo/<slug>`.

## `relatedNodes`

`relatedNodes` es una lista de slugs que define relaciones **dirigidas**. Si el nodo A declara a B, A muestra B como relación explícita. No es obligatorio editar B para que apunte de vuelta a A. Además, cada página calcula conexiones sugeridas cuando comparte etiquetas con otros nodos.

## `draft` vs `published`

- `draft`: visible durante desarrollo local para revisar el contenido, identificado con una marca de borrador.
- `published`: incluido en builds de producción, archivo, RSS, sitemap y buscador integrado.

La función `isPublished` filtra borradores cuando `import.meta.env.PROD` está activo.

## Validación

```bash
npm run validate:content
```

Detecta como mínimo:

- slugs duplicados;
- `relatedNodes` con slugs inexistentes;
- metadatos básicos inválidos;
- enlaces internos rotos hacia `/archivo/<slug>`.

El build de Astro valida además el esquema definido en `src/content.config.ts`.

## Despliegue en Vercel

1. Subí el repositorio a GitHub.
2. Importalo en Vercel.
3. Framework preset: Astro.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Cada push a la rama configurada dispara un nuevo build estático.

## Decisiones de diseño

La interfaz evita el patrón de blog cronológico: prioriza índices, metadatos discretos, breadcrumbs y referencias laterales. La jerarquía ordena el contenido; las relaciones y etiquetas permiten exploración lateral.
