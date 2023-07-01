const express = require('express');
const axios = require('axios');

const router = express.Router();


router.get('/:keyword', async (req, res) => {
    try {
        const { keyword } = req.params;
        const API_URL = `https://api.mangadex.org/manga?title=${encodeURIComponent(keyword)}&limit=5&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&includes[]=cover_art&order[relevance]=desc`;

        const response = await axios.get(API_URL);

        const searchResults = response.data.data.map(manga => {
            const attributes = manga.attributes;
            const title = attributes.title.en;
            const id = manga.id;

            // Extracting the filename from the relationships array
            let filename = '';
            const coverArtRelationship = manga.relationships.find(rel => rel.type === 'cover_art');
            if (coverArtRelationship && coverArtRelationship.attributes) {
                filename = coverArtRelationship.attributes.fileName;
            }

            return { title, id, filename };
        });

        res.json(searchResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching search results' });
    }
});

module.exports = router;
