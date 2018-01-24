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

for (let i = 0; i < 100; i++)
    module.exports.push(generateInlineQueryResultVoice('numero '+i,'https://sooot.github.io/repo/roboruri/oof.mp3'));

//module.exports = {};
