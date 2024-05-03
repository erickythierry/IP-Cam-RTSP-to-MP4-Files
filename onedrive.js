import { decode } from 'jsonwebtoken';
import oneDriveAPI from "onedrive-api";
import fs from 'fs'
import axios from "axios";

const clientID = ''
const clientSecret = ''
const refreshToken = ""
let token = '' // essa variavel é preenchida automaticamente.
const onedriveFolder = "0-ipcam"

const addZero = (num) => num.toString().padStart(2, '0');

export default async function sendFile(filepath) {
    let atualToken = await getOneDriveToken()

    const date = new Date()
    const folder = `${onedriveFolder}/${addZero(date.getDate())}-${addZero(date.getMonth() + 1)}-${date.getFullYear()}`
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
        addZero(date.getSeconds()) +
        '.mp4';

    try {
        let result = await oneDriveAPI.items
            .uploadSimple({
                accessToken: atualToken,
                filename: filename,
                parentPath: folder,
                readableStream: fs.createReadStream(filepath),
            })

        console.log("sucesso")
        return result
    } catch (error) {
        console.log(error)
    }
}

async function getOneDriveToken() {

    if (token.length > 1) {
        let valido = verificarToken(token)
        if (valido) return token
    }

    const bodyFormData = new FormData();
    bodyFormData.append('client_id', clientID);
    bodyFormData.append('scope', 'files.readwrite.all');
    bodyFormData.append('refresh_token', refreshToken);
    bodyFormData.append('grant_type', "refresh_token");
    bodyFormData.append('client_secret', clientSecret);
    try {
        const response = await axios({
            method: "post",
            url: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token',
            data: bodyFormData,
            headers: { "Content-Type": "multipart/form-data" },
        })
        console.log('atualizando token')
        token = response.data.access_token
        return response.data.access_token
    } catch (error) {
        console.error(error);
    }
}

function verificarToken(token) {
    try {
        const decoded = decode(token);
        const exp = decoded.exp;

        // Obtenha a data atual em segundos
        const now = Math.floor(Date.now() / 1000);

        // Verifique se a data de expiração (exp) ainda não foi ultrapassada
        if (exp > now) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Erro ao decodificar o token:', error.message);
        return false;
    }
}