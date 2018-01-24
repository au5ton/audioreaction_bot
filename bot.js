require('dotenv').config(); //get the environment variables described in .env
const Telegraf = require('telegraf')
const logger = require('au5ton-logger');
logger.setOption('prefix_date',true);
const prettyMs = require('pretty-ms');
var BOT_USERNAME;
const START_TIME = new Date();

// Create a bot that uses 'polling' to fetch new updates
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const ReactionLoader = require('./ReactionLoader');
const QueryResolver = require('./QueryResolver');

process.on('unhandledRejection', r => logger.error('unhandledRejection: ',r.stack,'\n',r));

//Commands
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
bot.hears(new RegExp('\/uptime|\/uptime@' + BOT_USERNAME), (context) => {
	context.reply(''+prettyMs(new Date() - START_TIME));
});
bot.hears(new RegExp('\/thischat|\/thischat@' + BOT_USERNAME), (context) => {
	context.reply(JSON.stringify(context.update));
});
bot.hears(new RegExp('\/requestreaction|\/requestreaction@' + BOT_USERNAME), (context) => {
	//let hash = ReactionLoader.addToQueue();
	context.telegram.sendMessage(process.env.TELEGRAM_CHANNEL_QUEUE_ID, 'ID: '+hash);
});
bot.hears(new RegExp('\/confirm|\/confirm@' + BOT_USERNAME), (context) => {
	context.reply(''+prettyMs(new Date() - START_TIME));
});

//Inline queries
bot.on('inline_query', (context) => {
    let query = context.update.inline_query.query;
    if(query === '') {
        //grab first 5 just to show something, maybe adjust this to a "popular reactions" thing
        context.answerInlineQuery(Reactions.slice(0,5)).catch((err) => {
            logger.error('answerInlineQuery failed to send: ',err)
        });
    }
    else {
        QueryResolver.search(query).then((results) => {
            context.answerInlineQuery(results).catch((err) => {
                logger.error('answerInlineQuery failed to send: ',err)
            });
        }).catch((err) => {
            logger.error('QueryResolver failed to resolve: ',err)
        })
    }

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
