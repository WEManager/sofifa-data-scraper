import { browserInit } from '@providers/BrowserProvider/Puppeteer'

export const getPageContent = async (url: string) => {
 const browser = await browserInit()
 const page = await browser.newPage()
 await page.goto(url)

 return page
}
