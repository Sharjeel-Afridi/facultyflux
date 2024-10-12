// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bibtexParse = require('bibtex-parse-js'); 
const app = express();
const PORT = process.env.NEXT_PUBLIC_PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });



function readBibTeX(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = bibtexParse.toJSON(content);

    const articles = parsed.map(entry => ({
        author: entry.entryTags.author || '',
        title: entry.entryTags.title || '',
        doi: entry.entryTags.doi || ''
    }));

    // console.log(articles);
    return articles;
}


// Function to search for publications on Google Scholar
async function searchScholar(author) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const searchUrl = `https://scholar.google.com/scholar?start=0&q=${encodeURIComponent(author)}&hl=en&as_sdt=0,5`;

    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Extract publication titles and links
    const results = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll('h3.gs_rt');
        elements.forEach((el) => {
            const title = el.innerText;
            // const authors = el.querySelector('div.gs_a').innerText;
            // console.log(authors);
            const linkElement = el.querySelector('a'); // Get the first <a> inside the <h3>
            const link = linkElement ? linkElement.href : null;
            items.push({ 'title': title, 'link': link });
        });
        return items;
    });

    await browser.close();
    return results;
}


app.post('/search', async (req, res) => {
    let author = req.body.author;
    try{
        const publications = await searchScholar(author);
        res.json({publications});
    }catch(error){
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Failed to fetch publications' });
    }

})
// POST endpoint to handle file upload and search
app.post('/upload', upload.single('bibtex'), async (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    const publications = readBibTeX(filePath);

    if (publications) {
        try {
            // const publications = await searchScholar(author);
            // console.log(data);
            res.json({ publications });
        } catch (error) {
            console.error('Error during search:', error);
            res.status(500).json({ error: 'Failed to fetch publications' });
        }
    } else {
        res.status(400).json({ error: 'No author found in the BibTeX file.' });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);
});


app.get('/pdf', (res, req) => {
    const xpath = '//*[@id="mathjax-container"]/div[1]/div[2]/div/ul/li[1]/a';
    //write a scraping code here for this elemnt i want its link
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
