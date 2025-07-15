# SubsTracker Telegram 机器人

一个简洁高效的 Telegram 机器人，用于追踪您的订阅服务，构建于 Cloudflare Workers 之上。

## ✨ 功能特性

- **添加订阅**: 使用简单的命令轻松添加新订阅。
- **列出订阅**: 在清晰的交互式列表中查看您的所有订阅。
- **删除订阅**: 只需轻轻一点即可删除订阅。
- **定时提醒**: 通过 Cron 作业自动获取即将到期的订阅提醒（通过 `/cron` 端点）。

## 🚀 开始使用

### 1. 部署到 Cloudflare Workers

- 点击下方按钮将此机器人部署到您的 Cloudflare 账户。

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-github/SubsTracker) <!-- TODO: 请替换为您的仓库 URL -->

- 在设置过程中，系统会提示您创建一个 KV 命名空间。请将其命名为 `SUBSCRIPTIONS_KV`。

### 2. 配置环境变量

- 在 Cloudflare 后台，进入 Worker 的设置页面。
- 添加以下环境变量：
  - `TELEGRAM_BOT_TOKEN`: 您的 Telegram 机器人令牌，从 [@BotFather](https://t.me/BotFather) 获取。

### 3. 设置 Webhook

- 在您的终端中运行以下命令，将 `<YOUR_WORKER_URL>` 和 `<YOUR_TELEGRAM_BOT_TOKEN>` 替换为您的实际值：

```bash
curl "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>"
```

### 4. (可选) 配置 Cron 触发器

- 要启用每日提醒，请进入 Worker 的设置。
- 在“触发器”下，添加一个 Cron 触发器，计划设置为 `0 8 * * *`，以在每天早上8点运行检查。

## 🤖 如何使用

- **/start**: 启动机器人并显示主菜单，提供查看或添加订阅的选项。
- **/add <名称> <金额> <日期>**: 添加一个新的订阅。例如：`/add Netflix 15.99 2023-12-25`。
- **/list**: 显示您当前所有的订阅，并可以直接在列表上删除每一个订阅。

## 🤝 参与贡献

欢迎提交贡献、报告问题或提出功能建议！

## 📜 许可证

本项目采用 MIT 许可证。
