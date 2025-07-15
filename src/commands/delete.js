
import { answerCallbackQuery } from '../telegram';
import { deleteSubscription } from '../kv';
import { handleList } from './list';

export async function handleDelete(chatId, callbackQuery) {
  const index = parseInt(callbackQuery.data.split('_')[1], 10);
  const deleted = await deleteSubscription(chatId, index);
  if (deleted) {
    await answerCallbackQuery(callbackQuery.id, '✅ Subscription deleted successfully.');
    await handleList(chatId, callbackQuery.message.message_id);
  } else {
    await answerCallbackQuery(callbackQuery.id, '❌ Failed to delete subscription. Please try again.');
  }
}
