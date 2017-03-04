#!/usr/bin/env node

const Debug = require('debug')
const debug = Debug('earjelly:/earjelly.bin.js')
debug('Howdy! Happy to be here!')

const earjelly = require('./earjelly')

const fs = require('fs')
const path = require('path')

const YARGS = require('yargs')
const argv = YARGS.usage('Usage: $0 <INPUT>').help().argv

const [rawSource] = argv._
const source = path.resolve(path.normalize(rawSource))

if (!fs.existsSync(source)) {
	error(`I cannot read from ${rawSource}! Try again.`)
	process.exit(1)
}

try {
	debug('I am going to read: %s', source)
	const earfile = JSON.parse(fs.readFileSync(source))

	const workingDirectory = path.dirname(source)
	debug('I am changing the CWD: %s', workingDirectory)
	process.chdir(workingDirectory)

	earjelly
		.from(earfile)
		.then(console.log.bind(console))
		.catch(error => console.error(error))

} catch (message) {
	error(message)
	process.exit(1)
}