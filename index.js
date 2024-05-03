import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

import './cronRestartScript.js'
// import sendVideo from './telegram.js'
// import { uploadFileToDrive } from './googledrive.js';
// import saveOnOnedrive from './rclone/onedrive.js'
// import sendFile from './rclone-onedrive.js'
import uploadFile from './onedrive.js'

const segmentTimeSize = 300
const uploadLoop = 10000
const url = 'rtsp://suaHostRTSP'
const folderPath = './';
let processedFiles = [];

fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Erro ao ler a pasta:', err);
        return;
    }

    files.forEach((file) => {
        if (path.extname(file) === '.mp4') {
            fs.unlink(path.join(folderPath, file), (err) => {
                if (err) {
                    console.error('Erro ao remover o arquivo:', err);
                } else {
                    console.log(`Arquivo ${file} removido com sucesso.`);
                }
            });
        }
    });
});

ffmpeg(url)
    .inputOptions([
        '-rtsp_transport tcp'
    ])
    .outputOptions([
        '-c:v copy',
        '-c:a aac',
        '-b:v 2M',
        '-f segment',
        '-segment_time ' + segmentTimeSize,
        '-segment_wrap 5',
        '-reset_timestamps 1'
    ])
    .output('output_%03d.mp4')
    .on('start', function (commandLine) {
        console.log('Streaming started:', commandLine);
    })
    .on('error', function (err, stdout, stderr) {
        console.error('An error occurred:', err.message);
        console.error('stdout:', stdout);
        console.error('stderr:', stderr);
        process.exit();
    })
    .on("end", () => {
        console.log("FFMPEG end ⚠️");
        process.exit();
    })
    .run();


function getFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function getMP4Files() {

    const files = fs.readdirSync(folderPath);

    let mp4Files = files.map(file => {
        if (!file.includes(".mp4")) return;
        if (fs.lstatSync(file).isDirectory()) return;

        const filePath = path.join(folderPath, file);
        const fileHash = getFileHash(filePath);
        return { file: file, hash: fileHash }
    });

    mp4Files = mp4Files.filter(f => f)

    // organiza os arquivos de acordo com o Date de modificação, do mais novo para o mais antigo
    mp4Files.sort((a, b) => {
        const aStats = fs.statSync(path.join(folderPath, a.file));
        const bStats = fs.statSync(path.join(folderPath, b.file));
        return bStats.mtimeMs - aStats.mtimeMs;
    });

    return mp4Files;
}

setInterval(async () => {

    let mp4Files = getMP4Files();
    if (mp4Files.length < 2) return
    mp4Files = mp4Files.filter(file => file.file.includes("output"))
    let files = mp4Files.slice(1)
    for (let file of files) {
        processedFiles = [... new Set(processedFiles)]
        if (!processedFiles.includes(file.hash)) {
            console.log("--> upando", file.file)
            // sendVideo(file.file)
            // uploadFileToDrive(file.file)
            // saveOnOnedrive(file.file)
            // sendFile(file.file)
            uploadFile(file.file)
            processedFiles.push(file.hash)
        }
    }

    // codigo que evita que o array de arquivos processados cresca indefinidamete, caso chegue em 100 items, ele remove os 50 primeiros
    if (processedFiles.length >= 100) {
        console.log('==> limpando array')
        processedFiles = processedFiles.slice(50)
    }

}, uploadLoop);
