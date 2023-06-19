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
    const searchUrl = `https://pahe.li/?s=${encodeURIComponent(keyword)}`;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(searchUrl);

    const data = await page.evaluate(() => {
      const movieList = Array.from(document.querySelectorAll('.timeline-contents ul'));
      return movieList.map((movie) => ({
        title: movie.querySelector('.post-box-title a').textContent.trim(),
        url: movie.querySelector('.post-box-title a').getAttribute('href'),
        id: movie.querySelector('.post-box-title a').getAttribute('href').split('/').at(-2),
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
