/* ============================================================
   一次抬手，要经过六层 —— 交互逻辑
   （数据在 data.js，文案改动只需动那一个文件）
   ============================================================ */
(function () {
  'use strict';

  var D = window.EMB || {};
  var LAYERS = D.LAYERS || [];
  var SYSTEMS = D.SYSTEMS || [];
  var MODULES = D.MODULES || [];
  var BREAKS = D.BREAKS || [];
  var BUILDER = D.BUILDER || [];
  var PRESETS = D.PRESETS || [];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     01 · HERO 信号链
     ---------------------------------------------------------- */
  var NODE_LABELS = ['意图', '运动皮层', '脊髓', '周围神经', '肌肉', '关节位移', '本体感觉'];
  var NODE_SHORT = ['意图', '皮层', '脊髓', '神经', '肌肉', '关节', '反馈'];
  var nodesEl = document.getElementById('nodes');
  var pulseEl = document.getElementById('pulse');
  var reachBtn = document.getElementById('reachBtn');
  var reachTime = document.getElementById('reachTime');
  var pipelineEl = document.getElementById('pipeline');
  var heroNote = document.getElementById('heroNote');
  var animating = false;

  NODE_LABELS.forEach(function (label, i) {
    var d = document.createElement('div');
    d.className = 'node';
    d.innerHTML = '<span class="dot"></span><span class="nlab"><span class="full">' + label +
      '</span><span class="short">' + NODE_SHORT[i] + '</span></span>';
    nodesEl.appendChild(d);
  });
  var nodeEls = Array.prototype.slice.call(nodesEl.children);

  function lineBounds() {
    var first = nodeEls[0].querySelector('.dot').getBoundingClientRect();
    var last = nodeEls[nodeEls.length - 1].querySelector('.dot').getBoundingClientRect();
    var box = pipelineEl.getBoundingClientRect();
    return {
      start: (first.left + first.width / 2 - box.left) / box.width * 100,
      end: (last.left + last.width / 2 - box.left) / box.width * 100
    };
  }

  function layoutLine() {
    var b = lineBounds();
    var line = document.querySelector('.stage-line');
    line.style.left = b.start + '%';
    line.style.right = (100 - b.end) + '%';
    pulseEl.style.left = b.start + '%';
  }

  function runReach() {
    if (animating) return;
    animating = true;
    heroNote.classList.remove('show');
    nodeEls.forEach(function (n) { n.classList.remove('on'); });
    var b = lineBounds();
    pulseEl.classList.add('on');
    var dur = reduceMotion ? 300 : 500;   // 慢放 ~3 倍，标签已写在读数旁边
    var t0 = performance.now();
    var total = 0.18;

    function step(now) {
      var p = Math.max(0, Math.min(1, (now - t0) / dur));
      var pos = b.start + (b.end - b.start) * p;
      pulseEl.style.left = pos + '%';
      reachTime.textContent = (p * total).toFixed(3) + ' s';
      nodeEls.forEach(function (n, i) {
        if (p >= (i / (nodeEls.length - 1)) * 0.9) n.classList.add('on');
      });
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        pulseEl.classList.remove('on');
        heroNote.classList.add('show');
        animating = false;
      }
    }
    requestAnimationFrame(step);
  }

  reachBtn.addEventListener('click', runReach);
  window.addEventListener('resize', layoutLine);
  layoutLine();
  if (reduceMotion) {
    nodeEls.forEach(function (n) { n.classList.add('on'); });
    reachTime.textContent = '0.180 s';
    heroNote.classList.add('show');
  } else {
    setTimeout(runReach, 700);
  }

  /* ----------------------------------------------------------
     02 · 六层堆栈
     ---------------------------------------------------------- */
  var stack = document.getElementById('stack');
  var deckText = document.getElementById('deckText');
  var stackNum = document.getElementById('stackNum');
  var stackName = document.getElementById('stackName');
  var stackScale = document.getElementById('stackScale');

  function buildStack() {
    var svgNS = 'http://www.w3.org/2000/svg';
    var pad = 6, gap = 30;
    LAYERS.forEach(function (L, i) {
      var inset = pad + i * gap;
      var size = 408 - i * gap * 2;
      var rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', inset);
      rect.setAttribute('y', inset);
      rect.setAttribute('width', size);
      rect.setAttribute('height', size);
      rect.setAttribute('rx', 10);
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', '#c9bfa9');
      rect.setAttribute('stroke-width', '1');
      rect.setAttribute('class', 'frame');
      rect.setAttribute('data-i', i);
      stack.appendChild(rect);

      var label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', inset + 12);
      label.setAttribute('y', inset + 20);
      label.setAttribute('class', 'frame-label');
      label.setAttribute('data-i', i);
      label.setAttribute('fill', '#8b8272');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-family', 'SFMono-Regular, Consolas, monospace');
      label.setAttribute('letter-spacing', '1');
      label.textContent = 'L' + (i + 1) + ' ' + L.cn;
      stack.appendChild(label);

      rect.style.cursor = 'pointer';
      rect.addEventListener('click', function () { scrollToLayer(i); });
    });

    // 内核：一枚芯片，说明最底层到底是什么
    var core = document.createElementNS(svgNS, 'g');
    core.setAttribute('class', 'core');
    var chip = document.createElementNS(svgNS, 'rect');
    chip.setAttribute('x', '178'); chip.setAttribute('y', '178');
    chip.setAttribute('width', '64'); chip.setAttribute('height', '64');
    chip.setAttribute('rx', '5');
    chip.setAttribute('fill', '#1a1710');
    core.appendChild(chip);
    for (var k = 0; k < 7; k++) {
      var yy = 182 + k * 9.4;
      [['171', '178'], ['242', '178']].forEach(function (p, pi) {
        var pin = document.createElementNS(svgNS, 'line');
        pin.setAttribute('x1', pi === 0 ? '171' : '245');
        pin.setAttribute('x2', pi === 0 ? '178' : '242');
        pin.setAttribute('y1', yy); pin.setAttribute('y2', yy);
        pin.setAttribute('stroke', '#8b8272'); pin.setAttribute('stroke-width', '1');
        core.appendChild(pin);
      });
    }
    var coreDot = document.createElementNS(svgNS, 'circle');
    coreDot.setAttribute('cx', '210'); coreDot.setAttribute('cy', '210'); coreDot.setAttribute('r', '3');
    coreDot.setAttribute('fill', '#f0c987');
    core.appendChild(coreDot);
    stack.appendChild(core);
  }
  buildStack();

  var frameEls = Array.prototype.slice.call(stack.querySelectorAll('.frame'));
  var labelEls = Array.prototype.slice.call(stack.querySelectorAll('.frame-label'));

  function setActive(i) {
    frameEls.forEach(function (f, k) {
      var on = k === i;
      f.setAttribute('stroke', on ? '#63388a' : '#c9bfa9');
      f.setAttribute('stroke-width', on ? '3' : '1');
      f.setAttribute('fill', on ? 'rgba(99,56,138,0.07)' : 'none');
      f.style.opacity = on ? '1' : (k > i ? '0.45' : '0.8');
    });
    labelEls.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('fill', on ? '#63388a' : '#8b8272');
      t.setAttribute('font-weight', on ? '700' : '400');
      t.style.opacity = on ? '1' : '0.55';
    });
    stackNum.textContent = 'L' + (i + 1);
    stackName.textContent = LAYERS[i].cn + ' ' + LAYERS[i].en;
    stackScale.textContent = LAYERS[i].scale;
  }

  function scrollToLayer(i) {
    var blocks = deckText.querySelectorAll('.layer');
    if (blocks[i]) blocks[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  function renderDeck() {
    var html = '';
    LAYERS.forEach(function (L, i) {
      var body = '';
      if (L.kind === 'duo') {
        var rows = L.pairs.map(function (p) {
          return '<div class="duo-row"><span class="b">' + p[0] + '</span><span class="dash"></span><span class="a">' + p[1] + '</span></div>';
        }).join('');
        body = '<div class="duo"><div class="duo-head"><span>生物原本这样做</span><span></span><span>机器如何接手</span></div>' + rows + '</div>';
      } else if (L.kind === 'systems') {
        body = '<div class="sys-table">' + SYSTEMS.map(function (s) {
          return '<div class="sys-row"><span class="s-b">' + s.bio + '</span><span class="s-n">' + s.name + '</span><span class="s-a">' + s.art + '</span></div>';
        }).join('') + '</div>';
      } else if (L.kind === 'subs') {
        body = '<div class="acc">' + SYSTEMS.map(function (s, k) {
          return '<div class="acc-item' + (k === 0 ? ' open' : '') + '">' +
            '<button class="acc-head" type="button"><span class="cnt">' + (k + 1) + '</span><span>' + s.name + '</span><span class="cnt">' + s.subs.length + ' 个</span><span class="plus">+</span></button>' +
            '<div class="acc-body"><div class="sub-chips">' + s.subs.map(function (x) { return '<span class="sub-chip">' + x + '</span>'; }).join('') + '</div></div>' +
            '</div>';
        }).join('') + '</div>';
      } else if (L.kind === 'mods') {
        body = '<div class="mod-filter" data-filter="all">' +
          '<button class="on" data-f="all" type="button">全部</button>' +
          '<button data-f="hw" type="button">硬件</button>' +
          '<button data-f="sw" type="button">软件 / 算法</button></div>' +
          '<div class="mods">' + MODULES.map(function (m) {
            return '<button class="mod" type="button" data-t="' + m.t + '" data-p="' + m.p + '" data-w="' + m.w + '">' + m.n + '</button>';
          }).join('') + '</div>' +
          '<div class="mod-tally">' +
          '<span>已选 <b class="t-n">0</b> 个模块</span>' +
          '<span>合计功耗 <b class="t-p">0.0</b> W</span>' +
          '<span>合计重量 <b class="t-w">0</b> g</span>' +
          '</div>' +
          '<p class="fixed">功耗为典型工作功耗，不是峰值：外骨骼关节行走时约 25 W，启动峰值可达 800 W 级（厂商标称）。软件模块不占重量，其算力摊在所选芯片上。重量含外壳、线缆与紧固件的分摊。数值逐项对到型号，见页面「07 数据与来源」。</p>';
      }

      html += '<section class="layer" data-i="' + i + '">' +
        '<div class="layer-top"><span class="no">第 ' + L.n + ' 层</span><span class="tag">' + L.tag + '</span></div>' +
        '<h3 class="serif">' + L.cn + '<span>' + L.en + '</span></h3>' +
        '<p class="gist">' + L.gist + '</p>' +
        body +
        '<div class="kpi"><b>' + L.kpiLabel + '</b> · ' + L.kpi + '</div>' +
        '</section>';
    });
    deckText.innerHTML = html;
  }
  renderDeck();
  setActive(0);

  // 交互：子系统手风琴
  Array.prototype.forEach.call(deckText.querySelectorAll('.acc-head'), function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var isOpen = item.classList.contains('open');
      Array.prototype.forEach.call(deckText.querySelectorAll('.acc-item'), function (it) { it.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  // 交互：模块筛选 + 计数
  var modFilterEl = deckText.querySelector('.mod-filter');
  if (modFilterEl) {
    modFilterEl.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      Array.prototype.forEach.call(modFilterEl.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      var f = b.dataset.f;
      Array.prototype.forEach.call(deckText.querySelectorAll('.mod'), function (m) {
        m.style.display = (f === 'all' || m.dataset.t === f) ? '' : 'none';
      });
    });
  }
  var modEls = deckText.querySelectorAll('.mod');
  Array.prototype.forEach.call(modEls, function (m) {
    m.addEventListener('click', function () {
      m.classList.toggle('on');
      var sel = Array.prototype.filter.call(modEls, function (x) { return x.classList.contains('on'); });
      var p = sel.reduce(function (a, x) { return a + parseFloat(x.dataset.p); }, 0);
      var w = sel.reduce(function (a, x) { return a + parseFloat(x.dataset.w); }, 0);
      deckText.querySelector('.t-n').textContent = sel.length;
      deckText.querySelector('.t-p').textContent = p.toFixed(1);
      deckText.querySelector('.t-w').textContent = Math.round(w);
    });
  });

  // 统计条
  var statsEl = document.getElementById('stats');
  var subTotal = SYSTEMS.reduce(function (a, s) { return a + s.subs.length; }, 0);
  statsEl.innerHTML = [
    ['6', '层'],
    [String(SYSTEMS.length), '系统'],
    [String(subTotal), '子系统'],
    [String(MODULES.length), '模块']
  ].map(function (s) { return '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('');

  // 滚动激活
  var layerBlocks = deckText.querySelectorAll('.layer');
  var tickerFill = document.getElementById('tickerFill');
  var lastIdx = -1;

  function onScroll() {
    var mid = window.innerHeight * 0.52;
    var idx = 0;
    for (var i = 0; i < layerBlocks.length; i++) {
      var r = layerBlocks[i].getBoundingClientRect();
      if (r.top < mid) idx = i;
    }
    if (idx !== lastIdx) { setActive(idx); lastIdx = idx; }
    var max = document.body.scrollHeight - window.innerHeight;
    tickerFill.style.height = (max > 0 ? Math.min(1, window.scrollY / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------
     03 · 实验室：延迟跟踪
     ---------------------------------------------------------- */
  var canvas = document.getElementById('labCanvas');
  var ctx = canvas.getContext('2d');
  var labW = 0, labH = 0;
  var s1 = document.getElementById('s1'), s2 = document.getElementById('s2'), s3 = document.getElementById('s3');
  var v1 = document.getElementById('v1'), v2 = document.getElementById('v2'), v3 = document.getElementById('v3');
  var roLat = document.getElementById('roLat'), roErr = document.getElementById('roErr'), roState = document.getElementById('roState');
  var labVerdict = document.getElementById('labVerdict');

  var FIXED = 12;         // 执行 + 反馈
  var PERIOD = 1600;      // 目标往返周期 ms
  var AMP_MM = 90;        // 单侧行程 mm
  var history = [];

  function latency() { return (+s1.value) + (+s2.value) + (+s3.value) + FIXED; }

  function resizeCanvas() {
    var w = canvas.parentElement.clientWidth;
    var h = Math.max(210, Math.round(w * 0.42));
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    labW = w; labH = h;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function targetAt(t) {
    var cx = labW / 2;
    var amp = Math.min(labW * 0.36, 150);
    return cx + amp * Math.sin((t / PERIOD) * Math.PI * 2);
  }
  function ampPx() { return Math.min(labW * 0.36, 150); }

  function handAt(t, L) {
    var want = t - L;
    for (var i = history.length - 1; i >= 0; i--) {
      if (history[i].t <= want) return history[i].x;
    }
    return history.length ? history[0].x : targetAt(0);
  }

  var startT = performance.now();
  var lastReadout = 0;
  var smoothedErr = 0;

  function drawLab(now) {
    var t = now - startT;
    history.push({ t: t, x: targetAt(t) });
    if (history.length > 240) history.shift();

    var L = latency();
    var tx = targetAt(t);
    var hx = handAt(t, L);
    var cy = labH * 0.56;

    ctx.clearRect(0, 0, labW, labH);

    // 轨道
    ctx.strokeStyle = 'rgba(22,20,15,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(labW * 0.06, cy);
    ctx.lineTo(labW * 0.94, cy);
    ctx.stroke();

    // 刻度
    ctx.strokeStyle = 'rgba(22,20,15,0.08)';
    for (var gx = 0.06; gx <= 0.94; gx += 0.08) {
      ctx.beginPath();
      ctx.moveTo(labW * gx, cy - 5);
      ctx.lineTo(labW * gx, cy + 5);
      ctx.stroke();
    }

    // 手部残影：过去若干毫秒手所在的位置
    var ghostN = 16;
    for (var gi = Math.max(0, history.length - ghostN); gi < history.length; gi++) {
      var gx2 = handAt(history[gi].t, L);
      var ga = 0.03 + 0.18 * ((gi - (history.length - ghostN)) / ghostN);
      ctx.beginPath();
      ctx.arc(gx2, cy, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(44,106,88,' + Math.max(0.03, ga).toFixed(3) + ')';
      ctx.fill();
    }

    // 目标
    var tr = 9;
    ctx.beginPath();
    ctx.arc(tx, cy, tr + 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(99,56,138,0.10)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx, cy, tr, 0, Math.PI * 2);
    ctx.fillStyle = '#63388a';
    ctx.fill();

    // 偏差线
    ctx.beginPath();
    ctx.moveTo(hx, cy);
    ctx.lineTo(tx, cy);
    ctx.strokeStyle = 'rgba(194,101,33,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 手（滑柄式指针）
    ctx.beginPath();
    ctx.moveTo(hx, cy - 5);
    ctx.lineTo(hx - 8, cy - 20);
    ctx.lineTo(hx + 8, cy - 20);
    ctx.closePath();
    ctx.fillStyle = '#2c6a58';
    ctx.fill();

    // 读数
    var errPx = Math.abs(tx - hx);
    smoothedErr = smoothedErr * 0.85 + errPx * 0.15;

    if (now - lastReadout > 90) {
      lastReadout = now;
      roLat.textContent = L;
      roErr.textContent = Math.max(0, Math.round(smoothedErr / ampPx() * AMP_MM));
      var st, color, verdict;
      if (L < 60) {
        st = '跟随'; color = '#2c6a58';
        verdict = '和自己的身体差不多：你还没想，手已经到位。';
      } else if (L < 105) {
        st = '滞后'; color = '#c26521';
        verdict = '还能用，但快速动作开始落后半拍。精细操作要靠慢下来补偿。';
      } else if (L < 145) {
        st = '过冲'; color = '#c26521';
        verdict = '错过的目标不再等待：手开始画弧，冲过头再返回来。';
      } else {
        st = '振荡'; color = '#8e2f2f';
        verdict = '环路在振荡——你越纠正，它越抖。这就是延迟杀死控制增益的地方。';
      }
      roState.textContent = st;
      roState.style.color = color;
      labVerdict.textContent = verdict;
    }

    requestAnimationFrame(drawLab);
  }
  requestAnimationFrame(drawLab);

  [s1, s2, s3].forEach(function (s) {
    s.addEventListener('input', function () {
      v1.textContent = s1.value;
      v2.textContent = s2.value;
      v3.textContent = s3.value;
    });
  });
  v1.textContent = s1.value; v2.textContent = s2.value; v3.textContent = s3.value;

  /* ----------------------------------------------------------
     04 · 断链
     ---------------------------------------------------------- */
  var breakPicker = document.getElementById('breakPicker');
  var bLayer = document.getElementById('bLayer');
  var bLeft = document.getElementById('bLeft');
  var bMeter = document.getElementById('bMeter');
  var bSymptom = document.getElementById('bSymptom');
  var bEffect = document.getElementById('bEffect');
  var bTaker = document.getElementById('bTaker');

  breakPicker.innerHTML = BREAKS.map(function (b, i) {
    return '<button class="break-btn' + (i === 0 ? ' on' : '') + '" type="button" data-i="' + i + '"><span class="n">L' + (i + 1) + '</span>' + b.cn + '</button>';
  }).join('');

  function showBreak(i) {
    var b = BREAKS[i];
    bLayer.textContent = '第 ' + (i + 1) + ' 层 · ' + b.cn;
    bLeft.textContent = b.left;
    bMeter.style.width = b.left + '%';
    bMeter.style.background = b.left > 85 ? '#2c6a58' : (b.left > 70 ? '#c26521' : '#8e2f2f');
    bSymptom.textContent = b.symptom;
    bEffect.textContent = b.effect;
    bTaker.textContent = b.taker;
  }
  breakPicker.addEventListener('click', function (e) {
    var btn = e.target.closest('.break-btn');
    if (!btn) return;
    Array.prototype.forEach.call(breakPicker.children, function (x) { x.classList.remove('on'); });
    btn.classList.add('on');
    showBreak(+btn.dataset.i);
  });
  showBreak(0);

  /* ----------------------------------------------------------
     05 · 配置器
     ---------------------------------------------------------- */
  var buildChoices = document.getElementById('buildChoices');
  var presetsEl = document.getElementById('presets');
  var radarEl = document.getElementById('radar');
  var buildNums = document.getElementById('buildNums');
  var buildVerdict = document.getElementById('buildVerdict');
  var pick = {};

  buildChoices.innerHTML = BUILDER.map(function (cat) {
    return '<div class="cat" data-key="' + cat.key + '"><h4>' + cat.title + '</h4><div class="chips">' +
      cat.opts.map(function (o) {
        return '<button class="chip" type="button" data-key="' + cat.key + '" data-id="' + o.id + '">' + o.label + '</button>';
      }).join('') + '</div></div>';
  }).join('');

  presetsEl.innerHTML = PRESETS.map(function (p, i) {
    return '<button class="preset' + (i === 0 ? ' on' : '') + '" type="button" data-i="' + i + '">' + p.name + '</button>';
  }).join('');

  function setPick(p) {
    pick = JSON.parse(JSON.stringify(p));
    Array.prototype.forEach.call(buildChoices.querySelectorAll('.chip'), function (c) {
      c.classList.toggle('on', pick[c.dataset.key] === c.dataset.id);
    });
    renderBuild();
  }

  function optOf(key, id) {
    var cat = BUILDER.filter(function (c) { return c.key === key; })[0];
    return cat.opts.filter(function (o) { return o.id === id; })[0];
  }

  function fmt(n, d) {
    return (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }

  function renderBuild() {
    if (!pick.iface) return;
    var keys = ['iface', 'trans', 'dec', 'energy', 'exec'];
    var opts = keys.map(function (k) { return optOf(k, pick[k]); });

    var lat = opts.reduce(function (a, o) { return a + o.lat; }, 0);
    var bw = Math.min(opts[0].bw, opts[1].bw) + opts[2].bw;
    var pw = opts.reduce(function (a, o) { return a + o.pw; }, 0);
    var weight = opts.reduce(function (a, o) { return a + o.w; }, 0);
    var cap = optOf('energy', pick.energy).cap;
    var hours = cap / Math.max(0.5, pw);
    var risk = Math.max.apply(null, opts.map(function (o) { return o.risk; }));

    /* 五维评分：0–1，仅用于形状比较，不是绝对打分 */
    var scores = [
      Math.max(0.05, Math.min(1, (200 - lat) / 200)),          // 响应
      Math.max(0.05, Math.min(1, Math.log10(bw / 0.04) / Math.log10(10 / 0.04))), // 带宽（对数轴：0.04 Mbps 刚够 16 通道脑电，10 Mbps 视为满）
      Math.max(0.05, Math.min(1, hours / 8)),                  // 续航（8 h 视为够用）
      Math.max(0.05, Math.min(1, (6 - risk) / 5)),             // 舒适
      Math.max(0.05, Math.min(1, (7000 - weight) / 7000))      // 便携（7 kg 视为不可携）
    ];

    drawRadar(scores);

    /* 带宽跨三个数量级（0.04 → 46 Mbps），小于 1 Mbps 时按 kbps 显示 */
    var bwNum = bw < 1 ? String(Math.round(bw * 1000)) : fmt(bw, 1);
    var bwUnit = bw < 1 ? 'kbps' : 'Mbps';

    buildNums.innerHTML =
      '<div class="bn"><span>环路延迟</span><b>' + Math.round(lat) + '<i>ms</i></b></div>' +
      '<div class="bn"><span>数据带宽</span><b>' + bwNum + '<i>' + bwUnit + '</i></b></div>' +
      '<div class="bn"><span>续航</span><b>' + fmt(hours, 1) + '<i>h</i></b></div>' +
      '<div class="bn"><span>整机重量</span><b>' + fmt(weight / 1000, 2) + '<i>kg</i></b></div>' +
      '<div class="bn"><span>工作功耗</span><b>' + fmt(pw, 1) + '<i>W</i></b></div>' +
      '<div class="bn"><span>侵入性</span><b>' + risk + '<i>/5</i></b></div>';

    var tier = lat < 40 ? '直觉级' : (lat < 80 ? '可控' : (lat < 120 ? '迟滞明显' : '追不上'));
    var s = '这台系统的环路延迟 ' + Math.round(lat) + ' ms（' + tier + '），带宽 ' + bwNum + ' ' + bwUnit + '，整机 ' + fmt(weight / 1000, 2) + ' kg、工作功耗 ' + fmt(pw, 1) + ' W，' + fmt(cap, 1) + ' Wh 电池撑约 ' + fmt(hours, 1) + ' 小时，侵入性 ' + risk + '/5。';
    if (risk >= 4) {
      s += '为此你要接受一次手术，以及长期的生物相容性与感染风险。';
    } else if (weight > 2000) {
      s += '代价是 2 kg 以上的负重会反过来改变你的步态，外骨骼得先解决“背得动”这件事。';
    } else if (hours < 4) {
      s += '代价是续航只有几小时——现实中它退化成“用完就得插电”的工具。';
    } else if (lat > 90) {
      s += '代价是精细动作必须交给本地反射兜底，人能做的只剩下“下命令”。';
    } else {
      s += '这是可以日常使用的区间；代价写在带宽和自由度上——它救急，但不让你变强太多。';
    }
    buildVerdict.textContent = s;
  }

  function drawRadar(vals) {
    var cx = 160, cy = 158, R = 104, n = 5;
    var labels = ['响应', '带宽', '续航', '舒适', '便携'];
    function pt(i, v) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v];
    }
    var grid = '';
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var d = '';
      for (var i = 0; i < n; i++) {
        var p = pt(i, f);
        d += (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
      }
      d += 'Z';
      grid += '<path d="' + d + '" fill="none" stroke="#d9d0bd" stroke-width="1"/>';
    });
    var spokes = '';
    for (var j = 0; j < n; j++) {
      var q = pt(j, 1);
      spokes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '" stroke="#d9d0bd" stroke-width="1"/>';
    }
    var poly = vals.map(function (v, i) {
      var p = pt(i, v);
      return p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }).join(' ');
    var labs = labels.map(function (t, i) {
      var p = pt(i, 1.24);
      var anchor = (i === 0 || i === 4) ? 'middle' : (p[0] < cx ? 'end' : 'start');
      if (i === 3) anchor = 'start';
      return '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) + '" font-size="10" fill="#8b8272" text-anchor="' + anchor + '" font-family="PingFang SC, Microsoft YaHei, sans-serif">' + t + '</text>';
    }).join('');

    radarEl.innerHTML =
      '<defs><radialGradient id="rg" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#63388a" stop-opacity="0.30"/>' +
      '<stop offset="100%" stop-color="#63388a" stop-opacity="0.10"/></radialGradient></defs>' +
      grid + spokes +
      '<polygon points="' + poly + '" fill="url(#rg)" stroke="#63388a" stroke-width="1.5"/>' +
      vals.map(function (v, i) {
        var p = pt(i, v);
        return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3" fill="#63388a"/>';
      }).join('') +
      labs;
  }

  buildChoices.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    pick[chip.dataset.key] = chip.dataset.id;
    Array.prototype.forEach.call(presetsEl.children, function (x) { x.classList.remove('on'); });
    Array.prototype.forEach.call(buildChoices.querySelectorAll('.chip'), function (c) {
      c.classList.toggle('on', pick[c.dataset.key] === c.dataset.id);
    });
    renderBuild();
  });

  presetsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.preset');
    if (!b) return;
    Array.prototype.forEach.call(presetsEl.children, function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    setPick(PRESETS[+b.dataset.i].pick);
  });

  setPick(PRESETS[0].pick);

  /* 触屏/小屏：stack 点击滚动后需重新对齐 */
  window.addEventListener('orientationchange', function () { setTimeout(layoutLine, 300); });
})();
