
import { sendMessage } from '../telegram';

export async function handleStart(chatId) {
  const message = `🎉 Welcome to SubsTrackerBot! 🎉

I can help you keep track of all your subscriptions.`;
  const keyboard = {
    inline_keyboard: [
      [
        { text: '📋 View Subscriptions', callback_data: 'list' },
        { text: '➕ Add Subscription', callback_data: 'info' },
      ],
    ],
  };

  await sendMessage(chatId, message, { reply_markup: JSON.stringify(keyboard) });
}
