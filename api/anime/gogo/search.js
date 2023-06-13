const express = require('express');
const puppeteer = require('puppeteer');

const router = express.Router();

router.get('/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const searchUrl = `https://gogoanime.hu/search.html?keyword=${encodeURIComponent(keyword)}`;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(searchUrl);

    const data = await page.evaluate(() => {
      const animeList = Array.from(document.querySelectorAll('.items li'));
      return animeList.map((anime) => ({
        title: anime.querySelector('.name a').textContent.trim(),
        url: `https://gogoanime.hu/${anime.querySelector('.name a').getAttribute('href').replace(/^\/category\//, '')}-episode-1`,
        id: anime.querySelector('.name a').getAttribute('href').replace(/^\/category\//, ''),
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
