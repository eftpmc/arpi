const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cryptoJs = require('crypto-js');

const router = express.Router();

router.get('/:id/:ep', async (req, res) => {
  try {
    const { id, ep } = req.params;

    if (!id || !ep) {
      return res.status(400).json({ error: 'ID and episode are required' });
    }

    const API_URL = `https://zoro.to/ajax/v2/episode/list/${id}`;
    const response = await axios.get(API_URL);
    const $ = cheerio.load(response.data.html);
    const episodes = {};

    $('.ssl-item.ep-item').each((index, element) => {
      const $element = $(element);
      const episodeNumber = index + 1;
      const watchLink = $element.attr('href');
      const episodeIdFromLink = watchLink.split('=')[1];

      episodes[episodeNumber] = {
        episodeId: episodeIdFromLink,
        watchLink,
      };
    });

    const episodeId = episodes[ep].episodeId;
    const serversURL = `https://zoro.to/ajax/v2/episode/servers?episodeId=${episodeId}`;
    const serversResponse = await axios.get(serversURL);
    const $servers = cheerio.load(serversResponse.data.html);

    let subDataId;
    let dubDataId;

    $servers('.servers-sub .item[data-type="sub"]').each((index, element) => {
      const $element = $(element);
      const serverName = $element.find('a.btn').text().trim().toLowerCase();
      if (serverName === 'vidcloud') {
        subDataId = $element.data('id');
        return false; // Break the loop
      }
    });

    $servers('.servers-dub .item[data-type="dub"]').each((index, element) => {
      const $element = $(element);
      const serverName = $element.find('a.btn').text().trim().toLowerCase();
      if (serverName === 'vidcloud') {
        dubDataId = $element.data('id');
        return false; // Break the loop
      }
    });

    const sourceUrlSub = `https://zoro.to/ajax/v2/episode/sources?id=${subDataId}`;
    const sourceUrlDub = `https://zoro.to/ajax/v2/episode/sources?id=${dubDataId}`;
    const options = {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://zoro.to/',
      },
    };

    const [responseSub, responseDub] = await Promise.all([
      axios.get(sourceUrlSub, options),
      axios.get(sourceUrlDub, options),
    ]);

    const { link: linkSub } = responseSub.data;
    const { link: linkDub } = responseDub.data;
    const refererLinkSub = new URL(linkSub);
    const refererLinkDub = new URL(linkDub);
    const fileIdSub = linkSub.split('/').pop().split('?')[0];
    const fileIdDub = linkDub.split('/').pop().split('?')[0];

    const optionsSub = { headers: { ...options.headers, Referer: refererLinkSub.href } };
    const optionsDub = { headers: { ...options.headers, Referer: refererLinkDub.href } };

    const [dataSub, dataDub] = await Promise.all([
      axios.get(`https://rapid-cloud.co/ajax/embed-6/getSources?id=${fileIdSub}`, optionsSub),
      axios.get(`https://rapid-cloud.co/ajax/embed-6/getSources?id=${fileIdDub}`, optionsDub),
    ]);

    const key = await axios.get('https://raw.githubusercontent.com/enimax-anime/key/e6/key.txt');
    const decryptedSub = cryptoJs.AES.decrypt(dataSub.data.sources, key.data).toString(cryptoJs.enc.Utf8);
    const decryptedDub = cryptoJs.AES.decrypt(dataDub.data.sources, key.data).toString(cryptoJs.enc.Utf8);

    const subSource = JSON.parse(decryptedSub);
    const dubSource = JSON.parse(decryptedDub);

    res.json({ subSource, dubSource });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching episode links' });
  }
});

module.exports = router;
