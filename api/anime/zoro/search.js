const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

/**
 * @swagger
 * /api/anime/zoro/search/{keyword}:
 *   get:
 *     tags:
 *       - Anime
 *     description: Search for anime on zoro.to by keyword
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: keyword
 *         description: The keyword to search for
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: An array of search results
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the anime
 *               img:
 *                 type: string
 *                 description: The URL of the anime's image
 *               url:
 *                 type: string
 *                 description: The URL of the anime's page
 *               id:
 *                 type: string
 *                 description: The ID of the anime
 *       500:
 *         description: An error occurred while fetching search results
 */

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
