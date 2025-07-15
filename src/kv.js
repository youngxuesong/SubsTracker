
export async function listSubscriptions(chatId) {
  const data = await DB.get(chatId.toString(), { type: 'json' });
  return data || [];
}

export async function addSubscription(chatId, subscription) {
  const subs = await listSubscriptions(chatId);
  subs.push(subscription);
  await DB.put(chatId.toString(), JSON.stringify(subs));
}

export async function deleteSubscription(chatId, index) {
  const subs = await listSubscriptions(chatId);
  if (index >= 0 && index < subs.length) {
    subs.splice(index, 1);
    await DB.put(chatId.toString(), JSON.stringify(subs));
    return true;
  }
  return false;
}
