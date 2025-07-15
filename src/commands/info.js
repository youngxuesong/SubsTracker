import { sendMessage } from '../telegram';

export async function handleInfo(chatId) {
  const message = 'To add a new subscription, use the following format:\n\n' +
                  '`/add <name> <amount> <date>`\n\n' +
                  'For example:\n' +
                  '`/add Netflix 15.99 2023-12-25`';
  await sendMessage(chatId, message);
}
