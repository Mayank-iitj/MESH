import { defineSchedule, triggerContract } from '@prisma/composer-prisma-cloud/cron';
import { compute } from '@prisma/composer-prisma-cloud';
import node from '@prisma/composer/node';

export const schedule = defineSchedule({ 
  replenish: '0 0 * * *' // Every day at midnight
});

export default compute({
  name: 'wallet-replenisher',
  deps: {},
  build: node({ module: import.meta.url, entry: 'server.ts' }),
  expose: { trigger: triggerContract }
});
