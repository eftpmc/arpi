const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

router.get('/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const API_URL = `https://gogoanime.hu/search.html?keyword=${encodeURIComponent(keyword)}`;

    const response = await axios.get(API_URL);
    const $ = cheerio.load(response.data);

    const searchResults = [];

    $('.items li').each((index, element) => {
      const $item = $(element);
      const title = $item.find('.name a').text().trim();
      const img = $item.find('.img a img').attr('src');
      const url = `https://gogoanime.hu${$item.find('.name a').attr('href')}`;
      const id = url.split("/").pop();

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
