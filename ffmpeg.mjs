#!/usr/bin/env npx zx

import 'zx/globals'

/* Grab and transcode from GoPro / devices */
async function xcode() {
    const TWO_SIX_FIVE_DAMN_GIRL_FINE = 'libx265'

    const name = argv._[0], opts = [], height = argv['1080p'] ? 1080 : argv['720p'] ? 720 : null,
            paths = [`${argv.dir || '/Volumes/*/DCIM'}/*/*${argv.include || ''}*`]
    argv = {
        crf: 30,
        codec: TWO_SIX_FIVE_DAMN_GIRL_FINE,
        scale: 1,
        ...argv
    }

    if (argv.codec === TWO_SIX_FIVE_DAMN_GIRL_FINE) opts.push(`-tag:v hvc1`)
    if (argv.fps) opts.push(`-r ${argv.fps}`)
    if (argv.from) opts.push(`-ss ${argv.from}`)
    if (argv.to) opts.push(`-to ${argv.to}`)
    if (argv.exclude) paths.push(`!/**/*${argv.exclude}*`)

    const src = await globby(paths)
        .then(r => $`ls -1S ${r} | tail -n${argv.limit || '+0'}`)
        .then(r => r.toString().trim().split('\n'))
    
    const title = [`${name}_${argv.codec}_crf_${argv.crf}`,
        height && `${height}p`,
        argv.scale !== 1 && `scale_${argv.scale.toFixed(2)}`,
        argv.fps && `fps_${argv.fps}`].filter(r => r).join('_')
    const dir = `${process.env.HOME}/tmp/xcode_pre_upload/${title}`
    await $`mkdir -p ${dir}`
    console.log('Processing', dir, src)
    for (const srcFile of src) {
        const vidChain = [], fname = path.basename(srcFile, path.extname(srcFile)),
              probe = await $`ffprobe -print_format json -show_error -show_format \
                    -show_streams ${src[0]} 2> /dev/null`.then(json => JSON.parse(json))
        let scale = argv.scale, vidStream = probe.streams.filter(s => s.height)[0]
        if (height) scale = Math.min(1, height / Math.min(vidStream.height, vidStream.width))
        if (argv.scale !== 1) vidChain.push(`scale=iw*${scale}:ih*${scale}`)
        if (vidChain.length) opts.push(`-vf ${vidChain.join(',')}`)
        await $`ffmpeg -y -i ${srcFile} -vcodec ${argv.codec} -crf ${argv.crf} \
                ${opts.flatMap(o => o.split(' '))} ${dir}/${name}_${fname}.mp4`
    }
}

// todo: better-ify this
let cli = argv._[1] ; argv._ = argv._.slice(2)
if (cli === 'xcode') {
    await xcode()
}

/* ffmpeg options --with-fdk-aac --with-jack --with-librsvg --with-libsoxr --with-libxml2 --with-openh264 --with-openjpeg \
--with-rtmpdump --with-two-lame --with-webp --with-xvid --with-zimg */