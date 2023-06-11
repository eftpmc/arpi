const puppeteer = require('puppeteer-extra');
const path = require('path');
const webdriver = require('selenium-webdriver');
require('chromedriver');
const chrome = require('selenium-webdriver/chrome');

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
        console.log(source);
        return await scrapeStreamsb(source);
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

const scrapeStreamsb = async (url) => {
    let options = new chrome.Options();
    options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH);
    let serviceBuilder = new chrome.ServiceBuilder(process.env.CHROME_DRIVER_PATH);
    
    //Don't forget to add these for heroku
    options.addArguments("--headless");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
  

    let driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .setChromeService(serviceBuilder)
        .build();

    await driver.get(url);

    const html = await driver.getPageSource();

    await driver.quit();

    return html;
};

module.exports = {
    mainChecker,
    scrapeMp4upload
};