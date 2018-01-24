// QueryResolver.js

const Reactions = require('./Reactions');
const _ = {};


_.search = (query) => {
    return new Promise((resolve, reject) => {
		let results = [];
        for(let i in Reactions) {
            if(Reactions[i].title.includes(query)) {
                results.push(Reactions[i]);
            }
        }
        resolve(results.slice(0,20)) //this is safe because Array.slice() can't go out of bounds (even with negative numbers)
	});
};


module.exports = _;
