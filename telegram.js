import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs'

const token = '';
const channelID = -100 // deve ser Integer com sinal - na frente

const bot = new TelegramBot(token, { polling: true });

export default async function SendVideo(path) {
    try {
        let file = fs.createReadStream(path)
        await bot.sendVideo(channelID, file)
    } catch (error) {
        console.log('Erro ao enviar video', path, error.message)
    }
}
