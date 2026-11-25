/* ============================================================
   内嵌动画定义（无声，页面内手动播放 / 暂停 / 重置）
   每个 def: title, caption, viewBox, duration, loop, build(svg, el), render(t, refs)
   t ∈ [0,1]；render 按时间阈值点亮节点 / 驱动脉冲。
   ============================================================ */
(function () {
  'use strict';

  var INK = '#16140F', INK2 = '#4B453A', MUTED = '#8B8272', RULE = '#D9D0BD';
  var PURPLE = '#63388A', PURPLE_T = 'rgba(99,56,138,.10)', GREEN = '#2C6A58';
  var ORANGE = '#C26521', CREAM = '#FAF6EC', WHITE = '#FFFFFF';
  var SERIF = '"Songti SC","Noto Serif SC",serif', SANS = '"PingFang SC","Microsoft YaHei",sans-serif';

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function seg(t, a, b) { return clamp01((t - a) / (b - a)); }

  /* 通用：圆角节点（矩形 + 两行文字） */
  function makeNode(el, x, y, w, h, line1, line2, opts) {
    opts = opts || {};
    var g = el('g', {});
    var rect = el('rect', {
      x: x, y: y, width: w, height: h, rx: opts.rx || 10,
      fill: WHITE, stroke: RULE, 'stroke-width': 1.2
    });
    var t1 = el('text', { x: x + w / 2, y: y + h / 2 - (line2 ? 2 : -4), 'text-anchor': 'middle',
      'font-family': SANS, 'font-size': opts.fs || 12.5, 'font-weight': 600, fill: INK });
    t1.textContent = line1;
    g.appendChild(rect); g.appendChild(t1);
    var t2 = null;
    if (line2) {
      t2 = el('text', { x: x + w / 2, y: y + h / 2 + 15, 'text-anchor': 'middle',
        'font-family': SANS, 'font-size': 10.5, fill: MUTED });
      t2.textContent = line2;
      g.appendChild(t2);
    }
    return { g: g, rect: rect, t1: t1, t2: t2 };
  }

  function paintNode(node, on, color) {
    node.rect.setAttribute('fill', on ? PURPLE_T : WHITE);
    node.rect.setAttribute('stroke', on ? (color || PURPLE) : RULE);
    node.rect.setAttribute('stroke-width', on ? 1.6 : 1.2);
    node.t1.setAttribute('fill', on ? PURPLE : INK);
    if (node.t2) node.t2.setAttribute('fill', on ? PURPLE : MUTED);
  }

  /* 通用：箭头连线 */
  function arrow(el, x1, y1, x2, y2, dashed) {
    var l = el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: RULE, 'stroke-width': 1.4 });
    if (dashed) l.setAttribute('stroke-dasharray', '5 4');
    return l;
  }

  var DEFS = {};

  /* ---------- 1. 汇报路线：四步链路 ---------- */
  DEFS.roadmap = {
    title: '汇报链路 · 点击播放，逐段点亮',
    caption: '作业 1 给出结构与模块底数，作业 2 把诉求写成可追溯需求，作业 3 定架构并反推安全需求，作业 4 把系统放进场景与风险里检验。',
    viewBox: '0 0 640 170',
    duration: 5,
    build: function (svg, el) {
      var labels = [
        ['作业 1', '六层架构'], ['作业 2', 'BRS & StRS'],
        ['作业 3', 'SyRS · STPA'], ['作业 4', '场景 · 风险']
      ];
      var xs = [30, 190, 350, 510], w = 110, h = 64, y = 46;
      var nodes = labels.map(function (lb, i) {
        var n = makeNode(el, xs[i], y, w, h, lb[0], lb[1], { fs: 13 });
        svg.appendChild(n.g);
        return n;
      });
      var arrows = [];
      for (var i = 0; i < 3; i++) {
        var a = arrow(el, xs[i] + w, y + h / 2, xs[i + 1], y + h / 2);
        svg.appendChild(a); arrows.push(a);
      }
      return { nodes: nodes, arrows: arrows };
    },
    render: function (t, r) {
      r.nodes.forEach(function (n, i) {
        paintNode(n, t >= i * 0.22);
      });
      r.arrows.forEach(function (a, i) {
        var on = t >= (i + 1) * 0.22;
        a.setAttribute('stroke', on ? PURPLE : RULE);
        a.setAttribute('stroke-width', on ? 1.8 : 1.4);
      });
    }
  };

  /* ---------- 2. 系统闭环 ---------- */
  DEFS.loop = {
    title: '核心闭环 · 双轨感知—决策—执行—反馈',
    caption: '生物通道与人工通道并行取样，在边缘单元融合决策，双路执行后回采反馈；旁路监护并行监视，不串在主链路里。',
    viewBox: '0 0 640 350',
    duration: 6,
    build: function (svg, el) {
      var nodes = {};
      var defs = [
        ['env', '外部环境', '', 270, 24, 100, 44],
        ['bio', '原生感官', '生物通道', 110, 108, 130, 52],
        ['art', '机器传感', '人工通道', 400, 108, 130, 52],
        ['dec', '混合决策', '边缘单元', 270, 186, 130, 52],
        ['bioe', '人体通路', '残存肌肉', 110, 266, 130, 52],
        ['arte', '机器执行', '外骨骼 / 电刺激', 400, 266, 130, 52],
        ['body', '人体 · 训练动作', '', 270, 316, 130, 34]
      ];
      defs.forEach(function (d) {
        var n = makeNode(el, d[3], d[4], d[5], d[6], d[1], d[2], { fs: 12 });
        svg.appendChild(n.g); nodes[d[0]] = n;
      });
      var edges = [
        arrow(el, 320, 68, 175, 108), arrow(el, 320, 68, 465, 108),
        arrow(el, 175, 160, 300, 186), arrow(el, 465, 160, 340, 186),
        arrow(el, 300, 238, 175, 266), arrow(el, 340, 238, 465, 266),
        arrow(el, 175, 318, 300, 333), arrow(el, 465, 318, 340, 333)
      ];
      // 反馈回采曲线（左侧外圈）
      var fb = el('path', { d: 'M 270 333 C 60 330, 40 120, 110 118', fill: 'none', stroke: GREEN, 'stroke-width': 1.6, 'stroke-dasharray': '6 4' });
      svg.appendChild(fb);
      // 旁路监护
      var mon = el('g', {});
      var mrect = el('rect', { x: 566, y: 178, width: 60, height: 74, rx: 10, fill: CREAM, stroke: ORANGE, 'stroke-width': 1.4, 'stroke-dasharray': '5 4' });
      var mt = el('text', { x: 596, y: 208, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 11, fill: ORANGE });
      mt.textContent = '旁路';
      var mt2 = el('text', { x: 596, y: 224, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 11, fill: ORANGE });
      mt2.textContent = '监护';
      mon.appendChild(mrect); mon.appendChild(mt); mon.appendChild(mt2); svg.appendChild(mon);
      var watch = [
        arrow(el, 566, 196, 400, 196, true), arrow(el, 566, 226, 530, 266, true)
      ];
      watch.forEach(function (w) { w.setAttribute('stroke', ORANGE); svg.appendChild(w); });
      var pulse = el('circle', { r: 6, fill: ORANGE, opacity: 0 });
      svg.appendChild(pulse);
      return { nodes: nodes, edges: edges, fb: fb, pulse: pulse, watch: watch };
    },
    render: function (t, r) {
      var order = ['env', 'bio', 'art', 'dec', 'bioe', 'arte', 'body'];
      order.forEach(function (k, i) { paintNode(r.nodes[k], t >= i * 0.13); });
      r.fb.setAttribute('stroke-opacity', t > 0.7 ? 1 : 0.35);
      // 前向脉冲沿 env→dec→body 折线路径
      var pts = [[320, 68], [320, 130], [335, 186], [335, 260], [335, 333]];
      var p = seg(t, 0.1, 0.85) * (pts.length - 1);
      var i = Math.min(pts.length - 2, Math.floor(p));
      var f = p - i;
      var x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f;
      var y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
      r.pulse.setAttribute('cx', x); r.pulse.setAttribute('cy', y);
      r.pulse.setAttribute('opacity', t > 0.1 && t < 0.9 ? 1 : 0);
    }
  };

  /* ---------- 3. 六层嵌套 ---------- */
  DEFS.layers = {
    title: '六层嵌套 · 从任务到模块逐层展开',
    caption: '外层责任范围最大、尺度最粗；越往里越靠近可采购、可替换的具体器件。点击播放，从外向内逐层点亮。',
    viewBox: '0 0 360 360',
    duration: 5,
    build: function (svg, el) {
      var labels = ['L1 任务 Mission', 'L2 体系 SoS', 'L3 整机 Vehicle', 'L4 系统 System', 'L5 子系统 Subsystem', 'L6 模块 Module'];
      var sizes = [330, 288, 246, 204, 162, 120];
      var nodes = [];
      labels.forEach(function (lb, i) {
        var s = sizes[i];
        var x = (360 - s) / 2, y = (360 - s) / 2;
        var rect = el('rect', { x: x, y: y, width: s, height: s, rx: 14, fill: 'none', stroke: RULE, 'stroke-width': 1.2 });
        var tx = el('text', { x: x + 12, y: y + 22, 'font-family': SANS, 'font-size': 11.5, fill: MUTED });
        tx.textContent = lb;
        svg.appendChild(rect); svg.appendChild(tx);
        nodes.push({ rect: rect, tx: tx });
      });
      return { nodes: nodes };
    },
    render: function (t, r) {
      r.nodes.forEach(function (n, i) {
        var on = t >= i * 0.16;
        n.rect.setAttribute('stroke', on ? PURPLE : RULE);
        n.rect.setAttribute('stroke-width', on ? 1.8 : 1.2);
        n.rect.setAttribute('fill', on ? PURPLE_T : 'none');
        n.tx.setAttribute('fill', on ? PURPLE : MUTED);
      });
    }
  };

  /* ---------- 4. 模块点亮与累计 ---------- */
  DEFS.modules = {
    title: '模块清单 · 逐项点亮并累计重量 / 功耗',
    caption: '20 个硬件模块逐项相加；软件模块不单独计重计功耗。功耗为典型工作口径，重量含外壳、线缆与紧固件分摊。',
    viewBox: '0 0 640 300',
    duration: 6,
    build: function (svg, el) {
      var chips = [];
      var cols = 5, cw = 104, ch = 46, gx = 16, gy = 14;
      for (var i = 0; i < 20; i++) {
        var col = i % cols, row = Math.floor(i / cols);
        var x = 20 + col * (cw + gx), y = 20 + row * (ch + gy);
        var rect = el('rect', { x: x, y: y, width: cw, height: ch, rx: 8, fill: WHITE, stroke: RULE });
        var tx = el('text', { x: x + cw / 2, y: y + ch / 2 + 4, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 10.5, fill: MUTED });
        tx.textContent = '模块 ' + (i + 1);
        svg.appendChild(rect); svg.appendChild(tx);
        chips.push({ rect: rect, tx: tx });
      }
      var tally = el('text', { x: 320, y: 272, 'text-anchor': 'middle', 'font-family': '"SFMono-Regular",Consolas,monospace', 'font-size': 15, fill: INK });
      svg.appendChild(tally);
      return { chips: chips, tally: tally };
    },
    render: function (t, r) {
      var n = Math.round(t * 20);
      r.chips.forEach(function (c, i) {
        var on = i < n;
        c.rect.setAttribute('fill', on ? PURPLE_T : WHITE);
        c.rect.setAttribute('stroke', on ? PURPLE : RULE);
        c.tx.setAttribute('fill', on ? PURPLE : MUTED);
      });
      var w = (2.43 * t).toFixed(2), p = (29.0 * t).toFixed(1);
      r.tally.textContent = '已点亮 ' + n + ' / 20 个模块　·　累计约 ' + w + ' kg　·　典型功耗约 ' + p + ' W';
    }
  };

  /* ---------- 5. OpsCon 六步回合 ---------- */
  DEFS.opscon = {
    title: '运行回合 · 六步时序循环',
    caption: '一次训练回合：两路感知并行汇入决策，双路输出驱动执行，结果反作用于环境并回采；旁路监护全程校验，全程留痕。',
    viewBox: '0 0 640 260',
    duration: 6,
    loop: true,
    build: function (svg, el) {
      var steps = ['多源感知并行采集', '汇入混合决策单元', '双路指令输出', '执行反作用于环境', '旁路监控持续校验', '全程记录留痕'];
      var pos = [[30, 30], [225, 30], [420, 30], [420, 130], [225, 130], [30, 130]];
      var nodes = steps.map(function (s, i) {
        var n = makeNode(el, pos[i][0], pos[i][1], 190, 64, String(i + 1), s, { fs: 11.5 });
        svg.appendChild(n.g); return n;
      });
      var arrows = [];
      var pairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]];
      pairs.forEach(function (pr) {
        var a = arrow(el, pos[pr[0]][0] + 95, pos[pr[0]][1] + 32, pos[pr[1]][0] + 95, pos[pr[1]][1] + 32);
        svg.appendChild(a); arrows.push(a);
      });
      return { nodes: nodes, arrows: arrows };
    },
    render: function (t, r) {
      r.nodes.forEach(function (n, i) { paintNode(n, t >= i * 0.16); });
      r.arrows.forEach(function (a, i) {
        a.setAttribute('stroke', t >= (i + 1) * 0.16 ? PURPLE : RULE);
      });
    }
  };

  /* ---------- 6. 状态机 ---------- */
  DEFS.states = {
    title: '运行状态 · 模式切换与降级路径',
    caption: '自检通过后进入训练模式；置信度不足降为有限辅助，主动退出或安全切断回纯自主；越界时递进降级，失效默认回无增强状态。',
    viewBox: '0 0 640 300',
    duration: 6,
    build: function (svg, el) {
      var defs = [
        ['自检待机', 30, 120, 120, 56],
        ['主动辅助', 200, 120, 120, 56],
        ['有限辅助', 370, 50, 120, 56],
        ['纯自主', 370, 190, 120, 56],
        ['告警降级', 200, 220, 120, 56],
        ['故障安全', 520, 120, 100, 56]
      ];
      var nodes = defs.map(function (d) {
        var n = makeNode(el, d[1], d[2], d[3], d[4], d[0], '', { fs: 12 });
        svg.appendChild(n.g); return n;
      });
      var edges = [
        arrow(el, 150, 148, 200, 148), arrow(el, 320, 138, 370, 80),
        arrow(el, 320, 158, 370, 218), arrow(el, 260, 176, 260, 220),
        arrow(el, 320, 248, 520, 160), arrow(el, 490, 78, 520, 130, true)
      ];
      edges.forEach(function (e) { svg.appendChild(e); });
      return { nodes: nodes, edges: edges };
    },
    render: function (t, r) {
      var order = [0, 1, 2, 3, 4, 5];
      var thr = [0.06, 0.24, 0.42, 0.58, 0.76, 0.9];
      order.forEach(function (k, i) { paintNode(r.nodes[k], t >= thr[i], i >= 4 ? ORANGE : PURPLE); });
      r.edges.forEach(function (e, i) {
        e.setAttribute('stroke', t >= thr[Math.min(i + 1, thr.length - 1)] ? PURPLE : RULE);
      });
    }
  };

  /* ---------- 7. 控制框图 ---------- */
  DEFS.control = {
    title: '控制框图 · 前向链路 / 反馈链路 / 旁路监护',
    caption: '前向链路由环境到执行；反馈链路把本体感觉、IMU 与力反馈回采到采集端；旁路监护并行监视三段，物理急停以硬线直达切断回路。',
    viewBox: '0 0 640 320',
    duration: 6,
    build: function (svg, el) {
      var labels = ['外部环境', '双轨感知', '采集预处理', '混合决策', '双路执行', '人体 / 环境'];
      var nodes = labels.map(function (lb, i) {
        var x = 24 + i * 104;
        var n = makeNode(el, x, 110, 92, 58, lb, '', { fs: 11 });
        svg.appendChild(n.g); return n;
      });
      var edges = [];
      for (var i = 0; i < 5; i++) {
        var a = arrow(el, 24 + i * 104 + 92, 139, 24 + (i + 1) * 104, 139);
        svg.appendChild(a); edges.push(a);
      }
      var fb = el('path', { d: 'M 580 168 C 560 250, 80 250, 70 168', fill: 'none', stroke: GREEN, 'stroke-width': 1.6, 'stroke-dasharray': '6 4' });
      svg.appendChild(fb);
      var mon = el('rect', { x: 230, y: 26, width: 180, height: 44, rx: 10, fill: CREAM, stroke: ORANGE, 'stroke-width': 1.4, 'stroke-dasharray': '5 4' });
      var mt = el('text', { x: 320, y: 53, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 12, fill: ORANGE });
      mt.textContent = '安全监护 · 旁路并行监视';
      svg.appendChild(mon); svg.appendChild(mt);
      var watch = [arrow(el, 280, 70, 160, 110, true), arrow(el, 320, 70, 320, 110, true), arrow(el, 360, 70, 500, 110, true)];
      watch.forEach(function (w) { w.setAttribute('stroke', ORANGE); svg.appendChild(w); });
      var stop = el('g', {});
      var sr = el('rect', { x: 560, y: 220, width: 64, height: 40, rx: 8, fill: WHITE, stroke: ORANGE });
      var st = el('text', { x: 592, y: 245, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 11, fill: ORANGE });
      st.textContent = '硬线急停';
      stop.appendChild(sr); stop.appendChild(st); svg.appendChild(stop);
      var pulse = el('circle', { r: 5.5, fill: ORANGE, opacity: 0 });
      svg.appendChild(pulse);
      return { nodes: nodes, edges: edges, fb: fb, pulse: pulse, watch: watch };
    },
    render: function (t, r) {
      r.nodes.forEach(function (n, i) { paintNode(n, t >= i * 0.14); });
      r.edges.forEach(function (a, i) { a.setAttribute('stroke', t >= (i + 1) * 0.14 ? PURPLE : RULE); });
      r.fb.setAttribute('stroke-opacity', t > 0.65 ? 1 : 0.35);
      var p = seg(t, 0.1, 0.8) * 5;
      var i = Math.min(4, Math.floor(p)), f = p - i;
      var x1 = 24 + i * 104 + 92, x2 = 24 + (i + 1) * 104;
      r.pulse.setAttribute('cx', x1 + (x2 - x1) * f); r.pulse.setAttribute('cy', 139);
      r.pulse.setAttribute('opacity', t > 0.1 && t < 0.85 ? 1 : 0);
    }
  };

  /* ---------- 8. STPA 派生链 ---------- */
  DEFS.stpa = {
    title: 'STPA 派生链 · 损失 → 危险 → UCA → 安全需求',
    caption: '先确定不可接受的损失，再定位系统危险与不安全控制动作，分析致因场景后反向派生安全需求，逐条落实到架构组件。',
    viewBox: '0 0 640 280',
    duration: 6,
    build: function (svg, el) {
      var cols = [
        ['损失 L', '人身伤害 · 体征失稳', '失控误动作 · 组织损伤', '数据泄露 · 丧失行动能力'],
        ['危险 H', '出力越界 · 错误意图', '反馈失真 · 监护失效', '电气失效 · 断链无兜底'],
        ['不安全控制动作 UCA', '未提供 / 提供不当', '时序顺序错误', '停止过早 / 持续过久'],
        ['安全需求 SSR', '硬件限幅 · 置信度门控', '反馈超时冻结 · 冗余切换', '独立旁路 · fail-safe · 留痕']
      ];
      var groups = cols.map(function (c, ci) {
        var x = 20 + ci * 156, g = el('g', {});
        var head = el('rect', { x: x, y: 30, width: 140, height: 38, rx: 9, fill: WHITE, stroke: RULE });
        var ht = el('text', { x: x + 70, y: 54, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 12, 'font-weight': 600, fill: INK });
        ht.textContent = c[0];
        g.appendChild(head); g.appendChild(ht);
        var items = c.slice(1).map(function (txt, ri) {
          var box = el('rect', { x: x, y: 86 + ri * 52, width: 140, height: 42, rx: 8, fill: CREAM, stroke: RULE });
          var bt = el('text', { x: x + 70, y: 111 + ri * 52, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 10.5, fill: INK2 });
          bt.textContent = txt;
          g.appendChild(box); g.appendChild(bt);
          return { box: box, bt: bt };
        });
        svg.appendChild(g);
        return { head: head, ht: ht, items: items };
      });
      var links = [];
      for (var k = 0; k < 3; k++) {
        var l = arrow(el, 20 + k * 156 + 140, 50, 20 + (k + 1) * 156, 50);
        svg.appendChild(l); links.push(l);
      }
      return { groups: groups, links: links };
    },
    render: function (t, r) {
      var thr = [0.12, 0.36, 0.6, 0.84];
      r.groups.forEach(function (g, i) {
        var on = t >= thr[i];
        g.head.setAttribute('fill', on ? PURPLE_T : WHITE);
        g.head.setAttribute('stroke', on ? PURPLE : RULE);
        g.ht.setAttribute('fill', on ? PURPLE : INK);
        g.items.forEach(function (it) {
          it.box.setAttribute('stroke', on ? PURPLE : RULE);
          it.box.setAttribute('fill', on ? WHITE : CREAM);
        });
      });
      r.links.forEach(function (l, i) {
        l.setAttribute('stroke', t >= thr[i + 1] ? PURPLE : RULE);
      });
    }
  };

  /* ---------- 9. 场景四层 ---------- */
  DEFS.scenes = {
    title: '场景分层 · 由使命到交互逐级收敛',
    caption: '上层场景约束下层的目标与边界，下层把上层目标落到可观察、可验证的具体动作；风险场景从交互层的偏离路径中识别。',
    viewBox: '0 0 360 340',
    duration: 5,
    build: function (svg, el) {
      var rows = [
        ['S1 使命层', '康复目标 · 生活回归 · 医疗社会环境', 300],
        ['S2 环境层', '诊室 · 社区站 · 家庭居所', 252],
        ['S3 任务层', '评估 · 助动 · 辅助 · 抗阻 · 代偿', 204],
        ['S4 交互层', '自检 · 采集 · 出力 · 回采 · 退出', 184]
      ];
      var bands = rows.map(function (r, i) {
        var w = r[2], x = (360 - w) / 2, y = 24 + i * 78;
        var rect = el('rect', { x: x, y: y, width: w, height: 58, rx: 10, fill: WHITE, stroke: RULE });
        var t1 = el('text', { x: x + 16, y: y + 25, 'font-family': SANS, 'font-size': 12.5, 'font-weight': 600, fill: INK });
        t1.textContent = r[0];
        var t2 = el('text', { x: x + 16, y: y + 43, 'font-family': SANS, 'font-size': 10.5, fill: MUTED });
        t2.textContent = r[1];
        svg.appendChild(rect); svg.appendChild(t1); svg.appendChild(t2);
        var arrowDown = i < 3 ? el('text', { x: 180, y: y + 74, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 12, fill: MUTED }) : null;
        if (arrowDown) { arrowDown.textContent = '↓'; svg.appendChild(arrowDown); }
        return { rect: rect, t1: t1, t2: t2 };
      });
      return { bands: bands };
    },
    render: function (t, r) {
      r.bands.forEach(function (b, i) {
        var on = t >= i * 0.22;
        b.rect.setAttribute('fill', on ? PURPLE_T : WHITE);
        b.rect.setAttribute('stroke', on ? PURPLE : RULE);
        b.t1.setAttribute('fill', on ? PURPLE : INK);
      });
    }
  };

  /* ---------- 10. 典型回合时间线 ---------- */
  DEFS.turn = {
    title: '典型回合 · 居家主动辅助抓握训练五步',
    caption: '从佩戴自检到安全退出：意图低于阈值只给提示；仲裁后在患者发力基础上补足缺口力矩；反馈回采与旁路监视并行；结束后执行器退回安全位姿。',
    viewBox: '0 0 640 190',
    duration: 6,
    loop: true,
    build: function (svg, el) {
      var steps = [
        ['① 佩戴与自检', '电极 · 电量 · 链路'],
        ['② 意图采集确认', '肌电 · 角度 · 置信度'],
        ['③ 仲裁辅助出力', '补足缺口力矩'],
        ['④ 反馈回采监视', 'IMU · 力反馈 · 旁路'],
        ['⑤ 结束安全退出', '退回位姿 · 记录']
      ];
      var nodes = steps.map(function (s, i) {
        var x = 20 + i * 124;
        var g = el('g', {});
        var dot = el('circle', { cx: x + 46, cy: 44, r: 8, fill: WHITE, stroke: RULE, 'stroke-width': 1.6 });
        var t1 = el('text', { x: x + 46, y: 86, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 11.5, 'font-weight': 600, fill: INK });
        t1.textContent = s[0];
        var t2 = el('text', { x: x + 46, y: 106, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 10, fill: MUTED });
        t2.textContent = s[1];
        g.appendChild(dot); g.appendChild(t1); g.appendChild(t2); svg.appendChild(g);
        return { dot: dot, t1: t1, t2: t2 };
      });
      var line = el('line', { x1: 66, y1: 44, x2: 574, y2: 44, stroke: RULE, 'stroke-width': 1.6 });
      svg.insertBefore(line, svg.firstChild);
      var arrows = [];
      for (var i = 0; i < 4; i++) {
        var a = arrow(el, 20 + i * 124 + 54, 44, 20 + (i + 1) * 124 + 38, 44);
        svg.appendChild(a); arrows.push(a);
      }
      return { nodes: nodes, arrows: arrows, line: line };
    },
    render: function (t, r) {
      r.nodes.forEach(function (n, i) {
        var on = t >= i * 0.18;
        n.dot.setAttribute('fill', on ? PURPLE : WHITE);
        n.dot.setAttribute('stroke', on ? PURPLE : RULE);
        n.t1.setAttribute('fill', on ? PURPLE : INK);
      });
      r.arrows.forEach(function (a, i) {
        a.setAttribute('stroke', t >= (i + 1) * 0.18 ? PURPLE : RULE);
      });
    }
  };

  window.DECK_FIGURES = DEFS;
})();
