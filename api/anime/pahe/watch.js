const express = require('express');
const axios = require('axios');
const { js_beautify } = require('js-beautify');

const { mainChecker } = require('../../../util/source');

const router = express.Router();

router.get('/:id/:requestedEp', async (req, res) => {
  try {
    const { id, requestedEp } = req.params;

    if (!id || !requestedEp) {
      return res.status(400).json({ error: 'Anime ID and episode ID are required' });
    }

    const perPage = 30;
    const pageNumber = Math.ceil(requestedEp / perPage); // Calculate the page number

    const searchUrl = `https://animepahe.ru/api?m=release&id=${encodeURIComponent(id)}&sort=episode_asc&page=${pageNumber}`;

    const response = await axios.get(searchUrl);

    const { total, per_page, data } = response.data;

    if (total < requestedEp) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    const episodeData = data.find((episode) => episode.episode == requestedEp);

    if (!episodeData) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    const result = await mainChecker(`https://animepahe.ru/play/${id}/${episodeData.session}`);

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Source not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching episode links' });
  }
});

module.exports = router;
