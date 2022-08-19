import puppeteer from 'puppeteer'

export const browserInit = async () =>
 await puppeteer.launch({
  headless: true,
  args: ["--disable-setuid-sandbox"],
  ignoreHTTPSErrors: true
})
