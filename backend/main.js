
const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bibtexParse = require("bibtex-parse-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const app = express();
const PORT = process.env.NEXT_PUBLIC_PORT || 5000;

app.use(cors());
app.use(express.json());

// Replace with your valid Google API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

function readBibTeX(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = bibtexParse.toJSON(content);

  const articles = parsed.map((entry) => ({
    author: entry.entryTags.author || "",
    title: entry.entryTags.title || "",
    doi: entry.entryTags.doi || "",
  }));

  return articles;
}

// Function to search for publications on Google Scholar
async function searchScholar(author) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const searchUrl = `https://scholar.google.com/scholar?start=0&q=${encodeURIComponent(
    author
  )}&hl=en&as_sdt=0,5`;

  await page.goto(searchUrl, { waitUntil: "networkidle2" });

  // Extract publication titles and links
  const results = await page.evaluate(() => {
    const items = [];
    const elements = document.querySelectorAll("h3.gs_rt");
    elements.forEach((el) => {
      const title = el.innerText;
      const linkElement = el.querySelector("a"); // Get the first <a> inside the <h3>
      const link = linkElement ? linkElement.href : null;
      items.push({ title: title, link: link });
    });
    return items;
  });

  await browser.close();
  return results;
}

app.post("/search", async (req, res) => {
  let author = req.body.author;
  try {
    const publications = await searchScholar(author);
    res.json({ publications });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ error: "Failed to fetch publications" });
  }
});

// POST endpoint to handle file upload and search
app.post("/upload", upload.single("bibtex"), async (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  const publications = readBibTeX(filePath);

  if (publications) {
    try {
      res.json({ publications });
    } catch (error) {
      console.error("Error during search:", error);
      res.status(500).json({ error: "Failed to fetch publications" });
    }
  } else {
    res.status(400).json({ error: "No author found in the BibTeX file." });
  }

  // Clean up uploaded file
  fs.unlinkSync(filePath);
});

// Route to interact with the Gemini Chat API
app.post("/gemini-chat", async (req, res) => {
  const userInput = req.body.message; // Assuming the PDF URL is in userInput

  if (!userInput) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Use the provided URL for the fileData
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "application/pdf",
          uri: userInput, // Use the URL from userInput
        },
      },
      { text: "Can you summarize this document as a bulleted list?" },
    ]);

    // Send back the model's response to the client
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error("Error with Gemini API call:", error);
    res.status(500).json({ error: "Failed to get response from Gemini API" });
  }
});

async function scrapePdfLink(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    console.log("Navigating to URL:", url);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for the element that contains the PDF link to appear
    // await page.waitForXPath('//*[@id="mathjax-container"]/div[1]/div[2]/div/ul/li[1]/a', { timeout: 5000 });

    // Use XPath to locate the PDF link
    const [linkElement] = await page.$x('//*[@id="mathjax-container"]/div[1]/div[2]/div/ul/li[1]/a');

    let pdfLink = null;

    if (linkElement) {
      pdfLink = await page.evaluate(el => el.href, linkElement);
      console.log("PDF Link found:", pdfLink);
    } else {
      console.log("No PDF link found.");
    }

    return pdfLink || null;
  } catch (error) {
    console.error("Error scraping PDF link:", error);
    return null;
  } finally {
    await browser.close();
  }
}

// Example usage
scrapePdfLink("https://www.sciencedirect.com/science/article/pii/S1877050915021687")
  .then((pdfLink) => console.log("PDF Link:", pdfLink))
  .catch((error) => console.error("Scraping error:", error));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});