/**
 * Shove sounds into a JSON file
 * For use with MIDI.js and anything else that likes SoundFonts
 */

const fs = require('fs')
const base64 = require('base64-stream')
const progressStream = require('progress-stream')
const accum = require('accum')
const objzip = require('objzip')

const Debug = require('debug')
const debug = Debug('ShoveSound')

function packSound(path, onProgress) {
	debug('packSound: %s', path)
	return new Promise(function(resolve, reject) {
		if(!fs.existsSync(path)) {
			debug('I was given a path to a file that does not exist: %s', path)
			return reject(`The file ${path} does not exist or is not accessible.`)
		}

		const pStream = progressStream({
			time: 10
		})
		pStream.on('progress', onProgress)

		fs.createReadStream(path)
			.pipe(pStream)
			.pipe(base64.encode())
			.pipe(accum(function(encodedSound) {
				resolve(`data:audio/mp3;base64,${encodedSound}`)
			}))
	})
}

module.exports = {
	from (map) {
		debug('from: %o', map)
		const notes = Object.keys(map)
		return Promise
			.all(notes.map(note => packSound(map[note])))
			.then(convertedSounds => objzip(notes, convertedSounds))
	},

	packSound
}