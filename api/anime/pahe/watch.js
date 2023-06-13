const express = require('express');
const puppeteer = require('puppeteer-extra');

const { mainChecker } = require('../../../util/source');

// Add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const Adblocker = AdblockerPlugin({
  blockTrackers: true, // default: false
});
puppeteer.use(Adblocker);

const router = express.Router();

router.get('/:id/:requestedEp', async (req, res) => {
  try {
    const { id, requestedEp } = req.params;

    if (!id || !requestedEp) {
      return res.status(400).json({ error: 'Anime ID and episode ID are required' });
    }

    const searchUrl = `https://animepahe.ru/anime/${encodeURIComponent(id)}`;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();

    // Get list of episodes
    await page.goto(searchUrl);

    await page.waitForSelector('.episode');

    const episodeID = await page.evaluate(() => {
      return document.querySelector('.play').getAttribute('href').split('/').pop();
    });

    await page.goto(`https://animepahe.ru/play/${encodeURIComponent(id)}/${encodeURIComponent(episodeID)}`);

    // Scrape the website for episode links
    const episodeLinks = await page.evaluate(() => {
      const dropdownMenu = document.querySelector('.dropdown-menu div');
      const anchorElements = dropdownMenu.querySelectorAll('a');
      const links = Array.from(anchorElements).map((anchor) => {
        const text = anchor.textContent.trim();
        const episodeNumber = Number(text.replace('Episode ', ''));
        return { episodeNumber, href: anchor.href };
      });
      return links;
    });

    const episodeData = episodeLinks.find((link) => link.episodeNumber == requestedEp);

    if (!episodeData) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    const result = await mainChecker(episodeData.href);

    await browser.close();

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Source not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while scraping the website' });
  }
});

module.exports = router;
