#!/usr/bin/env node

const fs = require('fs')
const ShoveSound = require('./ShoveSound')

const Debug = require('debug')
const debug = Debug('ShoveSound.bin')
debug('Howdy! Happy to be here!')

const YARGS = require('yargs')
const argv = YARGS.usage('Usage: $0 <INPUT> <OUTPUT>').argv
const [source, destination] = argv._

debug('I am going to read: %s', source)
debug('I am going to write to: %s', destination)

const chalk = require('chalk')
const error = function() {
	console.error(chalk.bold.red.apply(chalk, arguments))
}

if(!fs.existsSync(source)) {
	error(`I cannot read from ${source}! Try again.`)
	process.exit(1)
}

if(!fs.existsSync(destination)) {
	error(`I cannot read from ${destination}! Try again.`)
	process.exit(1)
}

const multimeter = require('multimeter')
const multi = multimeter(process)
multi.on('^C', process.exit)
multi.charm.reset()

multi.write('Working...\n\n')
const map = JSON.parse(fs.readFileSync(source))
const jobs = Object.keys(map).map(function(note, i) {
	const path = map[note]
	multi.write(`${path}: `)
	const progressBar = multi(path.length + 3, i + 3)
	const job = ShoveSound.packSound(path, function({percentage}) {
		progressBar.percent(percentage)
	}).then(function(sound) {
		const packet = {}
		packet[note] = sound
		return packet
	})
	multi.write('\n')
	return job
})

Promise.all(jobs).then(function(packets) {
	const joined = Object.assign({}, ...packets)
	fs.writeFileSync(destination, JSON.stringify(joined))
	multi.destroy()
}).catch(function(message) {
	error(message)
	process.exit(1)
})
// ShoveSound.from(map).then(function(packedSounds) {
//
// 	debug('%s sounds written to %s', Object.keys(packedSounds).length, destination)
// 	fs.writeFileSync(destination, JSON.stringify(packedSounds, null, '\t'))
// }).catch(function(error) {
// 	debug('An error occurred! %o', error)
// })

//
// const walker = walk.walk('assets/sounds')
//
// var bars = [];
// var progress = [];
// var deltas = [];
//
// multi.write('Progress:\n\n');
//
// for (var i = 0; i < 5; i++) {
// 	var s = 'ABCDE'[i] + ': \n';
// 	multi.write(s);
//
// 	var bar = multi(s.length, i + 3, {
// 		width : 20,
// 		solid : {
// 			text : '|',
// 			foreground : 'white',
// 			background : 'blue'
// 		},
// 		empty : { text : ' ' },
// 	});
// 	bars.push(bar);
//
// 	deltas[i] = 1 + Math.random() * 9;
// 	progress.push(0);
// }
//
// multi.write('\nbeep boop\n');
//
// var pending = progress.length;
// var iv = setInterval(function () {
// 	progress.forEach(function (p, i) {
// 		progress[i] += Math.random() * deltas[i];
// 		bars[i].percent(progress[i]);
// 		if (p < 100 && progress[i] >= 100) pending --;
// 		if (pending === 0) {
// 			multi.write('\nAll done.\n');
// 			multi.destroy();
// 			clearInterval(iv);
// 			pending --;
// 		}
// 	});
// }, 100);