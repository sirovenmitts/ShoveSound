const fs = require('fs')
const ShoveSound = require('./ShoveSound')

const Debug = require('debug')
const debug = Debug('ShoveSound.test')

ShoveSound.from({
	'A0': './test/Balloon_Tool.mp3',
	'A1': './test/Brushes.mp3',
	'A2': './test/Click.mp3'
}).then(function(packedSounds) {
	const outPath = './test/output.json'
	debug('%s sounds written to %s', Object.keys(packedSounds).length, outPath)
	fs.writeFileSync(outPath, JSON.stringify(packedSounds, null, '\t'))
}).catch(function(error) {
	debug('An error occurred! %o', error)
})