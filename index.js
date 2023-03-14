const puppeteer = require('puppeteer');

const page_url = 'https://www.facebook.com/groups/ryanvanhungnguoiban/posts';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    defaultViewport: null,
    args: [`--remote-debugging-port=9222`]
  });

  // 1. Lấy cookies Facebook
  const FACEBOOK_COOKIES = [
    { name: 'presence', value: 'C%7B%22t3%22%3A%5B%7B%22i%22%3A%22u.100065676313102%22%7D%5D%2C%22utc3%22%3A1678762805607%2C%22v%22%3A1%7D', domain: '.facebook.com' },
    { name: 'fr', value: '0tYuUlpxo5asbbe44.AWVJMJ_clkwQkgCZC5iz4NRzALA.BkD-AR.BG.AAA.0.0.BkD-AR.AWWIGIsLNqw', domain: '.facebook.com' },
    { name: 'xs', value: '21%3AIeuCwRgN5UNqQw%3A2%3A1677466401%3A-1%3A6386%3A%3AAcVOpkwNA-S3EcudIpzli82PK4NMir9AvtuFf7_AzvI', domain: '.facebook.com' },
    { name: 'wd', value: '1391x261', domain: '.facebook.com' },
    { name: 'm_pixel_ratio', value: '2', domain: '.facebook.com' },
    { name: 'm_page_voice', value: '100009025734152', domain: '.facebook.com' },
    { name: 'datr', value: 'QBr8Y0HS3nkoT54LCXkjc8I2', domain: '.facebook.com' },
    { name: 'dpr', value: '2', domain: '.facebook.com' },
    { name: 'c_user', value: '100009025734152', domain: '.facebook.com' },
    { name: 'sb', value: 'QBr8Y9vv2lmG6KrpG70LYt_D', domain: '.facebook.com' },
  ];

  // 2. Tiếp tục sử dụng Chrome tab để truy cập Facebook
  const page = await browser.newPage();
  await page.setCookie(...FACEBOOK_COOKIES);
  await page.goto(page_url);

  // 3. Scroll cuối trang
  await autoScroll(page);
  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }



  // Lấy dữ liệu từ các bài viết
  const posts = await page.evaluate(() => {
    const postElements = document.querySelectorAll('[data-pagelet^="GroupFeed"] [data-testid="fbfeed_story"]');

    const posts = [];
    for (let i = 0; i < postElements.length; i++) {
      const post = {};
      const postElement = postElements[i];

      // Lấy tiêu đề bài viết
      const titleElement = postElement.querySelector('[data-testid="story-subtitle"]');
      post.title = titleElement ? titleElement.innerText : '';

      // Lấy nội dung bài viết
      const contentElement = postElement.querySelector('[data-testid="post_message"]');
      post.content = contentElement ? contentElement.innerText : '';

      // Lấy hình ảnh bài viết
      const imageElement = postElement.querySelector('[data-testid="post_message"] img');
      post.image = imageElement ? imageElement.src : '';

      // Thêm bài viết vào danh sách
      console.log('post', post);
      posts.push(post);
    }

    return posts;
  });



  // Xử lý các bài viết ở đây
  console.log(posts);

  await browser.close();
})();