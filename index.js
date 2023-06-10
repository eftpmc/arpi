const express = require('express');
const { executablePath: puppeteerExecutablePath } = require("puppeteer");

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define your routes and handlers here
app.get('/', async (req, res) => res.send("<h1>api 😾</h1>"));

app.get('/api/zoro/search/:keyword', async (req, res) => {
    try {
      const { keyword } = req.params;
      const searchUrl = `https://zoro.to/search?keyword=${encodeURIComponent(keyword)}`;
  
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        executablePath: puppeteerExecutablePath(),
      });
      
      const page = await browser.newPage();
      await page.goto(searchUrl);
  
      // Your web scraping logic here
      const data = await page.evaluate(() => {
        // Extract the necessary information from the page
        const animeList = Array.from(document.querySelectorAll('.flw-item'));
        return animeList.map((anime) => ({
          title: anime.querySelector('.film-name a').textContent.trim(),
          image: anime.querySelector('.film-poster img').getAttribute('src'),
          url: anime.querySelector('.film-name a').getAttribute('href'),
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
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));
