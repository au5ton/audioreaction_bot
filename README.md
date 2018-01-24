# audioreaction_bot
:robot: Telegram bot

Live bot: http://t.me/audioreaction_bot

## Running an instance

audioreaction_bot requires node >=6.2.0, because of its dependency [`telegraf`](https://npmjs.com/telegraf). To get started:

- `git clone https://github.com/au5ton/audioreaction_bot.git`
- `cd audioreaction_bot`
- `npm install`
- `cp .env.example .env`
- `nano .env` (edit the config file somehow)
- Fill everything out.
- `screen -S my_bot` (start a new screen session)
- `node bot.js` (start the bot)
- Look for any errors during the startup checks
- your bot is running persistently
- To detach of the screen session, use `CTRL+A` then `CTRL+D`.
