import { getAllSubscriptions, updateSubscription, getSubscription } from './kv/subscriptions';
import { getConfig } from './kv/config';
import { formatBeijingTime } from './utils/time';
import { lunarCalendar } from './utils/lunarCalendar';
import { sendNotificationToAllChannels } from './notifications';

export async function checkExpiringSubscriptions(env) {
  try {
    const now = new Date();
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    console.log('[定时任务] 开始检查即将到期的订阅 UTC: ' + now.toISOString() + ', 北京时间: ' + beijingTime.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'}));

    const subscriptions = await getAllSubscriptions(env);
    console.log('[定时任务] 共找到 ' + subscriptions.length + ' 个订阅');

    const config = await getConfig(env);
    const expiringSubscriptions = [];
    const updatedSubscriptions = [];
    let hasUpdates = false;

    for (const subscription of subscriptions) {
      if (subscription.isActive === false) {
        console.log('[定时任务] 订阅 "' + subscription.name + '" 已停用，跳过');
        continue;
      }

      const expiryDate = new Date(subscription.expiryDate);
      const daysDiff = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      console.log('[定时任务] 订阅 "' + subscription.name + '" 到期日期: ' + expiryDate.toISOString() + ', 剩余天数: ' + daysDiff);

      // 修复提前提醒天数逻辑
      const reminderDays = subscription.reminderDays !== undefined ? subscription.reminderDays : 7;
      let shouldRemind = false;

      if (reminderDays === 0) {
        // 当提前提醒天数为0时，只在到期日当天提醒
        shouldRemind = daysDiff === 0;
      } else {
        // 当提前提醒天数大于0时，在指定范围内提醒
        shouldRemind = daysDiff >= 0 && daysDiff <= reminderDays;
      }

      // 如果已过期，且设置了周期和自动续订，则自动更新到下一个周期
      if (daysDiff < 0 && subscription.periodValue && subscription.periodUnit && subscription.autoRenew !== false) {
        console.log('[定时任务] 订阅 "' + subscription.name + '" 已过期且启用自动续订，正在更新到下一个周期');

        const newExpiryDate = new Date(expiryDate);

        if (subscription.periodUnit === 'day') {
          newExpiryDate.setDate(expiryDate.getDate() + subscription.periodValue);
        } else if (subscription.periodUnit === 'month') {
          newExpiryDate.setMonth(expiryDate.getMonth() + subscription.periodValue);
        } else if (subscription.periodUnit === 'year') {
          newExpiryDate.setFullYear(expiryDate.getFullYear() + subscription.periodValue);
        }

        while (newExpiryDate < now) {
          console.log('[定时任务] 新计算的到期日期 ' + newExpiryDate.toISOString() + ' 仍然过期，继续计算下一个周期');

          if (subscription.periodUnit === 'day') {
            newExpiryDate.setDate(newExpiryDate.getDate() + subscription.periodValue);
          } else if (subscription.periodUnit === 'month') {
            newExpiryDate.setMonth(newExpiryDate.getMonth() + subscription.periodValue);
          } else if (subscription.periodUnit === 'year') {
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + subscription.periodValue);
          }
        }

        console.log('[定时任务] 订阅 "' + subscription.name + '" 更新到期日期: ' + newExpiryDate.toISOString());

        const updatedSubscription = { ...subscription, expiryDate: newExpiryDate.toISOString() };
        updatedSubscriptions.push(updatedSubscription);
        hasUpdates = true;

        const newDaysDiff = Math.ceil((newExpiryDate - now) / (1000 * 60 * 60 * 24));

        let shouldRemindAfterRenewal = false;
        if (reminderDays === 0) {
          shouldRemindAfterRenewal = newDaysDiff === 0;
        } else {
          shouldRemindAfterRenewal = newDaysDiff >= 0 && newDaysDiff <= reminderDays;
        }

        if (shouldRemindAfterRenewal) {
          console.log('[定时任务] 订阅 "' + subscription.name + '" 在提醒范围内，将发送通知');
          expiringSubscriptions.push({
            ...updatedSubscription,
            daysRemaining: newDaysDiff
          });
        }
      } else if (daysDiff < 0 && subscription.autoRenew === false) {
        console.log('[定时任务] 订阅 "' + subscription.name + '" 已过期且未启用自动续订，将发送过期通知');
        expiringSubscriptions.push({
          ...subscription,
          daysRemaining: daysDiff
        });
      } else if (shouldRemind) {
        console.log('[定时任务] 订阅 "' + subscription.name + '" 在提醒范围内，将发送通知');
        expiringSubscriptions.push({
          ...subscription,
          daysRemaining: daysDiff
        });
      }
    }

    if (hasUpdates) {
      console.log('[定时任务] 有 ' + updatedSubscriptions.length + ' 个订阅需要更新到下一个周期');

      const mergedSubscriptions = subscriptions.map(sub => {
        const updated = updatedSubscriptions.find(u => u.id === sub.id);
        return updated || sub;
      });

      await env.SUBSCRIPTIONS_KV.put('subscriptions', JSON.stringify(mergedSubscriptions));
      console.log('[定时任务] 已更新订阅列表');
    }

    if (expiringSubscriptions.length > 0) {
      console.log('[定时任务] 有 ' + expiringSubscriptions.length + ' 个订阅需要发送通知');

      let commonContent = '';
      expiringSubscriptions.sort((a, b) => a.daysRemaining - b.daysRemaining);

      // 检查是否显示农历（从配置中获取，默认不显示）
      const showLunar = config.SHOW_LUNAR === true;

      for (const sub of expiringSubscriptions) {
        const typeText = sub.customType || '其他';
        const periodText = (sub.periodValue && sub.periodUnit) ? `(周期: ${sub.periodValue} ${ { day: '天', month: '月', year: '年' }[sub.periodUnit] || sub.periodUnit})` : '';

        let lunarExpiryText = '';
        if (showLunar) {
          // 计算农历日期
          const expiryDateObj = new Date(sub.expiryDate);
          const lunarExpiry = lunarCalendar.solar2lunar(expiryDateObj.getFullYear(), expiryDateObj.getMonth() + 1, expiryDateObj.getDate());
          lunarExpiryText = lunarExpiry ? ` (农历: ${lunarExpiry.fullStr})` : '';
        }

        let statusText;
        if (sub.daysRemaining === 0) statusText = `⚠️ **${sub.name}** (${typeText}) ${periodText} 今天到期！${lunarExpiryText}`;
        else if (sub.daysRemaining < 0) statusText = `🚨 **${sub.name}** (${typeText}) ${periodText} 已过期 ${Math.abs(sub.daysRemaining)} 天${lunarExpiryText}`;
        else statusText = `📅 **${sub.name}** (${typeText}) ${periodText} 将在 ${sub.daysRemaining} 天后到期${lunarExpiryText}`;

        if (sub.notes) statusText += `\n   备注: ${sub.notes}`;
        commonContent += statusText + '\n\n';
      }

      const title = '订阅到期提醒';
      await sendNotificationToAllChannels(title, commonContent, config, '[定时任务]');

    } else {
      console.log('[定时任务] 没有需要提醒的订阅');
    }

    console.log('[定时任务] 检查完成');
  } catch (error) {
    console.error('[定时任务] 检查即将到期的订阅失败:', error);
  }
}