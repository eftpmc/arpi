const express = require('express');
const puppeteer = require('puppeteer');

const router = express.Router();

router.get('/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const searchUrl = `https://gotaku1.com/search.html?keyword=${encodeURIComponent(keyword)}`;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(searchUrl);

    const data = await page.evaluate(() => {
      const animeList = Array.from(document.querySelectorAll('.listing.items li'));
      return animeList.map((anime) => ({
        title: anime.querySelector('.name').textContent.trim(),
        url: `https://gotaku1.com${anime.querySelector('.video-block a').getAttribute('href')}`,
        id: anime.querySelector('.video-block a').getAttribute('href').split('/').pop(),
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
