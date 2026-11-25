/* ============================================================
   幻灯片引擎 + 内嵌动画播放器
   - 1280×720 等比画布，键盘 / 触屏 / 圆点 / 全屏切换
   - 每个动画在页面内播放：自带播放 / 暂停 / 重置按钮，
     不弹出外部播放器；切出页面自动暂停。
   ============================================================ */
(function () {
  'use strict';

  var CW = 1280, CH = 720;
  var track = document.getElementById('track');
  var canvas = document.getElementById('canvas');
  var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
  var total = slides.length;
  var cur = 0;

  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var fsBtn = document.getElementById('fsBtn');
  var curPage = document.getElementById('curPage');
  var totalPage = document.getElementById('totalPage');
  var dotsEl = document.getElementById('dots');
  var progress = document.getElementById('deckProgress');

  totalPage.textContent = total;

  /* ---------- 侧边圆点 ---------- */
  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', slides[i].dataset.title || ('第 ' + (i + 1) + ' 页'));
    b.addEventListener('click', function () { goTo(i); });
    dotsEl.appendChild(b);
  });
  var dotEls = Array.prototype.slice.call(dotsEl.children);

  /* ---------- 动画播放器注册表 ---------- */
  var players = [];

  function pauseAll() { players.forEach(function (p) { p.pause(); }); }

  function onEnter(i) {
    pauseAll();
    slides[i].scrollTop = 0;
  }

  function goTo(i) {
    cur = Math.max(0, Math.min(total - 1, i));
    track.style.transform = 'translateX(' + (-cur * 100) + '%)';
    curPage.textContent = cur + 1;
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === total - 1;
    dotEls.forEach(function (d, k) { d.classList.toggle('on', k === cur); });
    progress.style.width = (total > 1 ? (cur / (total - 1)) * 100 : 100) + '%';
    if (history.replaceState) history.replaceState(null, '', '#slide-' + (cur + 1));
    onEnter(cur);
  }

  prevBtn.addEventListener('click', function () { goTo(cur - 1); });
  nextBtn.addEventListener('click', function () { goTo(cur + 1); });

  /* ---------- 等比缩放 ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / CW, window.innerHeight / CH);
    canvas.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- 全屏 ---------- */
  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
  }
  function toggleFullscreen() {
    var el = document.documentElement;
    if (!isFullscreen()) {
      var req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (req) req.call(el);
    } else {
      var exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exit) exit.call(document);
    }
  }
  function syncFsBtn() {
    fsBtn.textContent = isFullscreen() ? '✕ 退出全屏' : '⛶ 全屏';
    setTimeout(fit, 120);
  }
  fsBtn.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', syncFsBtn);
  document.addEventListener('webkitfullscreenchange', syncFsBtn);
  syncFsBtn();

  /* ---------- 键盘 / 触屏 ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); goTo(cur + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goTo(cur - 1); }
    else if (e.key === 'Home') { goTo(0); }
    else if (e.key === 'End') { goTo(total - 1); }
    else if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); }
  });
  var touchX = null;
  track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) { dx < 0 ? goTo(cur + 1) : goTo(cur - 1); }
    touchX = null;
  }, { passive: true });

  /* ============================================================
     内嵌动画播放器
     每个 def: { title, caption, viewBox, duration, loop, build(svg), render(t, refs) }
     ============================================================ */
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    var n = document.createElementNS(SVG_NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function FigurePlayer(container, def) {
    this.def = def;
    this.t = 0;
    this.playing = false;
    this.raf = null;
    this.last = 0;
    this.dur = def.duration || 4;
    this.loop = !!def.loop;

    container.classList.add('fig');

    var bar = document.createElement('div');
    bar.className = 'fig-bar';
    var title = document.createElement('span');
    title.className = 'fig-title';
    title.textContent = def.title || '动画';
    var ctrl = document.createElement('div');
    ctrl.className = 'fig-ctrl';
    this.playBtn = document.createElement('button');
    this.playBtn.type = 'button';
    this.playBtn.className = 'fig-btn primary';
    this.playBtn.textContent = '▶ 播放';
    this.resetBtn = document.createElement('button');
    this.resetBtn.type = 'button';
    this.resetBtn.className = 'fig-btn';
    this.resetBtn.textContent = '↺ 重置';
    ctrl.appendChild(this.playBtn);
    ctrl.appendChild(this.resetBtn);
    bar.appendChild(title);
    bar.appendChild(ctrl);

    this.svg = el('svg', { class: 'fig-svg', viewBox: def.viewBox || '0 0 640 320', role: 'img' });
    var cap = document.createElement('p');
    cap.className = 'fig-cap';
    cap.textContent = def.caption || '';

    container.appendChild(bar);
    container.appendChild(this.svg);
    container.appendChild(cap);

    this.refs = def.build ? def.build(this.svg, el) : {};
    this.render();

    var self = this;
    this.playBtn.addEventListener('click', function () { self.toggle(); });
    this.resetBtn.addEventListener('click', function () { self.reset(); });
  }

  FigurePlayer.prototype.render = function () {
    if (this.def.render) this.def.render(this.t, this.refs, this.svg);
  };

  FigurePlayer.prototype.toggle = function () {
    if (this.playing) { this.pause(); return; }
    if (this.t >= 1) this.t = 0;
    this.play();
  };

  FigurePlayer.prototype.play = function () {
    if (this.playing) return;
    this.playing = true;
    this.last = performance.now();
    this.playBtn.textContent = '⏸ 暂停';
    var self = this;
    function frame(now) {
      if (!self.playing) return;
      var dt = (now - self.last) / 1000;
      self.last = now;
      self.t += dt / self.dur;
      if (self.t >= 1) {
        if (self.loop) { self.t = self.t % 1; }
        else { self.t = 1; }
      }
      self.render();
      if (self.t >= 1 && !self.loop) { self.pause(); self.playBtn.textContent = '↻ 重播'; return; }
      self.raf = requestAnimationFrame(frame);
    }
    this.raf = requestAnimationFrame(frame);
  };

  FigurePlayer.prototype.pause = function () {
    this.playing = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.t > 0 && this.t < 1) this.playBtn.textContent = '▶ 继续';
  };

  FigurePlayer.prototype.reset = function () {
    this.pause();
    this.t = 0;
    this.render();
    this.playBtn.textContent = '▶ 播放';
  };

  /* ---------- 注册所有动画 ---------- */
  var DEFS = window.DECK_FIGURES || {};
  document.querySelectorAll('.fig[data-fig]').forEach(function (box) {
    var id = box.getAttribute('data-fig');
    if (DEFS[id]) players.push(new FigurePlayer(box, DEFS[id]));
  });

  /* ---------- 初始定位 + hash 深链（#slide-N） ---------- */
  function hashIndex() {
    var m = (location.hash || '').match(/slide-(\d+)/);
    return m ? Math.max(0, Math.min(total - 1, parseInt(m[1], 10) - 1)) : 0;
  }
  window.addEventListener('hashchange', function () { goTo(hashIndex()); });
  goTo(hashIndex());
})();
