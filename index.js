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
  const FACEBOOK_COOKIES = [];

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