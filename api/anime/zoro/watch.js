const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cryptoJs = require('crypto-js')

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }
  
      const API_URL = `https://zoro.to/ajax/v2/episode/sources?id=${id}`;
  
      const response = await axios.get(API_URL);
  
      const { link } = response.data;
      const refererLink = new URL(link); 
      const fileId = link.split('/').pop().split('?')[0]

      const options = {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': refererLink.href,
        },
    };

      const { data } = await axios.get(`https://rapid-cloud.co/ajax/embed-6/getSources?id=${fileId}`,options);
      const key = await (await axios.get('https://raw.githubusercontent.com/enimax-anime/key/e6/key.txt')).data;
        
      source = JSON.parse(cryptoJs.AES.decrypt(data.sources, key).toString(cryptoJs.enc.Utf8));
      const file = source[0].file;

      res.json({ file });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching episode links' });
    }
  });
  

module.exports = router;
