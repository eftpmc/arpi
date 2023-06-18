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
    const searchUrl = `https://ww8.0123movie.net/search.html?q=${encodeURIComponent(keyword)}`;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: false,
    });

    const page = await browser.newPage();
    await page.goto(searchUrl);

    const data = await page.evaluate(() => {
      const movieList = Array.from(document.querySelectorAll('.row.list-movie .col'));
      return movieList.map((movie) => ({
        title: movie.querySelector('.card-title').textContent.trim(),
        url: `https://ww8.0123movie.net${movie.querySelector('.poster').getAttribute('href')}`,
        id: movie.querySelector('.poster').getAttribute('href').split('/').pop(),
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
