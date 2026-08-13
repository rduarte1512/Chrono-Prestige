const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  const filePath = path.join(process.cwd(), 'index.html');
  const html = fs.readFileSync(filePath, 'utf8');
  const snippet = `<script>!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_8qgykn9n3k5PkY");whop.track("page");</script>`;
  const events = `<script>document.addEventListener("click",function(event){const link=event.target.closest("a[href]");if(!link||!window.whop)return;const href=link.href;if(href.includes("/products/")){whop.track("view_content")}else if(href.includes("/collections/")||href==="https://chrono-prestige-nmh8jm3s.myshopify.com/"){whop.track("shop_click")}});</script>`;
  const cartStyle = `<script defer src="/cart-style.js"></script>`;
  const cart = `<script defer src="/cart.js"></script>`;
  let output = html.replace('</head>', `${snippet}\n</head>`);
  output = output.replace('</body>', `${events}\n${cartStyle}\n${cart}\n</body>`);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.status(200).send(output);
};
