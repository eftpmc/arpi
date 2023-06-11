const puppeteer = require('puppeteer-extra');

// Add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const Adblocker = AdblockerPlugin({
    blockTrackers: true // default: false
});
puppeteer.use(Adblocker);

const mainChecker = async (source) => {
    if (source && source.includes("mp4upload.com")) {
        return await scrapeMp4upload(source);
    } else if (source && source.includes("sbani.pro")) {
        return null
    } else {
        return null
    }
}

// Utility function to perform web scraping and extract video source from mp4upload
const scrapeMp4upload = async (url) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url);

    await page.waitForSelector('.vjs-tech');

    const videoSource = await page.evaluate(() => {
        const videoElement = document.querySelector('video.vjs-tech');
        return videoElement ? videoElement.getAttribute('src') : null;
    });

    await browser.close();

    return videoSource;
};

module.exports = {
    mainChecker,
    scrapeMp4upload
};