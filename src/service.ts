import nextjs from '@prisma/composer/nextjs';
import { compute } from '@prisma/composer-prisma-cloud';
import { rpc } from '@prisma/composer/service-rpc';
import { durableStreams } from '@prisma/composer-prisma-cloud/streams';

// We will use rawPostgres for now to keep the migration simple, 
// since migrating the entire Next.js app to use the Composer generated ORM client 
// would require rewriting all existing `import { prisma } from '@/lib/prisma'` calls.
// Instead, we will pass the DB URL via standard env vars.

export default compute({
  name: 'dashboard',
  deps: {
    streams: durableStreams()
  },
  build: nextjs({ module: import.meta.url, appDir: '..' }),
  // In a real app we'd define deps here, but we'll use a raw DB URL approach for this Next.js app.
});
