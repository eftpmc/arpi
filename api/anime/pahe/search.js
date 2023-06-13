const express = require('express');
const puppeteer = require('puppeteer');

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
