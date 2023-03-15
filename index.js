const puppeteer = require('puppeteer');

const page_url = 'https://www.facebook.com/groups/ryanvanhungnguoiban/posts';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    defaultViewport: null,
    args: [`--remote-debugging-port=9222`]
  });

  // 1. CONFIG
  // 1.1 Lấy cookies Facebook
  const FACEBOOK_COOKIES = [];

  // 1.2 CONFIG
  const CONFIG = {
    postClass: 'x1yztbdb x1n2onr6 xh8yej3 x1ja2u2z',
    userClass: 'x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xt0b8zv xzsf02u x1s688f',
    likeElementClass: 'x6s0dn4 x78zum5 x1iyjqo2 x6ikm8r x10wlt62',
    likeClass: ' xrbpyxo x6ikm8r x10wlt62 xlyipyv x1exxlbk',
    commentShareClass: 'x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x1qjc9v5 xozqiw3 x1q0g3np xykv574 xbmpl8g x4cne27 xifccgj',
    commentClass: 'x193iq5w xeuugli x13faqbe x1vvkbs xlh3980 xvmahel x1n0sxbx x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x4zkp8e x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa',
    shareClass: 'x193iq5w xeuugli x13faqbe x1vvkbs xlh3980 xvmahel x1n0sxbx x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x4zkp8e x3x7a5m x6prxxf xvq8zen xo1l8bm xi81zsa',
    contentClass: 'x1iorvi4 x1pi30zi x1l90r2v x1swvt13'
  };

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
          if (totalHeight >= scrollHeight || totalHeight > 10000) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  // Lấy dữ liệu từ các bài viết
  const posts = await page.evaluate((CONFIG) => {
    const postElements = document.querySelectorAll(`[class="${CONFIG.postClass}"]`);
    const posts = [];
    for (let i = 0; i < postElements.length; i++) {
      const post = {};
      const postElement = postElements[i];

      // Lấy tiêu đề bài viết
      const userElement = postElement.querySelector(`[class="${CONFIG.userClass}"]`);
      post.link = 'https://www.facebook.com' + userElement.getAttribute('href');
      post.userPost = userElement.querySelector('span').innerText;

      // Lấy nội dung bài viết
      const contentElement = postElement.querySelector(`[class="${CONFIG.contentClass}"]`);
      if (contentElement) {
        post.content = contentElement.innerText;
      }

      // Lấy like div
      const likeCommentEl = postElement.querySelector(`[class="${CONFIG.likeElementClass}"]`);
      post.like = likeCommentEl.querySelector(`[class="${CONFIG.likeClass}"]`).innerText;


      // Lấy comment share div
      const commentShareEl = postElement.querySelector(`[class="${CONFIG.commentShareClass}"]`);

      // Lấy lượt comment
      if (commentShareEl.children[1]) {
        const likeElement = commentShareEl.children[1].querySelector(`[class="${CONFIG.commentClass}"]`);
        post.comment = likeElement.innerText;
      }

      // Lấy lượt share
      if (commentShareEl.children[2]) {
        const commentElement = commentShareEl.children[2].querySelector(`[class="${CONFIG.shareClass}"]`);
        post.share = commentElement.innerText;
      }

      // Thêm bài viết vào danh sách
      posts.push(post);
    }

    return posts;
  }, CONFIG);



  // Xử lý các bài viết ở đây
  console.log(posts);

  await browser.close();
})();

