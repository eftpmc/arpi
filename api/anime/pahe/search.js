const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const API_URL = `https://animepahe.ru/api?m=search&q=${encodeURIComponent(keyword)}`;

    const response = await axios.get(API_URL);

    const { data } = response.data;

    const searchResults = data.map((anime) => ({
      title: anime.title || 'No Title',
      img: anime.poster || '',
      url: `https://animepahe.ru/anime/${anime.session}`,
      id: anime.session || '',
    }));

    res.json(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching search results' });
  }
});

module.exports = router;
