const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cryptoJs = require('crypto-js')

const router = express.Router();

function isJson(data) {
    try {
        JSON.parse(data);
    } catch (err) {
        return false;
    }

    return true;
}

/**
 * @swagger
 * /api/movie/flixhq/watch/{id}:
 *   get:
 *     summary: Retrieve video file for a movie from FlixHQ
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the movie
 *     responses:
 *       200:
 *         description: Video file data for the movie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 m3u8Data:
 *                   type: object
 *                   properties:
 *                     sources:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             description: URL of the video file
 *                           quality:
 *                             type: string
 *                             description: Quality of the video
 *                           isM3U8:
 *                             type: boolean
 *                             description: Indicates if the URL is an m3u8 file
 *                     subtitles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             description: URL of the subtitle file
 *                           lang:
 *                             type: string
 *                             description: Language of the subtitle
 *       400:
 *         description: ID is required
 *       500:
 *         description: An error occurred while fetching episode links
 */

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        const API_URL = `https://flixhq.to/ajax/movie/episodes/${id}`;
        const VIDCLOUD_BASEURL = `https://rabbitstream.net`

        const response = await axios.get(API_URL);
        const $ = cheerio.load(response.data);

        const vidcloudHref = $('.nav-link.btn-secondary.link-item[title="Vidcloud"]').attr('href');
        const vidcloudId = vidcloudHref.split('.').pop();
        const sourcesURL = `https://flixhq.to/ajax/sources/${vidcloudId}`;

        const sourcesResponse = await axios.get(sourcesURL);
        const { link } = sourcesResponse.data;
        const sourceID = link.split('/').pop().split('?')[0];

        const refererLink = new URL(link);

        const options = {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': refererLink.href,
            },
        };

        const m3u8Data = {
            sources: [],
            subtitles: [],
        }

        const { data } = await axios.get(`${VIDCLOUD_BASEURL}/ajax/embed-4/getSources?id=${sourceID}`, options);

        let sources = null;

        if (!isJson(data.sources)) {
            const key = await (await axios.get('https://raw.githubusercontent.com/enimax-anime/key/e4/key.txt')).data;
        
            sources = JSON.parse(cryptoJs.AES.decrypt(data.sources, key).toString(cryptoJs.enc.Utf8));
        }
        
        for (const source of sources) {
            const { data } = await axios.get(source.file, options);
            const videoUrls = data.split('\n').filter(line => line.includes('.m3u8'));
            const videoQualities = data.split('\n').filter(line => line.includes('RESOLUTION='));
        
            videoQualities.map((item, i) => {
                const quality = item.split(',')[2].split('x')[1];
                const url = videoUrls[i];
        
                m3u8Data.sources.push({
                    url: url,
                    quality: quality,
                    isM3U8: url.includes('.m3u8'),
                });
            });
        }

        m3u8Data.subtitles = data.tracks.map(track => {
            return {
                url: track.file,
                lang: track.label || 'Default',
            };
        });

        res.json({ m3u8Data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching episode links' });
    }
});

module.exports = router;
