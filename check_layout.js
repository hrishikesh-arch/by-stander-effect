const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:8080');

  await page.evaluate(() => {
    // Inject CSS to fix it immediately
    const style = document.createElement('style');
    style.innerHTML = '.messenger { grid-template-rows: 100%; }';
    document.head.appendChild(style);
  });

  await page.type('#participantName', 'Test');
  await page.type('#participantPhone', '123');
  await page.type('#participantEmail', 'test@test.com');
  await page.click('#profileForm button[type="submit"]');

  await page.waitForSelector('#joinForm button[type="submit"]');
  await page.click('#joinForm button[type="submit"]');

  await page.waitForSelector('.composer-container');
  
  const layout = await page.evaluate(() => {
    const messenger = document.querySelector('.messenger').getBoundingClientRect();
    const chatWindow = document.querySelector('.chat-window').getBoundingClientRect();
    const messages = document.querySelector('.messages').getBoundingClientRect();
    const composer = document.querySelector('.composer-container').getBoundingClientRect();
    
    return {
      messenger: { top: messenger.top, bottom: messenger.bottom, height: messenger.height },
      chatWindow: { top: chatWindow.top, bottom: chatWindow.bottom, height: chatWindow.height },
      messages: { top: messages.top, bottom: messages.bottom, height: messages.height },
      composer: { top: composer.top, bottom: composer.bottom, height: composer.height },
    };
  });
  
  console.log(JSON.stringify(layout, null, 2));
  await browser.close();
})();
