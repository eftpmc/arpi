const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

router.get('/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const API_URL = `https://aniwatch.to/ajax/search/suggest?keyword=${encodeURIComponent(keyword)}`;

    const response = await axios.get(API_URL, {
      headers: {
        'Referer': 'https://aniwatch.to/',
      }
    });

    if (response.data.status) {
      const $ = cheerio.load(response.data.html);

      const searchResults = [];

      $('.nav-item').each((index, element) => {
        const $item = $(element);
        const title = $item.find('.film-name').text().trim();
        const img = $item.find('.film-poster img').attr('data-src');
        const href = $item.attr('href');
        const url = `https://aniwatch.to${href}`;
        const id = href ? href.split('-').pop().split('?')[0] : '';

        searchResults.push({
          title: title || 'No Title',
          img: img || '',
          url,
          id
        });
      });

      res.json(searchResults);
    } else {
      res.json({ error: 'No results found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching search results' });
  }
});

module.exports = router;
