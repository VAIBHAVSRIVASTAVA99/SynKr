import puppeteer from "puppeteer";
import cheerio from "cheerio";
import axios from "axios";

let browser;

export const setupWebScraping = async () => {
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("Web scraping service configured successfully");
  } catch (error) {
    console.error("Error setting up web scraping service:", error);
    throw error;
  }
};

export const scrapeWithPuppeteer = async (url) => {
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    const content = await page.content();
    await page.close();
    return content;
  } catch (error) {
    console.error("Error scraping with Puppeteer:", error);
    throw error;
  }
};

export const scrapeWithCheerio = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return $;
  } catch (error) {
    console.error("Error scraping with Cheerio:", error);
    throw error;
  }
};

export const extractData = async (url, selectors) => {
  try {
    const $ = await scrapeWithCheerio(url);
    const data = {};

    for (const [key, selector] of Object.entries(selectors)) {
      data[key] = $(selector).text().trim();
    }

    return data;
  } catch (error) {
    console.error("Error extracting data:", error);
    throw error;
  }
};

// Cleanup function to close browser
export const cleanup = async () => {
  if (browser) {
    await browser.close();
  }
}; 