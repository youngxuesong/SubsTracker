# SubsTracker Telegram Bot

A simple and efficient Telegram bot for tracking your subscriptions, built on Cloudflare Workers.

## ✨ Features

- **Add Subscriptions**: Easily add new subscriptions with a simple command.
- **List Subscriptions**: View all your subscriptions in a clean, interactive list.
- **Delete Subscriptions**: Remove subscriptions with a single tap.
- **Cron Job Reminders**: Automatically get reminders for upcoming subscription renewals (via the `/cron` endpoint).

## 🚀 Getting Started

### 1. Deploy to Cloudflare Workers

- Click the button below to deploy the bot to your Cloudflare account.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-github/SubsTracker) <!-- TODO: Replace with your repo URL -->

- During setup, you will be prompted to create a KV namespace. Name it `SUBSCRIPTIONS_KV`.

### 2. Configure Environment Variables

- Go to your Worker's settings in the Cloudflare dashboard.
- Add the following environment variables:
  - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token, obtained from [@BotFather](https://t.me/BotFather).

### 3. Set up the Webhook

- Run the following command in your terminal, replacing `<YOUR_WORKER_URL>` and `<YOUR_TELEGRAM_BOT_TOKEN>` with your actual values:

```bash
curl "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>"
```

### 4. (Optional) Configure Cron Trigger

- To enable daily reminders, go to your Worker's settings.
- Under "Triggers", add a Cron Trigger with the schedule `0 8 * * *` to run the check every day at 8 AM.

## 🤖 How to Use

- **/start**: Initiates the bot and displays the main menu with options to view or add subscriptions.
- **/add <name> <amount> <date>**: Adds a new subscription. For example: `/add Netflix 15.99 2023-12-25`.
- **/list**: Shows all your current subscriptions, with an option to delete each one directly from the list.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📜 License

This project is licensed under the MIT License.