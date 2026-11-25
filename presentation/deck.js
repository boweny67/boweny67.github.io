/* ============================================================
   演示稿逻辑：翻页导航 + 内嵌无声动画播放器
   - 翻页：← → / 空格 / 按钮 / F 全屏
   - 动画：Canvas 手绘帧，静音，点播放键在页内播放，不弹出外部播放器
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 幻灯片导航 ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var stage = document.getElementById("stage");
  var bar = document.getElementById("progressBar");
  var pageLabel = document.getElementById("pageLabel");
  var chapterLabel = document.getElementById("chapterLabel");
  var current = 0;
  var players = [];

  function render() {
    slides.forEach(function (s, i) {
      s.classList.toggle("active", i === current);
    });
    var pct = ((current + 1) / slides.length) * 100;
    bar.style.width = pct + "%";
    pageLabel.textContent = String(current + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
    chapterLabel.textContent = slides[current].dataset.title || "";
    // 切走的动画暂停，切回的动画停在首帧；隐藏态下画布尺寸为 0，切回时补算一次
    players.forEach(function (pl) {
      if (pl.slideIndex === current) { pl.size(); pl.hold(); } else { pl.stop(); }
    });
  }

  function go(i) {
    current = Math.max(0, Math.min(slides.length - 1, i));
    render();
    if (history.replaceState) history.replaceState(null, "", "#slide-" + (current + 1));
  }
  // 支持 #slide-N 直接定位到某一页
  var m = (location.hash || "").match(/slide-(\d+)/);
  if (m) current = Math.max(0, Math.min(slides.length - 1, parseInt(m[1], 10) - 1));
  document.getElementById("btnPrev").addEventListener("click", function () { go(current - 1); });
  document.getElementById("btnNext").addEventListener("click", function () { go(current + 1); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(current + 1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(current - 1); }
    else if (e.key === "Home") { go(0); }
    else if (e.key === "End") { go(slides.length - 1); }
    else if (e.key === "f" || e.key === "F") { toggleFull(); }
  });

  function toggleFull() {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
    else { document.exitFullscreen && document.exitFullscreen(); }
  }
  document.getElementById("btnFull").addEventListener("click", toggleFull);

  /* ============================================================
     动画播放器
     每个 anim-frame：<canvas> + 控制条（播放/暂停/重播 + 说明 + 状态）
     ============================================================ */
  var PAL = {
    ink: "#16140f", ink2: "#4b453a", muted: "#8b8272", rule: "#d9d0bd",
    purple: "#63388a", purpleSoft: "#ac8cc6", green: "#2c6a58", greenSoft: "#8ab3a4",
    orange: "#c26521", cream: "#faf6ec", light: "#faf6ec", dark: "#131109"
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- 动画注册表：draw(ctx, t, w, h, helpers) ---------- */
  var ANIMS = {

    /* 1. 双轨并行：生物 / 人工两条通道在三段融合 */
    "dual-track": {
      dur: 4200,
      draw: function (ctx, t, w, h, pl) {
        var txtMain = pl.isDark ? PAL.light : PAL.ink;
        var txtSub = pl.isDark ? "rgba(250,246,236,.8)" : PAL.ink2;
        var mx = w * 0.12, my = h * 0.18, mw = w * 0.76, mh = h * 0.6;
        var stages = ["感知", "决策", "执行"];
        var xs = [mx, mx + mw / 2, mx + mw];
        // 三段分隔
        ctx.font = "12px " + getMono();
        stages.forEach(function (s, i) {
          ctx.fillStyle = PAL.muted;
          ctx.textAlign = "center";
          ctx.fillText(s, xs[i], my - 12);
        });
        var bioY = my + mh * 0.28, artY = my + mh * 0.72;
        // 通道基线
        ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1.5;
      line(ctx, mx, bioY, mx + mw, bioY); line(ctx, mx, artY, mx + mw, artY);
        // 标签
        ctx.textAlign = "right"; ctx.fillStyle = txtSub; ctx.font = "13px " + getSans();
        ctx.fillText("生物通道", mx - 10, bioY + 4);
        ctx.fillText("人工通道", mx - 10, artY + 4);
        // 节点逐段点亮，脉冲沿线走
        var seg = Math.min(2, Math.floor(t * 3));
        for (var i = 0; i < 3; i++) {
          var on = i <= seg;
          [bioY, artY].forEach(function (y, k) {
            ctx.beginPath();
            ctx.arc(xs[i], y, on ? 9 : 6, 0, Math.PI * 2);
            ctx.fillStyle = on ? (k === 0 ? PAL.green : PAL.purple) : "#fff";
            ctx.fill();
            ctx.strokeStyle = on ? (k === 0 ? PAL.green : PAL.purple) : PAL.rule;
            ctx.lineWidth = 1.5; ctx.stroke();
          });
          // 融合竖线
          if (on) {
            ctx.strokeStyle = PAL.purpleSoft; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
            line(ctx, xs[i], bioY, xs[i], artY); ctx.setLineDash([]);
          }
        }
        // 行进脉冲
        var px = mx + mw * t;
        [bioY, artY].forEach(function (y, k) {
          ctx.beginPath(); ctx.arc(px, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = k === 0 ? PAL.greenSoft : PAL.purpleSoft; ctx.fill();
        });
        // 融合结论
        ctx.textAlign = "center"; ctx.fillStyle = txtMain; ctx.font = "14px " + getSerif();
        ctx.fillText("两路在感知—决策—执行三段并行融合", w / 2, my + mh + 34);
      }
    },

    /* 2. 六层结构：L1→L6 逐层点亮 */
    "six-layers": {
      dur: 4000,
      draw: function (ctx, t, w, h) {
        var layers = [
          ["L1", "任务 Mission", "人生 · 年"],
          ["L2", "体系 SoS", "房间 · 城市"],
          ["L3", "整机 Vehicles", "人 · 米"],
          ["L4", "系统 Systems", "分米 · 厘米"],
          ["L5", "子系统 Sub-systems", "厘米 · 毫米"],
          ["L6", "模块 Modules", "毫米 · 微米"]
        ];
        var top = h * 0.12, bh = h * 0.125, gap = h * 0.02;
        var bw = w * 0.8, bx = (w - bw) / 2;
        var active = Math.min(layers.length, Math.floor(t * layers.length) + 1);
        layers.forEach(function (l, i) {
          var y = top + i * (bh + gap);
          var on = i < active;
          ctx.beginPath(); roundRect(ctx, bx, y, bw, bh, 8);
          ctx.fillStyle = on ? "rgba(99,56,138,.10)" : "rgba(0,0,0,.03)"; ctx.fill();
          ctx.strokeStyle = on ? PAL.purple : PAL.rule; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.textAlign = "left";
          ctx.fillStyle = on ? PAL.purple : PAL.muted; ctx.font = "bold 13px " + getMono();
          ctx.fillText(l[0], bx + 18, y + bh / 2 + 4);
          ctx.fillStyle = on ? PAL.ink : PAL.ink2; ctx.font = "14px " + getSerif();
          ctx.fillText(l[1], bx + 70, y + bh / 2 + 4);
          ctx.textAlign = "right"; ctx.fillStyle = PAL.muted; ctx.font = "12px " + getMono();
          ctx.fillText(l[2], bx + bw - 18, y + bh / 2 + 4);
        });
      }
    },

    /* 3. 环路延迟：目标移动，指针带滞后追赶，偏差随 t 增大 */
    "loop-delay": {
      dur: 6000,
      draw: function (ctx, t, w, h) {
        var cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.28;
        // 底圆轨迹
        ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        var ta = t * Math.PI * 3;
        var tx = cx + Math.cos(ta) * R, ty = cy + Math.sin(ta) * R;
        // 滞后量随 t 增大（0 → 大）
        var lag = t * 1.6;
        var pa = ta - lag;
        var px = cx + Math.cos(pa) * R, py = cy + Math.sin(pa) * R;
        // 偏差线
        ctx.strokeStyle = PAL.orange; ctx.lineWidth = 1.5; line(ctx, tx, ty, px, py);
        // 目标
        ctx.beginPath(); ctx.arc(tx, ty, 9, 0, Math.PI * 2);
        ctx.fillStyle = PAL.purple; ctx.fill();
        // 指针
        ctx.beginPath(); ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.fillStyle = PAL.green; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
        // 状态
        var state, col;
        if (t < 0.35) { state = "跟随"; col = PAL.green; }
        else if (t < 0.6) { state = "滞后"; col = PAL.orange; }
        else { state = "过冲 / 振荡"; col = "#a33"; }
        ctx.textAlign = "center"; ctx.font = "14px " + getSans(); ctx.fillStyle = col;
        ctx.fillText("状态：" + state, w / 2, h - 22);
        ctx.font = "12px " + getMono(); ctx.fillStyle = PAL.muted;
        ctx.fillText("延迟随时间增大，指针逐渐追不上目标", w / 2, 26);
      }
    },

    /* 4. OpsCon 闭环：五节点循环，监护旁路在侧 */
    "opscon-loop": {
      dur: 5000,
      draw: function (ctx, t, w, h) {
        var nodes = ["多源感知", "混合决策", "双路指令", "执行出力", "反馈回采"];
        var cx = w * 0.42, cy = h * 0.52, R = Math.min(w, h) * 0.3;
        var pts = nodes.map(function (_, i) {
          var a = -Math.PI / 2 + i * (Math.PI * 2 / nodes.length);
          return [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
        });
        // 环
        ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1.5;
        ctx.beginPath();
        pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
        ctx.closePath(); ctx.stroke();
        // 脉冲沿环移动
        var pi = t * nodes.length;
        var i0 = Math.floor(pi) % nodes.length, i1 = (i0 + 1) % nodes.length;
        var f = pi % 1;
        var q = [pts[i0][0] + (pts[i1][0] - pts[i0][0]) * f, pts[i0][1] + (pts[i1][1] - pts[i0][1]) * f];
        nodes.forEach(function (n, i) {
          var on = i <= Math.floor(pi) % nodes.length || t > 0.99;
          ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 20, 0, Math.PI * 2);
          ctx.fillStyle = on ? "rgba(44,106,88,.12)" : "#fff"; ctx.fill();
          ctx.strokeStyle = PAL.green; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.textAlign = "center"; ctx.fillStyle = PAL.ink; ctx.font = "12px " + getSans();
          ctx.fillText(n, pts[i][0], pts[i][1] + 38);
        });
        ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, Math.PI * 2);
        ctx.fillStyle = PAL.orange; ctx.fill();
        // 旁路监护
        var mx = w * 0.82;
        ctx.strokeStyle = PAL.purpleSoft; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        line(ctx, mx, h * 0.25, mx, h * 0.75); ctx.setLineDash([]);
        ctx.textAlign = "center"; ctx.fillStyle = PAL.purple; ctx.font = "12px " + getSans();
        ctx.save(); ctx.translate(mx, h * 0.5); ctx.rotate(Math.PI / 2);
        ctx.fillText("安全监护 · 旁路并行", 0, 4); ctx.restore();
      }
    },

    /* 5. 状态流转：主动辅助为主线，异常逐级降级 */
    "state-flow": {
      dur: 4600,
      draw: function (ctx, t, w, h) {
        var main = ["自检待机", "主动辅助"];
        var subs = ["有限辅助", "纯自主", "告警降级", "故障安全"];
        var y0 = h * 0.26;
        var x1 = w * 0.2, x2 = w * 0.5;
        node(ctx, x1, y0, main[0], t > 0.05, PAL.purple);
        arrow(ctx, x1 + 46, y0, x2 - 46, y0, t > 0.25);
        node(ctx, x2, y0, main[1], t > 0.3, PAL.green);
        var sx = w * 0.8;
        subs.forEach(function (s, i) {
          var yy = h * 0.55 + i * (h * 0.11);
          var on = t > 0.5 + i * 0.1;
          arrow(ctx, x2, y0 + 18, sx - 30, yy - 6, on);
          ctx.beginPath(); ctx.arc(sx, yy, 18, 0, Math.PI * 2);
          ctx.fillStyle = on ? "rgba(194,101,33,.1)" : "#fff"; ctx.fill();
          ctx.strokeStyle = on ? PAL.orange : PAL.rule; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.textAlign = "right"; ctx.fillStyle = on ? PAL.ink : PAL.muted;
          ctx.font = "12px " + getSans();
          ctx.fillText(s, sx - 30, yy + 4);
        });
        ctx.textAlign = "center"; ctx.fillStyle = PAL.muted; ctx.font = "12px " + getMono();
        ctx.fillText("异常时逐级降级，默认回到无增强状态", w / 2, h - 20);
      }
    },

    /* 6. STPA 控制回路 + 独立监护 */
    "stpa-loop": {
      dur: 5000,
      draw: function (ctx, t, w, h) {
        var cx = w * 0.44, cy = h * 0.5, R = Math.min(w, h) * 0.28;
        var labels = ["控制器", "执行器", "被控对象", "传感器"];
        var pts = labels.map(function (_, i) {
          var a = -Math.PI / 2 + i * Math.PI / 2;
          return [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
        });
        ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1.5;
        ctx.beginPath(); pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
        ctx.closePath(); ctx.stroke();
        var pi = t * 4, i0 = Math.floor(pi) % 4, f = pi % 1, i1 = (i0 + 1) % 4;
        var q = [pts[i0][0] + (pts[i1][0] - pts[i0][0]) * f, pts[i0][1] + (pts[i1][1] - pts[i0][1]) * f];
        labels.forEach(function (n, i) {
          ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 22, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(99,56,138,.1)"; ctx.fill();
          ctx.strokeStyle = PAL.purple; ctx.stroke();
          ctx.textAlign = "center"; ctx.fillStyle = PAL.ink; ctx.font = "12px " + getSans();
          ctx.fillText(n, pts[i][0], pts[i][1] + 40);
        });
        ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, Math.PI * 2); ctx.fillStyle = PAL.orange; ctx.fill();
        // 独立监护旁路
        var mx = w * 0.84;
        ctx.strokeStyle = PAL.purpleSoft; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        line(ctx, mx, h * 0.22, mx, h * 0.78); ctx.setLineDash([]);
        ctx.textAlign = "center"; ctx.save(); ctx.translate(mx, h * 0.5); ctx.rotate(Math.PI / 2);
        ctx.fillStyle = PAL.purple; ctx.font = "12px " + getSans();
        ctx.fillText("监护旁路 · 独立自检", 0, 4); ctx.restore();
      }
    },

    /* 7. 场景四层：S1→S4 自上而下 */
    "scenario-layers": {
      dur: 3800,
      draw: function (ctx, t, w, h) {
        var rows = [
          ["S1", "使命层", "康复目标 · 生活回归 · 医疗体系"],
          ["S2", "环境层", "诊室 · 社区站 · 家庭居所"],
          ["S3", "任务层", "评估 · 被动助动 · 主动辅助 · 抗阻 · 代偿"],
          ["S4", "交互层", "自检 · 意图采集 · 出力 · 反馈 · 记录退出"]
        ];
        var top = h * 0.14, bh = h * 0.16, gap = h * 0.045;
        var bw = w * 0.82, bx = (w - bw) / 2;
        var active = Math.min(rows.length, Math.floor(t * rows.length) + 1);
        rows.forEach(function (r, i) {
          var y = top + i * (bh + gap), on = i < active;
          ctx.beginPath(); roundRect(ctx, bx, y, bw, bh, 8);
          ctx.fillStyle = on ? "rgba(44,106,88,.09)" : "rgba(0,0,0,.03)"; ctx.fill();
          ctx.strokeStyle = on ? PAL.green : PAL.rule; ctx.stroke();
          ctx.textAlign = "left"; ctx.fillStyle = on ? PAL.green : PAL.muted;
          ctx.font = "bold 13px " + getMono(); ctx.fillText(r[0], bx + 18, y + bh / 2 + 4);
          ctx.fillStyle = PAL.ink; ctx.font = "14px " + getSerif(); ctx.fillText(r[1], bx + 66, y + bh / 2 + 4);
          ctx.textAlign = "right"; ctx.fillStyle = PAL.ink2; ctx.font = "12px " + getSans();
          ctx.fillText(r[2], bx + bw - 18, y + bh / 2 + 4);
        });
      }
    },

    /* 8. 典型回合：五步横向时间线 */
    "grasp-turn": {
      dur: 5200,
      draw: function (ctx, t, w, h) {
        var steps = ["佩戴与自检", "意图采集", "混合仲裁出力", "反馈回采监视", "结束安全退出"];
        var y = h * 0.5, pad = w * 0.08;
        var xs = steps.map(function (_, i) { return pad + (w - pad * 2) * (i / (steps.length - 1)); });
        ctx.strokeStyle = PAL.rule; ctx.lineWidth = 2; line(ctx, pad, y, w - pad, y);
        var prog = t * (steps.length - 1);
        steps.forEach(function (s, i) {
          var on = i <= prog;
          ctx.beginPath(); ctx.arc(xs[i], y, 14, 0, Math.PI * 2);
          ctx.fillStyle = on ? PAL.purple : "#fff"; ctx.fill();
          ctx.strokeStyle = PAL.purple; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.textAlign = "center"; ctx.fillStyle = on ? PAL.ink : PAL.muted;
          ctx.font = "12.5px " + getSans();
          ctx.fillText(s, xs[i], y + 34);
          ctx.fillStyle = PAL.muted; ctx.font = "11px " + getMono();
          ctx.fillText("0" + (i + 1), xs[i], y - 22);
        });
        var px = pad + (w - pad * 2) * Math.min(1, prog / (steps.length - 1));
        ctx.beginPath(); ctx.arc(px, y, 6, 0, Math.PI * 2); ctx.fillStyle = PAL.orange; ctx.fill();
      }
    }
  };

  /* ---------- 小工具 ---------- */
  function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function arrow(ctx, x1, y1, x2, y2, on) {
    ctx.strokeStyle = on ? PAL.green : PAL.rule; ctx.lineWidth = 1.5;
    line(ctx, x1, y1, x2, y2);
  }
  function node(ctx, x, y, label, on, col) {
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = on ? "rgba(99,56,138,.1)" : "#fff"; ctx.fill();
    ctx.strokeStyle = on ? col : PAL.rule; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.textAlign = "center"; ctx.fillStyle = on ? PAL.ink : PAL.muted; ctx.font = "12px " + getSans();
    ctx.fillText(label, x, y + 4);
  }
  function getSans() { return '"PingFang SC","Microsoft YaHei",system-ui,sans-serif'; }
  function getSerif() { return '"Songti SC","SimSun",serif'; }
  function getMono() { return '"SFMono-Regular",Consolas,monospace'; }

  /* ---------- 构建播放器 ---------- */
  function buildPlayer(frame) {
    var animName = frame.dataset.anim;
    var anim = ANIMS[animName];
    var caption = frame.dataset.caption || "";

    var canvas = document.createElement("canvas");
    var bar = document.createElement("div"); bar.className = "anim-bar";
    var btn = document.createElement("button"); btn.className = "anim-play"; btn.title = "播放 / 暂停";
    var cap = document.createElement("div"); cap.className = "anim-caption"; cap.textContent = caption;
    var state = document.createElement("div"); state.className = "anim-state"; state.textContent = "待播放";
    bar.appendChild(btn); bar.appendChild(cap); bar.appendChild(state);
    frame.appendChild(canvas); frame.appendChild(bar);

    var ctx = canvas.getContext("2d");
    var slideIndex = slides.indexOf(frame.closest(".slide"));
    var isDark = !!frame.closest(".slide").classList.contains("dark");

    var pl = {
      slideIndex: slideIndex, isDark: isDark,
      raf: null, playing: false, ended: false, t: 0, dur: anim.dur, last: 0,
      size: function () {
        var r = frame.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        pl.draw();
      },
      draw: function () {
        var r = frame.getBoundingClientRect();
        ctx.clearRect(0, 0, r.width, r.height);
        anim.draw(ctx, Math.max(0, Math.min(1, pl.t)), r.width, r.height, pl);
      },
      frame: function (now) {
        if (!pl.playing) return;
        if (!pl.last) pl.last = now;
        var dt = now - pl.last; pl.last = now;
        pl.t += dt / pl.dur;
        if (pl.t >= 1) { pl.t = 1; pl.draw(); pl.finish(); return; }
        pl.draw();
        pl.raf = requestAnimationFrame(pl.frame);
      },
      play: function () {
        if (pl.ended) { pl.t = 0; pl.ended = false; }
        pl.playing = true; pl.last = 0;
        btn.textContent = "❚❚"; state.textContent = "播放中";
        pl.raf = requestAnimationFrame(pl.frame);
      },
      pause: function () {
        pl.playing = false; pl.last = 0;
        if (pl.raf) cancelAnimationFrame(pl.raf);
        btn.textContent = "▶"; state.textContent = "已暂停";
      },
      finish: function () {
        pl.playing = false; pl.ended = true;
        if (pl.raf) cancelAnimationFrame(pl.raf);
        btn.textContent = "↻"; state.textContent = "已结束 · 点击重播";
      },
      stop: function () {
        pl.playing = false; pl.ended = false; pl.t = 0;
        if (pl.raf) cancelAnimationFrame(pl.raf);
        btn.textContent = "▶"; state.textContent = "待播放";
        pl.draw();
      },
      hold: function () {
        // 切回本页：保留当前进度，暂停
        if (pl.playing) pl.pause();
      }
    };

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (pl.playing) pl.pause(); else pl.play();
    });

    players.push(pl);
    pl.size();
    return pl;
  }

  document.querySelectorAll(".anim-frame").forEach(buildPlayer);
  window.addEventListener("resize", function () { players.forEach(function (p) { p.size(); }); });

  render();
  window.__go = go;
})();
