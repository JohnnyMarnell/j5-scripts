#!/usr/bin/env npx zx

import 'zx/globals'

/* Grab and transcode from GoPro */
async function xcode() {
    const TWO_SIX_FIVE_DAMN_GIRL_FINE = 'libx265'

    let name = argv._[0]
    argv = {
        crf: 30,
        codec: TWO_SIX_FIVE_DAMN_GIRL_FINE,
        scale: 1,
        ...argv
    }
    let vidChain = []
    let extraOpts = []

    if (argv.codec === TWO_SIX_FIVE_DAMN_GIRL_FINE) {
        extraOpts = extraOpts.concat(['-tag:v', 'hvc1']) // make it play nice with iOS
    }
    if (argv.fps) {
        extraOpts = extraOpts.concat(['-r', argv.fps])
    }
    if (argv.from) {
        extraOpts = extraOpts.concat(['-ss', argv.from])
    }
    if (argv.to) {
        extraOpts = extraOpts.concat(['-to', argv.to])
    }

    let paths = [`${argv.dir || '/Volumes/*/DCIM'}/*/*${argv.include || ''}*`]
    if (argv.exclude) {
        paths.push(`!/**/*${argv.exclude}*`)
    }
    let src = await globby(paths)
    src = src.slice(0, argv.limit || src.length)
    
    let probe = await $`ffprobe -print_format json -show_error -show_format -show_streams ${src[0]} 2> /dev/null`
    probe = JSON.parse(probe)
    let vidStream = probe.streams.filter(s => s.height)[0]
    if (argv['1080p'] || argv['720p']) {
        argv.scale = Math.max(1, vidStream.height / (argv['1080p'] ? 1080 : 720))
    }
    if (argv.scale !== 1) {
        vidChain.push(`scale=iw/${argv.scale}:ih/${argv.scale}`)
    }
    if (vidChain.length) {
        extraOpts = extraOpts.concat(['-vf', vidChain.join(',')])
    }
    let title = `${name}_${argv.codec}_crf_${argv.crf}_scale_${argv.scale}_fps_${argv.fps || 'keep'}`
    let dir = `${process.env.HOME}/tmp/xcode_pre_upload/${title}`
    
    await $`mkdir -p ${dir}`
    src.forEach(async srcFile => {
        const fname = path.basename(srcFile, path.extname(srcFile))
        await $`yes | ffmpeg -i ${srcFile} -vcodec ${argv.codec} -crf ${argv.crf} \
                ${extraOpts} ${dir}/${name}_${fname}.mp4 `
    })
    console.log('Processed', dir, src)
}

const cli = argv._[1] ; argv._ = argv._.slice(2)
eval(`(async () => { await ${cli}() ; console.log(argv) })() `)

/* ffmpeg options --with-fdk-aac --with-jack --with-librsvg --with-libsoxr --with-libxml2 --with-openh264 --with-openjpeg \
--with-rtmpdump --with-two-lame --with-webp --with-xvid --with-zimg */