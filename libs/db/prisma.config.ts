import { config as dotenvConfig } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig, env } from "prisma/config";

// Load .env from monorepo root (two levels up: libs/db/ -> libs/ -> modulo-catalogo/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenvConfig({ path: resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Aquí es donde Prisma 7 maneja de forma segura tu string de conexión
    url: env("LOCAL_DB_URL"), 
  },
});
