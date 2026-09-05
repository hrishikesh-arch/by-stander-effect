const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to a reasonable size
  await page.setViewport({ width: 1200, height: 800 });

  // Navigate to the local server
  await page.goto('http://localhost:8080');

  // Fill onboarding form
  await page.type('#participantName', 'Test User');
  await page.type('#participantPhone', '1234567890');
  await page.type('#participantEmail', 'test@test.com');
  await page.click('#profileForm button[type="submit"]');

  // Wait for Join Gate and click Join
  await page.waitForSelector('#joinForm button[type="submit"]');
  await page.click('#joinForm button[type="submit"]');

  // Wait for chat rendering
  await page.waitForSelector('.chat-window');
  
  // Wait a second for some messages to appear
  await new Promise(r => setTimeout(r, 2000));

  // Type a message
  await page.type('#messageInput', 'Hello world!');
  await page.click('#composer button[type="submit"]');

  // Wait for a moment to ensure it renders
  await new Promise(r => setTimeout(r, 1000));

  // Verify the layout: is the composer fully visible? 
  // Let's just take a screenshot and save it
  await page.screenshot({ path: 'puppeteer_test_result.png', fullPage: true });

  await browser.close();
  console.log('Test completed successfully. Screenshot saved as puppeteer_test_result.png');
})();
