
import { listSubscriptions } from './kv';
import { sendMessage } from './telegram';

export async function handleCron() {
  // This is a simplified cron handler. In a real-world scenario, you'd
  // need a way to get all chat IDs, which might require storing them
  // in a separate KV key or using a different database.
  // For this example, we'll assume we have a list of chat IDs.

  // const chatIds = await getAllChatIds(); // Function to be implemented
  const chatIds = []; // Placeholder

  for (const chatId of chatIds) {
    const subs = await listSubscriptions(chatId);
    const today = new Date();

    for (const sub of subs) {
      const subDate = new Date(sub.date);
      const diffTime = Math.abs(subDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 3) {
        await sendMessage(
          chatId,
          `Your subscription for ${sub.name} is due on ${sub.date}.`
        );
      }
    }
  }
}
