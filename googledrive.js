import { createReadStream } from 'fs';
import { google } from 'googleapis';

const KEYFILE = './creds.json';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const addZero = (num) => num.toString().padStart(2, '0');

export const uploadFileToDrive = async (filePath) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEYFILE,
        scopes: SCOPES,
    });

    const drive = google.drive({ version: 'v3', auth });

    const folderID = ''; // ID da pasta no Google Drive

    const date = new Date()
    const filename =
        addZero(date.getDate()) +
        '/' +
        addZero(date.getMonth() + 1) +
        '/' +
        date.getFullYear() +
        '_' +
        addZero(date.getHours()) +
        ':' +
        addZero(date.getMinutes()) +
        ':' +
        addZero(date.getSeconds()) +
        '.mp4';

    const fileMetadata = {
        name: filename,
        parents: [folderID],
    };
    const media = {
        body: createReadStream(filePath),
        mimeType: 'video/mp4',
    };

    try {
        const res = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id,name',
            supportsAllDrives: true,
        });
        console.log('Arquivo enviado com sucesso. nome do arquivo:', res.data.name);
    } catch (err) {
        console.error('Erro ao enviar o arquivo:', err.message);
    }
};
