// QueryResolver.js

const ReactionLoader = require('./ReactionLoader');
const _ = {};


_.search = (query) => {
    return new Promise((resolve, reject) => {
		let results = [];
        for(let i in ReactionLoader.getLiveCache()) {
            if(ReactionLoader.getLiveCache()[i].title.toLowerCase().includes(query.toLowerCase())) {
                results.push(ReactionLoader.getLiveCache()[i]);
            }
        }
        resolve(results.slice(0,20)) //this is safe because Array.slice() can't go out of bounds (even with negative numbers)
	});
};


module.exports = _;
