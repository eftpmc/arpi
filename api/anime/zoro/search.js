const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

router.get('/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const API_URL = `https://zoro.to/search?keyword=${encodeURIComponent(keyword)}`;

    const response = await axios.get(API_URL);
    const $ = cheerio.load(response.data);

    const searchResults = [];

    $('.film_list-wrap .flw-item').each((index, element) => {
      const $item = $(element);
      const title = $item.find('.film-name a').text().trim();
      const img = $item.find('.film-poster img').attr('data-src');
      const url = `https://gogoanime.hu${$item.find('.film-name a').attr('href')}`;
      const id = $item.find('.film-name a').attr('href').split('/').pop().split('?')[0].split('-').pop();

      searchResults.push({
        title: title || 'No Title',
        img: img || '',
        url,
        id,
      });
    });

    res.json(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching search results' });
  }
});

module.exports = router;
