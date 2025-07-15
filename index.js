import { handleRequest } from './src/handler';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

addEventListener('scheduled', (event) => {
  event.waitUntil(handleCron());
});