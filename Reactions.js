// reactions.js

var generateInlineQueryResultVoice = (title, url) => {
	return {
		type: 'voice',
		id: String(Math.floor(Math.random()*10000)+1),
		title: title,
		voice_url: url
	};
}

module.exports = [];

module.exports.push(generateInlineQueryResultVoice('X-Files Theme','https://sooot.github.io/repo/roboruri/xfiles.mp3'));
module.exports.push(generateInlineQueryResultVoice('Running in the 90s','https://sooot.github.io/repo/roboruri/running90s.mp3'));
module.exports.push(generateInlineQueryResultVoice('Roblox oof sound','https://sooot.github.io/repo/roboruri/oof.mp3'))

//module.exports = {};
