const express = require('express');
const puppeteer = require('puppeteer-core');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.get('/resolve', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing Terabox link' });
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox','--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const videoUrls = [];
    page.on('response', async (response) => {
      const req = response.request();
      const link = req.url();
      if (link.includes('.mp4') && !videoUrls.includes(link)) {
        videoUrls.push(link);
      }
    });
    await page.waitForTimeout(7000);
    await browser.close();
    if (!videoUrls.length) return res.status(404).json({ error: 'Video not found' });
    res.json({ video: videoUrls[0] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to extract video', details: e.message });
  }
});
app.listen(port, () => console.log(`✅ Running on port ${port}`));
