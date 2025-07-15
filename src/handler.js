
import { Router } from 'itty-router';
import { handleStart } from './commands/start';
import { handleAdd } from './commands/add';
import { handleList } from './commands/list';
import { handleDelete } from './commands/delete';
import { handleInfo } from './commands/info';
import { handleCron } from './cron';

const router = Router();

router.post('/', async (request) => {
  const { message, callback_query } = await request.json();

  if (message) {
    const { chat, text } = message;
    const command = text.split(' ')[0];

    switch (command) {
      case '/start':
        await handleStart(chat.id);
        break;
      case '/add':
        await handleAdd(chat.id, text);
        break;
      case '/list':
        await handleList(chat.id);
        break;
      default:
        // You can add a default handler for unknown commands
        break;
    }
  } else if (callback_query) {
    const { from, data, message } = callback_query;
    const command = data.split('_')[0];

    switch (command) {
      case 'list':
        await handleList(from.id, message.message_id);
        break;
      case 'info':
        await handleInfo(from.id);
        break;
      case 'delete':
        await handleDelete(from.id, callback_query);
        break;
      default:
        // You can add a default handler for unknown commands
        break;
    }
  }

  return new Response('OK');
});

router.get('/cron', async () => {
  await handleCron();
  return new Response('Cron job executed');
});

export function handleRequest(request) {
  return router.handle(request);
}
