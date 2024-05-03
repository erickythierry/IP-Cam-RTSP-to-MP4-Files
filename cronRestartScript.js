import cron from 'node-cron';

let start = Date.now()

function reboot() {
    let now = Date.now()

    // verifica se o tempo em execução é superior a 20min
    if ((now - start) > 1200000) {
        console.log("reiniciando...")
        process.exit()
    }
}
cron.schedule('* * * * *', reboot);