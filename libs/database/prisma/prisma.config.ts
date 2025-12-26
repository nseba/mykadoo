import path from 'node:path';
import { defineConfig } from 'prisma/config';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://mykadoo_user:mykadoo_password@localhost:5433/mykadoo';

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: {
    async development() {
      return {
        url: databaseUrl,
      };
    },
  },
  datasource: {
    url: databaseUrl,
  },
});
