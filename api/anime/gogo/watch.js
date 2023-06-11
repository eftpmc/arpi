const express = require('express');
const puppeteer = require('puppeteer-extra');
const { mainChecker } = require('../../../util/source');

// Add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const e = require('express');
const Adblocker = AdblockerPlugin({
    blockTrackers: true // default: false
});
puppeteer.use(Adblocker);

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const searchUrl = `https://gogoanime.hu/${encodeURIComponent(id)}`;

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
        });

        const page = await browser.newPage();
        await page.goto(searchUrl);

        await page.waitForSelector('.anime_muti_link');

        const data = await page.evaluate(() => {
            const mp4uploadLi = document.querySelector('li.mp4upload a');
            const mp4uploadData = mp4uploadLi ? mp4uploadLi.getAttribute('data-video') : null;

            const streamsbLi = document.querySelector('li.streamsb a');
            const streamsbData = streamsbLi ? streamsbLi.getAttribute('data-video') : null;

            return mp4uploadData || streamsbData || null;
        });

        await browser.close();

        res.json(await mainChecker(data));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while scraping the website' });
    }
});

module.exports = router;
