import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    // Si no encuentra el .env, usará esta cadena directamente
    url: process.env.LOCAL_DB_URL || 'postgres://postgres:password@localhost:5435/ecommerce_catalogo_mini?sslmode=disable',
  },
});