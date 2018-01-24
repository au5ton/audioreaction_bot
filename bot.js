require('dotenv').config(); //get the environment variables described in .env
const Telegraf = require('telegraf')
const logger = require('au5ton-logger');
logger.setOption('prefix_date',true);
const prettyMs = require('pretty-ms');
var BOT_USERNAME;
const DEV_TELEGRAM_ID = parseInt(process.env.DEV_TELEGRAM_ID) || 0;
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
			context.reply('Welcome! I\'m intended for inline use only. Please try to type my name and see what I offer you. If you want to submit your own, use the /requestreaction command. If it\'s a real mp3, I\'ll approve it. This is to prevent spam.\nhttps://github.com/au5ton/audioreaction_bot/issues',{
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
//Alert the developer via Telegram channel that someone requested a new one
bot.hears(new RegExp('\/requestreaction|\/requestreaction@' + BOT_USERNAME), (context) => {
	let message = context.update.message.text;
	let title = message.split(' ').slice(1,message.split(' ').length-1).join(' ');
	let url = message.split(' ')[message.split(' ').length-1];
	let hash = ReactionLoader.addToQueue(title,url);
	if(hash === null || title === '' || url === ' /requestreaction') {
        context.reply('That reaction can\'t be submitted.');
    }
    else {
        context.telegram.sendMessage(process.env.TELEGRAM_CHANNEL_QUEUE_ID, 'ID: '+hash+'\nTitle: '+title+'\nURL: '+url);
    }
});
//Enable the developer to confirm a reaction and add it to the production list
bot.hears(new RegExp('\/submitlive|\/submitlive@' + BOT_USERNAME), (context) => {
    if(context.update.message.from.id === parseInt(process.env.DEV_TELEGRAM_ID) && context.update.message.chat.type === 'private') {
        let message = context.update.message.text;
    	let hash = message.split(' ').slice(1,message.split(' ').length).join(' ').trim();
    	if(ReactionLoader.getQueueById(hash) === null) {
            context.reply('No queued reaction by id: '+hash)
        }
        else {
            let id = ReactionLoader.submitLive(hash);
            context.reply('Reaction added: '+JSON.stringify(ReactionLoader.getById(id)));
        }
    }
});
//Enable the developer to remove a reaction from the production list
bot.hears(new RegExp('\/removelive|\/removelive@' + BOT_USERNAME), (context) => {
    if(context.update.message.from.id === parseInt(process.env.DEV_TELEGRAM_ID) && context.update.message.chat.type === 'private') {
        let message = context.update.message.text;
    	let id = parseInt(message.split(' ').slice(1,message.split(' ').length).join(' ').trim());
    	if(ReactionLoader.getById(id) === null) {
            context.reply('No live reaction by id: '+id)
        }
        else {
            let temp = Object.assign({},ReactionLoader.getById(id));
            ReactionLoader.removeById(id);
            context.reply('Reaction removed: '+JSON.stringify(temp));
        }
    }
});

//Inline queries
bot.on('inline_query', (context) => {
    let query = context.update.inline_query.query;
    if(query === '') {
        //grab first 5 just to show something, maybe adjust this to a "popular reactions" thing
        context.answerInlineQuery(ReactionLoader.getLiveCache().slice(0,5)).catch((err) => {
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
