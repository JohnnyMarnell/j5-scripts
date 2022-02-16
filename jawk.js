#!/usr/bin/env node

/**
 * To Do features:
 *   ✅ Emulate begin and end
 *   ✅ Support different field separators
 *   ✅ Handle basic print line use case
 *   ✅ Add NR, NF
 *   ✅ Add lib access like moment
 *   ⬜️ Support '/regEx/ {}' skyntax
 *   ⬜️ Support '/fromRegEx/,/toRegEx/ {}' skyntax
 */

const moment = require('moment')
const readline = require('readline').createInterface({input:process.stdin})

const argv = Object.assign({
        fs: '\\s+'
    }, require('minimist')(process.argv.slice(2)))
const ctx = {}

if (argv.begin) {
    eval(`${argv.begin}`)
}

let lineHandlerParsed
if (argv._.length >= 1) {
    let src = argv._[argv._.length - 1]
    src = src.replace(/\$(\d+)/ig, "__$[$1]")
    lineHandlerParsed = eval(`
        function lineHandler(__$, NR, NF, ctx, moment) {
            return ( ${src} );
        };
        lineHandler
    `)
    argv.fs = new RegExp(argv.fs)
    let NR = 0
    readline.on('line', line => {
        const __$ = [line, ...(line.split(argv.fs))]
        const NF = __$.length
        NR++
        const result = lineHandlerParsed(__$, NR, NF, ctx, moment)
        console.log(Array.isArray(result) ? result.join(' ') : result)
    })
}

readline.on('close', () => {
    if (argv.end) {
        eval(`${argv.end}`)
    }
    if (argv.begin || argv.end) {
        console.log(ctx)
    }
})