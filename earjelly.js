const Debug = require('debug')
const debug = Debug('earjelly:/earjelly.js')

const fs = require('fs')
const validator = require('validator')
const Readable = require('stream').Readable

const base64 = require('base64-stream')
const accum = require('accum')
const objzip = require('objzip')

/**
 * @typedef {Object} EarJelly
 */

/**
 * @typedef {Object} EarJelly.note
 * @property {string} noteData - The contents of a note
 */

function transform(noteContents) {
	if (validator.isBase64(noteContents))
		return Promise.resolve(noteContents)

	if (validator.isDataURI(noteContents))
		return new Promise((resolve, reject) => {
			const inStream = new Readable()
			inStream
				.pipe(base64.encode())
				.pipe(accum(buffer => resolve(buffer.toString('utf-8'))))
				.on('error', reject)

			inStream.push(noteContents)
		})

	return new Promise((resolve, reject) =>
		fs.createReadStream(noteContents)
			.pipe(base64.encode())
			.pipe(accum(buffer => resolve(buffer.toString('utf-8'))))
			.on('error', reject))
}

/**
 * Pack a note so that it confroms with the EarJelly V1 spec
 * @param {string|Object} note - The contents of a note. If the contents are a
 *   string, it'll be packed according to the EarJelly V1 spec. If it's an
 *   object, I assume it conforms.
 * @returns {Promise<EarJelly.note>}
 */
function packNote(note) {
	switch (typeof note) {
		case 'undefined':
			debug('Unable to pack an undefined note!')
			return Promise.reject()
		case 'string':
			debug('Packing a note: %s', note)
			return transform(note).then(noteData => ({noteData}))
		case 'object':
		default:
			debug('Packing a note: %j', note)
			return packNote(note.noteData)
				.then(newNote => Object.assign({}, note, newNote))
	}
}

module.exports = {
	from (earfile) {
		const noteKeys = Object.keys(earfile)
		return Promise
			.all(noteKeys.map(noteKey => packNote(earfile[noteKey])))
			.then(convertedSounds => objzip(noteKeys, convertedSounds))
			.then(newEarfile => JSON.stringify(newEarfile))
	},

	packNote,
	transform
}