const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define your routes and handlers here
app.get('/', async (req, res) => res.send("<h1>api 😾</h1>"));

app.get('/api/gogo/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const searchUrl = `https://gogoanime.hu/search.html?keyword=${encodeURIComponent(keyword)}`;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(searchUrl);

    // Your web scraping logic here
    const data = await page.evaluate(() => {
      // Extract the necessary information from the page
      const animeList = Array.from(document.querySelectorAll('.items li'));
      return animeList.map((anime) => ({
        url: `https://gogoanime.hu${anime.querySelector('.name a').getAttribute('href')}`,
        title: anime.querySelector('.name a').textContent.trim(),
      }));
    });

    await browser.close();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while scraping the website' });
  }
});

// Start the server
app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
