import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const addZero = (num) => num.toString().padStart(2, '0');

export default async function sendFile(nomeArquivo) {
    return new Promise((resolve, reject) => {
        let processedFilePath = undefined
        try {
            // Verifica se o arquivo existe
            if (!fs.existsSync(nomeArquivo)) {
                return null
            }
            const fileExtension = path.extname(nomeArquivo);

            // Renomeia o arquivo para "processed" mantendo a extensão
            const date = new Date()
            const filename =
                addZero(date.getDate()) +
                '-' +
                addZero(date.getMonth() + 1) +
                '-' +
                date.getFullYear() +
                '_' +
                addZero(date.getHours()) +
                ';' +
                addZero(date.getMinutes()) +
                ';' +
                addZero(date.getSeconds())

            const processedFileName = `${filename + fileExtension}`;
            processedFilePath = path.join(path.dirname(nomeArquivo), processedFileName);
            fs.renameSync(nomeArquivo, processedFilePath);


            const comando = `rclone copy "${processedFilePath}" onedrive:0-ipcam/${addZero(date.getDate())}-${addZero(date.getMonth() + 1)}-${date.getFullYear()}`;

            exec(comando, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao executar o rclone: ${error}`);
                    delFile(processedFilePath)
                    resolve(null);
                } else {
                    delFile(processedFilePath)
                    console.log("sucesso")
                    resolve(true);
                }
            });
        } catch (error) {
            console.log(error)
            delFile(processedFilePath)
            resolve(null)
        }
    });
}

function delFile(file) {
    try {
        fs.unlinkSync(file)
    } catch (error) {
        console.log(error.message)
    }
}