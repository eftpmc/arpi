const express = require('express');
const puppeteer = require('puppeteer-extra');

// Add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const Adblocker = AdblockerPlugin({
  blockTrackers: true, // default: false
});
puppeteer.use(Adblocker);

const router = express.Router();

router.get('/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const BASE_URL = "https://animepahe.ru/";

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(BASE_URL);

    await page.setViewport({
      width: 1080,
      height: 720,
    });

    await page.waitForSelector('.navbar');

    await page.type('input[name=q]', keyword, { delay: 20 });

    await page.waitForSelector('.search-results');

    const data = await page.evaluate(() => {
      const animeList = Array.from(document.querySelectorAll('.search-results li'));
      return animeList.map((anime) => ({
        title: anime.querySelector('.result-title')?.textContent?.trim() || 'No Title',
        url: `https://animepahe.ru${anime.querySelector('a')?.getAttribute('href') || ''}`,
        id: anime.querySelector('a')?.getAttribute('href')?.split('/').pop() || '',
      }));
    });

    await browser.close();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while scraping the website' });
  }
});

module.exports = router;
