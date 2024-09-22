const fs = require('fs');
const { resolve } = require('path');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const Events = require('events');
const applyFilter = require('./filters');
const emmiter = new Events();

const server = (PORT, file) =>
{
    const htmlApp = fs.readFileSync(resolve(__dirname, 'index.html'), 'utf-8');
    const filePath = resolve(process.cwd(), file);
    const outputDir = resolve(process.cwd(), 'frames');

    
    const serverApp = express();

    serverApp.use('/video', express.static(filePath));
    serverApp.use(express.json());
    serverApp.get('/editor', async(req, res) => { res.send(htmlApp) });

    serverApp.post('/finish', async(req, res) =>
    {
        console.log(req.body);
        if (!fs.existsSync(outputDir)){ fs.mkdirSync(outputDir) };

        const promises = req.body.map(({ time, screen, filter }, i) => new Promise((resolvePr, rejectPr) =>
        {
            const outputFrame = resolve(outputDir, `${i}.jpg`);

            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                console.error('Error obteniendo metadata del video:', err);
                process.exit();
                }
            
                const videoWidth = metadata.streams[0].width;
                const videoHeight = metadata.streams[0].height;
                const videoDuration = metadata.format.duration;

                if (time > videoDuration) {
                    console.error('El segundo especificado está fuera de la duración del video.');
                    process.exit();
                }
                const x = Math.floor((screen.x / 100) * videoWidth);
                const y = Math.floor((screen.y / 100) * videoHeight);
                let width = Math.floor((screen.width / 100) * videoWidth);
                let height = Math.floor((screen.height / 100) * videoHeight);
                
                width = width % 2 === 0 ? width : width - 1;
                height = height % 2 === 0 ? height : height - 1;
            
                
                ffmpeg(filePath)
                .on('end', () => {
                    console.log(`Frame extraído en: ${outputFrame}`);
                    applyFilter(outputFrame, filter)
                    .then(() =>
                    {
                        resolvePr();
                    })
                    .catch(err => 
                    {
                        rejectPr(err);
                    });
                })
                .on('error', (err) => {
                    console.error(`Error extrayendo frame en ${time}s: ${err.message}`);
                    rejectPr(err);
                })
                .inputOptions('-ss', time)
                .inputOptions('-noaccurate_seek')
                .outputOptions('-vframes', '1')
                .seekInput(time)
                .videoFilter(`crop=${width}:${height}:${x}:${y}`)
                .output(outputFrame)
                .run();
            });
        }));

        await Promise.all(promises);
        emmiter.emit('endServer')
    })

    serverApp.listen(PORT, ()=>
    {
        emmiter.emit('serverReady');
    });

    const onServerReady = callbackfn => emmiter.on('serverReady', callbackfn);
    const onEndServer = callbackfn => emmiter.on('endServer', callbackfn);

    return { onServerReady, onEndServer }
}




module.exports = server;