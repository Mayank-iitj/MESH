import { module } from '@prisma/composer';
import { rawPostgres, bucket } from '@prisma/composer-prisma-cloud';
import { cron } from '@prisma/composer-prisma-cloud/cron';
import { streams } from '@prisma/composer-prisma-cloud/streams';
import dashboardService from './src/service';
import walletReplenisher, { schedule } from './src/cron/service';

export default module('mesh', ({ provision }) => {
  // Provision a database. We'll use the raw Postgres binding to pass the URL to Next.js
  const db = provision(rawPostgres({ name: 'database' }));
  
  // Provision a bucket and streams
  const store = provision(bucket({ name: 'store' }));
  const eventStreams = provision(streams({ name: 'events' }), { deps: { store } });

  // Provision the main dashboard app
  provision(dashboardService, { 
    deps: { streams: eventStreams.streams } 
  });

  // Provision the background cron job for wallet replenishment
  provision(cron({ schedule, runner: walletReplenisher }), { deps: {} });
});
