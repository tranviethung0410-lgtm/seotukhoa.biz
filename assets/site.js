// SEOtukhoa Studio · hiệu ứng nhỏ trên website (không cần thư viện ngoài)
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hiện dần các khối khi cuộn tới
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Đếm số chạy lên
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduce || !("IntersectionObserver" in window)) { el.textContent = end; return; }
    var seen = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      seen.disconnect();
      var start = null;
      var step = function (t) {
        if (!start) start = t;
        var p = Math.min(1, (t - start) / 1100);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    seen.observe(el);
  });

  // Ví dụ AI sửa tiêu đề: gõ chữ lần lượt
  var box = document.getElementById("typing");
  if (box) {
    var samples = JSON.parse(box.getAttribute("data-samples") || "[]");
    var oldEl = document.getElementById("typing-old");
    var scoreEl = document.getElementById("typing-score");
    var i = 0;
    var show = function () {
      var s = samples[i % samples.length];
      i++;
      oldEl.textContent = s.old;
      scoreEl.textContent = s.score;
      if (reduce) { box.textContent = s.new; return; }
      box.textContent = "";
      var k = 0;
      var tick = setInterval(function () {
        box.textContent = s.new.slice(0, ++k);
        if (k >= s.new.length) { clearInterval(tick); setTimeout(show, 2600); }
      }, 32);
    };
    if (samples.length) show();
  }

  // Tô đậm mục menu đang xem
  var links = document.querySelectorAll(".menu a[href^='#']");
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (a) { a.classList.remove("on"); });
          map[e.target.id].classList.add("on");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }
})();

// GA4: đo lượt bấm Zalo, gọi điện, email (sự kiện khách tiềm năng)
document.addEventListener('click', function (ev) {
  var a = ev.target.closest && ev.target.closest('a[href]');
  if (!a || typeof window.gtag !== 'function') return;
  var h = a.getAttribute('href') || '';
  var name = h.indexOf('zalo.me') > -1 ? 'click_zalo' : h.indexOf('tel:') === 0 ? 'click_phone' : h.indexOf('mailto:') === 0 ? 'click_email' : '';
  if (name) window.gtag('event', name, { link_url: h, page_path: location.pathname, link_text: (a.textContent || '').trim().slice(0, 60) });
});
