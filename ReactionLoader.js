// reactions.js

const fs = require('fs');
const crypto = require('crypto');
const logger = require('au5ton-logger');

const _ = {};

var livecache = [];
var queuecache = [];


_.generateInlineQueryResultVoice = (title, url) => {
	return {
		type: 'voice',
		id: String(Math.floor(Math.random()*10000)+1),
		title: title,
		voice_url: url
	};
}

_.generateHash = (data) => {
	return crypto.createHash('md5').update(data).digest('hex');
}

_.getLiveCache = () => {
	return livecache;
};

_.getQueueCache = () => {
	return queuecache;
}

_.getById = (id) => {
	for(let i in livecache) {
		if(livecache[i].id === id) {
			return livecache[i];
		}
	}
	return null;
}

_.getQueueById = (id) => {
	for(let i in queuecache) {
		if(queuecache[i].id === id) {
			return queuecache[i];
		}
	}
	return null;
}

_.removeById = (id) => {
	for(let i = 0; i < livecache.length; i++) {
		if(livecache[i].id === id) {
			livecache.splice(i, 1);
		}
	}
}

_.removeQueueById = (id) => {
	for(let i = 0; i < queuecache.length; i++) {
		if(queuecache[i].id === id) {
			queuecache.splice(i, 1);
		}
	}
}

_.addToQueue = (title,url) => {
	let hash = _.generateHash(url);
	for(let i = 0; i < queuecache.length; i++) {
		if(queuecache[i].id === hash) {
			//this file is already present in the database under a different name
			return null;
		}
	}
	queuecache.push({
		type: 'voice',
		id: hash,
		title: title,
		voice_url: url
	});
	_.writeQueueCacheToDisk();
	return hash;
};

//transfers from queue to live
_.submitLive = (queueId) => {
	_.refreshCache();
	_.refreshQueueCache();
	let temp = _.getQueueById(queueId);
	temp.id = livecache.length+1;
	livecache.push(temp);
	_.removeQueueById(temp.id); //this happens because JS is consolidating memory
	_.writeCacheToDisk();
	_.writeQueueCacheToDisk();
	return temp.id;
};

_.refreshCache = () => {
	if(!fs.existsSync('reaction_live.json')) {
		_.writeCacheToDisk();
	}
	try {
		livecache = fs.readFileSync('reaction_live.json', 'utf8');
	}
	catch(err) {
		console.error('error while reading reaction_live.json:\n',err);
		//reject(err);
	}
	try {
		livecache = JSON.parse(livecache);
	}
	catch(err) {
		console.error('error while parsing reaction_live.json:\n',err);
		//reject(err);
	}
	for(let i in livecache) {
		livecache[i].type = 'voice';
	}
};
_.refreshQueueCache = () => {
	if(!fs.existsSync('reaction_queue.json')) {
		_.writeQueueCacheToDisk();
	}
	try {
		queuecache = fs.readFileSync('reaction_queue.json', 'utf8');
	}
	catch(err) {
		console.error('error while reading reaction_live.json:\n',err);
		//reject(err);
	}
	try {
		queuecache = JSON.parse(queuecache);
	}
	catch(err) {
		console.error('error while parsing reaction_live.json:\n',err);
		//reject(err);
	}
	for(let i in queuecache) {
		queuecache[i].type = 'voice';
	}
};

_.writeCacheToDisk = () => {
	try {
		fs.writeFileSync('reaction_live.json', JSON.stringify(livecache));
	}
	catch(err) {
		console.error('error while writing reaction_live.json:\n',err);
		//reject(err);
	}
};
_.writeQueueCacheToDisk = () => {
	try {
		fs.writeFileSync('reaction_queue.json', JSON.stringify(queuecache));
	}
	catch(err) {
		console.error('error while writing reaction_live.json:\n',err);
		//reject(err);
	}
};


//actually load on require()
_.refreshCache();
_.refreshQueueCache();

module.exports = _;
