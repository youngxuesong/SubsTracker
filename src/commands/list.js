

import { sendMessage, editMessageText } from '../telegram';
import { listSubscriptions } from '../kv';

export async function handleList(chatId, messageId) {
  const subs = await listSubscriptions(chatId);

  if (subs.length === 0) {
    const message = 'You have no subscriptions yet. Try adding one with /add!';
    if (messageId) {
      await editMessageText(chatId, messageId, message, { reply_markup: JSON.stringify({ inline_keyboard: [[{ text: '➕ Add Subscription', callback_data: 'info' }]] }) });
    } else {
      await sendMessage(chatId, message, { reply_markup: JSON.stringify({ inline_keyboard: [[{ text: '➕ Add Subscription', callback_data: 'info' }]] }) });
    }
    return;
  }

  const message = 'Here are your subscriptions:';
  const keyboard = {
    inline_keyboard: subs.map((s, i) => [
      {
        text: `*${s.name}* - ${s.amount} - ${s.date}`,
        callback_data: `noop_${i}`,
      },
      {
        text: '🗑️ Delete',
        callback_data: `delete_${i}`,
      },
    ]),
  };

  if (messageId) {
    await editMessageText(chatId, messageId, message, { reply_markup: JSON.stringify(keyboard) });
  } else {
    await sendMessage(chatId, message, { reply_markup: JSON.stringify(keyboard) });
  }
}

