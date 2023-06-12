const puppeteer = require('puppeteer-extra');

const webdriver = require('selenium-webdriver');
require('chromedriver');
const chrome = require('selenium-webdriver/chrome');

// Add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const Adblocker = AdblockerPlugin({
    blockTrackers: true, // default: false
});
puppeteer.use(Adblocker);

const mainChecker = async (source) => {
    try {
        if (source && source.includes("animepahe.ru")) {
            return await scrapePahe(source);
        } else if (source && source.includes("gotaku1.com")) {
            return await scrapeGotaku(source);
        } else if (source && source.includes("mp4upload.com")) {
            return await scrapeMp4upload(source);
        } else if (source && source.includes("sbani.pro")) {
            console.log(source);
            return await scrapeStreamsb(source);
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

const scrapeGotaku = async (url) => {
    try {
        let options = new chrome.Options();
        options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH);
        let serviceBuilder = new chrome.ServiceBuilder(process.env.CHROME_DRIVER_PATH);

        // Don't forget to add these for Heroku
        //options.addArguments("--headless");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-blink-features=AutomationControlled")
        options.setUserPreferences({ devtools: false });

        let driver = new webdriver.Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .setChromeService(serviceBuilder)
            .build();

        await driver.get(url);

        // Inject a script to override the `navigator.webdriver` property
        await driver.executeScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        const requests = await driver.executeScript(() => {
            const performanceEntries = window.performance.getEntriesByType('resource');
            return performanceEntries.map((entry) => entry.name);
        });

        const filteredUrls = requests.filter((request) => request.includes('main.bilucdn.com') && request.length > 20);

        await driver.quit();

        return filteredUrls;
    } catch (error) {
        console.error(error);
        return null;
    }
};

// Utility function to perform web scraping and extract video source from mp4upload
const scrapeMp4upload = async (url) => {
    try {
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
    } catch (error) {
        console.error(error);
        return null;
    }
};

const scrapePahe = async (url) => {
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
        });

        const page = await browser.newPage();
        await page.goto(url);

        await page.click(".click-to-load");

        // Wait for a delay after the click (adjust the milliseconds as needed)
        await page.waitForTimeout(1000);

        // Intercept network requests
        await page.setRequestInterception(true);

        const networkLogs = [];

        page.on('request', (request) => {
            const url = request.url();
            if (url.includes('.m3u8')) {
                networkLogs.push(url);
            }
            request.continue();
        });

        // Wait for a delay to capture the network requests (adjust the milliseconds as needed)
        await page.waitForTimeout(2000);

        await browser.close();

        const modifiedNetworkLogs = networkLogs.map((url) => url.replace('cache', 'files'));

        return modifiedNetworkLogs;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const scrapeStreamsb = async (url) => {
    try {
        let options = new chrome.Options();
        options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH);
        let serviceBuilder = new chrome.ServiceBuilder(process.env.CHROME_DRIVER_PATH);

        // Don't forget to add these for Heroku
        options.addArguments("--headless");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");

        let driver = new webdriver.Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .setChromeService(serviceBuilder)
            .build();

        await driver.get(url);

        const requests = await driver.executeScript(() => {
            const performanceEntries = window.performance.getEntriesByType('resource');
            return performanceEntries.map((entry) => entry.name);
        });

        const regexPattern = /https:\/\/sbani\.pro\/[0-9a-f]{32,}\/[0-9a-f]{32,}/;
        let filteredUrl = null;

        for (const request of requests) {
            if (regexPattern.test(request)) {
                filteredUrl = request;
                break;
            }
        }

        if (filteredUrl) {
            fetch(filteredUrl)
                .then((data) => {
                    return data.json();
                })
                .then((res) => {
                    console.log(res);
                });

            await driver.quit();
        }

        await driver.quit();

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
};

module.exports = {
    mainChecker
};
