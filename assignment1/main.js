/* ============================================================
   一次抬手，要经过六层 —— 交互与数据
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     数据
     ---------------------------------------------------------- */
  var LAYERS = [
    {
      n: '01', cn: '任务', en: 'Mission', scale: '人生 · 年', kind: 'duo', tag: '为什么存在',
      gist: '系统为什么存在。所有设计从这里开始，也从这里被否定。',
      pairs: [
        ['维持生命稳态', '冗余供能 + 故障降级'],
        ['感知—决策—行动', '闭环控制架构'],
        ['突破生理极限', '增强任务：红外、力、记忆']
      ],
      kpi: '任务成功率 = 可用性 × 精度 × 时间',
      kpiLabel: '衡量'
    },
    {
      n: '02', cn: '体系', en: 'SoS', scale: '房间 · 城市', kind: 'duo', tag: '和谁咬在一起',
      gist: '环境、人体、机器，三个东西咬成一个环。任一边变了，整个环要重新配平。',
      pairs: [
        ['物理世界：光、声、力、温度', '多模态感知场'],
        ['信息世界：网络与云', '外部算力与知识'],
        ['社会世界：他人与设备', '人机协同网络']
      ],
      kpi: '闭环增益：环境变、人变、机器变，三者必须同步',
      kpiLabel: '衡量'
    },
    {
      n: '03', cn: '整机', en: 'Vehicles', scale: '人 · 米', kind: 'duo', tag: '一个完整的我',
      gist: '一个人配上一套设备，就是一个整机。生物件与机器件，在这里第一次装到一起。',
      pairs: [
        ['骨骼', '碳纤维支架'],
        ['肌肉', '外骨骼电机 / 功能电刺激'],
        ['皮肤', '传感器阵列'],
        ['神经', '电极与线缆'],
        ['代谢', '电池与能量采集']
      ],
      kpi: '穿戴时间 × 重量 × 自由度',
      kpiLabel: '衡量'
    },
    {
      n: '04', cn: '系统', en: 'Systems', scale: '分米 · 厘米', kind: 'systems', tag: '分工',
      gist: '整机内部按功能分家。六个系统，每一个都是“生物做法”与“机器做法”的双轨。',
      kpi: '系统之间不许抢同一个执行器',
      kpiLabel: '约束'
    },
    {
      n: '05', cn: '子系统', en: 'Sub-systems', scale: '厘米 · 毫米', kind: 'subs', tag: '再拆一层',
      gist: '每个系统再往下拆一层，功能才落到能画接口图的程度。点开看。',
      kpi: '每个子系统必须能独立测试',
      kpiLabel: '约束'
    },
    {
      n: '06', cn: '模块', en: 'Modules', scale: '毫米 · 微米', kind: 'mods', tag: '基本积木',
      gist: '最后剩下的是可以采购、贴片、烧固件的东西。点选它们，看看一台机器有多重、多耗电。',
      kpi: '模块是可替换的最小单位',
      kpiLabel: '约束'
    }
  ];

  var SYSTEMS = [
    { name: '感知系统', bio: '眼、耳、鼻、舌、皮肤本体感受器', art: '红外相机、麦克风阵列、压力传感、GPS',
      subs: ['视觉：视网膜 + 摄像头 + 图像预处理', '听觉：耳蝇 + 麦克风阵列 + 降噪', '触觉：皮肤感受器 + 压力温度传感 + 力反馈映射', '本体感觉：前庭器官 + IMU 惯性测量'] },
    { name: '信息传输系统', bio: '传入神经、传出神经', art: '无线模块、植入导线、蓝牙 / WiFi',
      subs: ['神经接口：电极阵列、信号放大、阻抗匹配', '无线传输：蓝牙、NFC、数据压缩', '有线植入：导线、绝缘封装、生物相容涂层'] },
    { name: '决策与控制系统', bio: '大脑皮层、脊髓反射', art: '边缘计算单元、AI 推理、云端协同',
      subs: ['信号解扣：EEG / EMG 降噪、特征提取、模式分类', '混合决策：生物—人工信号融合、权重分配、冲突仲裁', '预测控制：运动意图预测、前馈补偿、延迟补偿'] },
    { name: '执行与运动系统', bio: '骨骼肌、关节', art: '外骨骼电机、机械驱动、功能电刺激',
      subs: ['驱动：伺服电机、液压 / 气动、电刺激器', '关节控制：角度闭环、力矩控制、阻抗控制', '反馈：肌电反馈、触觉反馈、视觉反馈'] },
    { name: '能源与代谢系统', bio: '消化系统、循环系统、ATP 代谢', art: '电池组、无线充电、能量采集',
      subs: ['电池管理：充放电、SOC 估计、热管理', '能量采集：运动振动发电、体温温差发电', '生物供能：营养代谢监测、血糖调节'] },
    { name: '安全与监护系统', bio: '免疫系统、疼痛反射、自稳态调节', art: '过压保护、热管理、故障熔断、监测算法',
      subs: ['实时监测：心率 / 脑电 / 体温异常检测', '故障诊断：电极脱落检测、信号质量评估', '安全降级：紧急停机、模式切换、人工接管'] }
  ];

  var MODULES = [
    { n: '干电极阵列', t: 'hw', p: 0.05, w: 12 },
    { n: '仪表放大器', t: 'hw', p: 0.02, w: 2 },
    { n: '24-bit ADC', t: 'hw', p: 0.03, w: 1.5 },
    { n: 'DSP 芯片', t: 'hw', p: 0.35, w: 4 },
    { n: 'FPGA 加速板', t: 'hw', p: 1.8, w: 22 },
    { n: '电脉冲发生器', t: 'hw', p: 0.6, w: 18 },
    { n: '电流源 IC', t: 'hw', p: 0.12, w: 1 },
    { n: '蓝牙 SoC', t: 'hw', p: 0.09, w: 1.2 },
    { n: '无线充电线圈', t: 'hw', p: 0.0, w: 9 },
    { n: '天线模块', t: 'hw', p: 0.0, w: 2 },
    { n: '锂电单元', t: 'hw', p: 0.0, w: 148 },
    { n: 'DC-DC 变换器', t: 'hw', p: 0.22, w: 2.4 },
    { n: '电源管理 IC', t: 'hw', p: 0.05, w: 1.1 },
    { n: '外骨骼关节', t: 'hw', p: 0.0, w: 210 },
    { n: '碳纤维支撑杆', t: 'hw', p: 0.0, w: 86 },
    { n: '快拆接口', t: 'hw', p: 0.0, w: 24 },
    { n: '钛合金外壳', t: 'hw', p: 0.0, w: 64 },
    { n: '生物相容硅胶', t: 'hw', p: 0.0, w: 18 },
    { n: 'IMU 九轴', t: 'hw', p: 0.04, w: 2.2 },
    { n: '麦克风阵列', t: 'hw', p: 0.1, w: 6 },
    { n: '降噪与滤波', t: 'sw', p: 0.02, w: 0 },
    { n: '伪迹去除', t: 'sw', p: 0.05, w: 0 },
    { n: '时域特征', t: 'sw', p: 0.01, w: 0 },
    { n: '频域特征', t: 'sw', p: 0.03, w: 0 },
    { n: '意图分类器', t: 'sw', p: 0.18, w: 0 },
    { n: '视觉目标检测', t: 'sw', p: 1.2, w: 0 },
    { n: '安全规则引擎', t: 'sw', p: 0.02, w: 0 },
    { n: '功耗调度', t: 'sw', p: 0.01, w: 0 },
    { n: 'SOC 估计', t: 'sw', p: 0.01, w: 0 },
    { n: '异常检测', t: 'sw', p: 0.04, w: 0 },
    { n: '预测性维护', t: 'sw', p: 0.03, w: 0 },
    { n: '冲突仲裁', t: 'sw', p: 0.09, w: 0 }
  ];

  var BREAKS = [
    { cn: '任务', n: '01', left: 100, symptom: '目标被改写或者消失。', effect: '系统仍在完美运转，但已经不再服务于任何人。', taker: '没有一层能接管，只能回到起点重定义任务。' },
    { cn: '体系', n: '02', left: 72, symptom: '耦合断开：设备连不上环境，也连不上云。', effect: '增强体退化成孤岛，人被迫回到纯生物模式。', taker: '人体自己。能力陇降，但活着。' },
    { cn: '整机', n: '03', left: 66, symptom: '设备脱落、快拆松脱、配重失衡。', effect: '整机散架，外骨骼变成累赘挂在身上。', taker: '机械自锁 + 无源支撑，先保住人不摔倒。' },
    { cn: '系统', n: '04', left: 78, symptom: '某一功能整体宕机，比如视觉通道全黑。', effect: '剩下五个系统仍工作，但任务降级。', taker: '冗余通道：视觉切听觉提示，云端切本地规则。' },
    { cn: '子系统', n: '05', left: 92, symptom: '电极脱落、阻抗劣化、特征漂移。', effect: '信号还在，只是不准了——最危险的一种失效。', taker: '本地缓存 + 阻抗监测 + 提示重贴。' },
    { cn: '模块', n: '06', left: 88, symptom: '单枚芯片死掉，或者固件跑飞。', effect: '局部功能消失，整机仍能运转。', taker: '看门狗重启，双机热备切换。' }
  ];

  var BUILDER = [
    {
      key: 'iface', title: '接口 · 怎么接上神经',
      opts: [
        { id: 'dry', label: '无创头环', lat: 14, bw: 0.6, risk: 1, w: 420, pw: 3.0 },
        { id: 'emg', label: '肌电臂环', lat: 9, bw: 1.4, risk: 2, w: 180, pw: 1.2 },
        { id: 'implant', label: '植入电极', lat: 2, bw: 9.0, risk: 5, w: 30, pw: 0.8 }
      ]
    },
    {
      key: 'trans', title: '传输 · 信号怎么走',
      opts: [
        { id: 'ble', label: '无线 BLE', lat: 16, bw: 2.0, risk: 1, w: 5, pw: 0.4 },
        { id: 'wire', label: '有线总线', lat: 1, bw: 12.0, risk: 3, w: 60, pw: 0.2 },
        { id: 'dual', label: '双通道冗余', lat: 7, bw: 6.0, risk: 2, w: 42, pw: 0.9 }
      ]
    },
    {
      key: 'dec', title: '决策 · 谁来做判断',
      opts: [
        { id: 'mcu', label: '本地 MCU', lat: 6, bw: 0, risk: 1, w: 12, pw: 0.5 },
        { id: 'npu', label: '边缘 NPU', lat: 12, bw: 2.0, risk: 1, w: 45, pw: 4.0 },
        { id: 'cloud', label: '云端推理', lat: 55, bw: 8.0, risk: 1, w: 8, pw: 0.3 }
      ]
    },
    {
      key: 'energy', title: '能源 · 电从哪来',
      opts: [
        { id: 'li', label: '锂电 5000mAh', lat: 0, bw: 0, risk: 1, w: 148, pw: 0, cap: 18.5 },
        { id: 'harvest', label: '能量采集', lat: 0, bw: 0, risk: 1, w: 92, pw: 0, cap: 6.0 },
        { id: 'mix', label: '采集 + 电池', lat: 0, bw: 0, risk: 2, w: 210, pw: 0, cap: 24.5 }
      ]
    },
    {
      key: 'exec', title: '执行 · 谁来动手',
      opts: [
        { id: 'exo', label: '外骨骼', lat: 8, bw: 0, risk: 2, w: 900, pw: 12.0 },
        { id: 'fes', label: '功能电刺激', lat: 3, bw: 0, risk: 3, w: 120, pw: 1.5 },
        { id: 'haptic', label: '触觉反馈', lat: 5, bw: 0, risk: 1, w: 60, pw: 1.0 }
      ]
    }
  ];

  var PRESETS = [
    { name: '康复外骨骼', pick: { iface: 'emg', trans: 'wire', dec: 'mcu', energy: 'li', exec: 'exo' } },
    { name: '消费级头环', pick: { iface: 'dry', trans: 'ble', dec: 'npu', energy: 'li', exec: 'haptic' } },
    { name: '实验级植入', pick: { iface: 'implant', trans: 'dual', dec: 'npu', energy: 'mix', exec: 'fes' } }
  ];

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
    var dur = reduceMotion ? 300 : 500;
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
        body = '<div class="mod-filter" data-filter="all"><button class="on" data-f="all" type="button">全部</button><button data-f="hw" type="button">硬件</button><button data-f="sw" type="button">软件 / 算法</button></div>' +
          '<div class="mods">' + MODULES.map(function (m) {
            return '<button class="mod" type="button" data-t="' + m.t + '" data-p="' + m.p + '" data-w="' + m.w + '">' + m.n + '</button>';
          }).join('') + '</div>' +
          '<div class="mod-tally"><span>已选 <b class="t-n">0</b> 个模块</span><span>合计功耗 <b class="t-p">0.0</b> W</span><span>合计重量 <b class="t-w">0</b> g</span></div>';
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
    var errMm = Math.round(errPx / ampPx() * AMP_MM);
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

    var scores = [
      Math.max(0.05, Math.min(1, (200 - lat) / 200)),   // 响应
      Math.max(0.05, Math.min(1, bw / 10)),             // 带宽
      Math.max(0.05, Math.min(1, hours / 24)),          // 续航
      Math.max(0.05, Math.min(1, (6 - risk) / 5)),      // 舒适
      Math.max(0.05, Math.min(1, (1000 - weight) / 1000)) // 便携
    ];

    drawRadar(scores);

    buildNums.innerHTML =
      '<div class="bn"><span>环路延迟</span><b>' + Math.round(lat) + '<i>ms</i></b></div>' +
      '<div class="bn"><span>数据带宽</span><b>' + fmt(bw, 1) + '<i>Mbps</i></b></div>' +
      '<div class="bn"><span>续航</span><b>' + fmt(hours, 1) + '<i>h</i></b></div>' +
      '<div class="bn"><span>整机重量</span><b>' + Math.round(weight) + '<i>g</i></b></div>' +
      '<div class="bn"><span>功耗</span><b>' + fmt(pw, 1) + '<i>W</i></b></div>' +
      '<div class="bn"><span>侵入性</span><b>' + risk + '<i>/5</i></b></div>';

    var tier = lat < 40 ? '直觉级' : (lat < 80 ? '可控' : (lat < 120 ? '迟滞明显' : '追不上'));
    var s = '这台系统的环路延迟 ' + Math.round(lat) + ' ms（' + tier + '），带宽 ' + fmt(bw, 1) + ' Mbps，整机 ' + Math.round(weight) + ' g、功耗 ' + fmt(pw, 1) + ' W，续航约 ' + fmt(hours, 1) + ' 小时，侵入性 ' + risk + '/5。';
    if (risk >= 4) {
      s += '为此你要接受一次手术，以及长期的生物相容性与感染风险。';
    } else if (hours < 4) {
      s += '代价是续航撑不过半天——现实中它会退化成间歇使用的工具。';
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
