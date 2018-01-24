require('dotenv').config(); //get the environment variables described in .env
const Telegraf = require('telegraf')
const logger = require('au5ton-logger');
logger.setOption('prefix_date',true);
var BOT_USERNAME;

// Create a bot that uses 'polling' to fetch new updates
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

process.on('unhandledRejection', r => logger.error('unhandledRejection: ',r.stack,'\n',r));


bot.hears(new RegExp('\/start|\/start@' + BOT_USERNAME), (context) => {
	context.getChat().then((chat) => {
		if(chat.type === 'private') {
			context.reply('Welcome! I\'m intended for inline use only. Please try to type my name and see what I offer you.\nhttps://github.com/au5ton/audioreaction_bot/issues',{
		  	  disable_web_page_preview: true
		    });
		}
	}).catch((err) => {
		//
	});
});

bot.hears(new RegExp('\/ping|\/ping@' + BOT_USERNAME), (context) => {
	context.reply('pong');
});


logger.log('Bot active. Performing startup checks.');
logger.warn('Is our Telegram token valid?');
bot.telegram.getMe().then((r) => {
	//doesn't matter who we are, we're good
	logger.success('Telegram token valid for @',r.username);
	BOT_USERNAME = r.username;
	bot.startPolling();
}).catch((r) => {
	logger.error('Telegram bot failed to start polling:\n',r);
	process.exit();
});
