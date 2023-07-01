const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

router.get('/:keyword', async (req, res) => {
    try {
        const { keyword } = req.params;
        const URL = `https://www.webnovel.com/search?keywords=${encodeURIComponent(keyword)}`;

        const response = await axios.get(URL);
        const $ = cheerio.load(response.data);

        const searchResults = [];

        $('li.pr.pb20.mb12').each((index, element) => {
            const title = $(element).find('h3.mb8.g_h3.fs20.lh24.fw700.pl1.ell > a').text();
            const url = 'https://www.webnovel.com' + $(element).find('a.g_thumb._xs.pa.l0.oh').attr('href');
            const id = url.split('/').pop();
            const imageUrl = $(element).find('a.g_thumb._xs.pa.l0.oh > img').attr('src');

            searchResults.push({ title, url, id, imageUrl });
        });


        res.json(searchResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching search results from WebNovel' });
    }
});

module.exports = router;
