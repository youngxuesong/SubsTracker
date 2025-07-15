
import { sendMessage } from '../telegram';
import { addSubscription } from '../kv';

export async function handleAdd(chatId, text) {
  const parts = text.split(' ');
  if (parts.length !== 4) {
    await sendMessage(chatId, 'Oops! It looks like the format is wrong. Please use: /add <name> <amount> <date>');
    return;
  }

  const [, name, amount, date] = parts;
  const subscription = { name, amount, date };

  await addSubscription(chatId, subscription);
  await sendMessage(chatId, `✅ Subscription added successfully!

*Name:* ${name}
*Amount:* ${amount}
*Date:* ${date}`);
}
