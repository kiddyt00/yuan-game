(function () {
  var level = 0;
  var LEVELS = [
    { w: 5, h: 5, shape: 'square', animal: '🐣', name: '小鸡' },
    { w: 7, h: 7, shape: 'circle', animal: '🐰', name: '小兔子' },
    { w: 7, h: 7, shape: 'square', animal: '🐿️', name: '小松鼠' },
    { w: 9, h: 9, shape: 'ellipse', animal: '🐼', name: '熊猫' },
    { w: 9, h: 9, shape: 'diamond', animal: '🦊', name: '小狐狸' },
    { w: 11, h: 9, shape: 'trapezoid', animal: '🐮', name: '小牛' },
    { w: 11, h: 11, shape: 'circle', animal: '🐧', name: '企鹅' },
    { w: 13, h: 9, shape: 'ellipse', animal: '🐯', name: '老虎' },
    { w: 13, h: 13, shape: 'diamond', animal: '🦄', name: '小独角兽' }
  ];

  function inMask(shape, x, y, w, h) {
    var cx = (w - 1) / 2, cy = (h - 1) / 2;
    var nx = (x - cx) / ((w - 1) / 2);
    var ny = (y - cy) / ((h - 1) / 2);
    if (shape === 'square') { return true; }
    if (shape === 'circle') { return nx * nx + ny * ny <= 1.12; }
    if (shape === 'ellipse') { return (nx * nx) / 1.44 + (ny * ny) / 0.5625 <= 1; }
    if (shape === 'diamond') { return Math.abs(nx) + Math.abs(ny) <= 1.3; }
    if (shape === 'trapezoid') {
      var t = (y - cy) / ((h - 1) / 2);
      return Math.abs(nx) <= 0.34 + 0.31 * (t + 1);
    }
    return true;
  }

  function start(api) {
    var active = true;
    var c = api.container;
    var docKeyHandler = null, docMouseHandler = null;
    function stop() {
      active = false;
      if (docKeyHandler) { document.removeEventListener('keydown', docKeyHandler); }
      if (docMouseHandler) { document.removeEventListener('mousemove', docMouseHandler); }
      api.stopSpeak();
    }

    var L = LEVELS[Math.min(level, LEVELS.length - 1)];
    var w = L.w, h = L.h;

    var cells = [];
    var x, y, i;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        cells.push({ x: x, y: y, walls: [true, true, true, true], visited: false, in: inMask(L.shape, x, y, w, h) });
      }
    }
    function idx(cx, cy) { return cy * w + cx; }
    function masked(cx, cy) { return cx >= 0 && cx < w && cy >= 0 && cy < h && cells[idx(cx, cy)].in; }

    // 起点取最上方一行的最左格，终点取最下一行的最右格
    var startCell = null, endCell = null;
    for (y = 0; y < h && !startCell; y++) {
      for (x = 0; x < w; x++) { if (cells[idx(x, y)].in) { startCell = cells[idx(x, y)]; break; } }
    }
    for (y = h - 1; y >= 0 && !endCell; y--) {
      for (x = w - 1; x >= 0; x--) { if (cells[idx(x, y)].in) { endCell = cells[idx(x, y)]; break; } }
    }

    // 深度优先回溯，只在掩膜内打通
    var DIRS = [
      { dx: 0, dy: -1, wi: 0, ow: 2 },
      { dx: 1, dy: 0, wi: 1, ow: 3 },
      { dx: 0, dy: 1, wi: 2, ow: 0 },
      { dx: -1, dy: 0, wi: 3, ow: 1 }
    ];
    var stack = [startCell];
    startCell.visited = true;
    while (stack.length) {
      var cur = stack[stack.length - 1];
      var nbrs = [];
      for (i = 0; i < 4; i++) {
        var nx2 = cur.x + DIRS[i].dx, ny2 = cur.y + DIRS[i].dy;
        if (masked(nx2, ny2) && !cells[idx(nx2, ny2)].visited) {
          nbrs.push({ d: DIRS[i], c: cells[idx(nx2, ny2)] });
        }
      }
      if (!nbrs.length) { stack.pop(); continue; }
      var pn = nbrs[Math.floor(Math.random() * nbrs.length)];
      cur.walls[pn.d.wi] = false;
      pn.c.walls[pn.d.ow] = false;
      pn.c.visited = true;
      stack.push(pn.c);
    }

    // 渲染
    c.innerHTML = '';
    var panel = UI.el('div', 'game-panel');
    var top = UI.el('div', 'maze-top');
    top.appendChild(UI.el('div', 'level-chip', '第 ' + (Math.min(level, LEVELS.length - 1) + 1) + ' / ' + LEVELS.length + ' 关'));
    top.appendChild(UI.el('div', 'hint-text', '画一画或点箭头，帮' + L.name + ' ' + L.animal + ' 到星星 ⭐ 那里！'));
    panel.appendChild(top);

    var wrap = UI.el('div', 'maze-wrap');
    var box = UI.el('div', 'maze-box');
    box.style.setProperty('--cols', String(w));
    var size = Math.floor(Math.min(c.clientWidth - 28 || 300, window.innerHeight - 300, 430));
    if (size < 200) { size = Math.max(200, Math.floor(Math.min(c.clientWidth - 28 || 300, 430))); }
    box.style.width = size + 'px';
    box.style.height = size + 'px';
    var emSize = Math.floor(size / w * 0.6);

    var cellEls = [];
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        var cl = cells[idx(x, y)];
        var elc;
        if (!cl.in) {
          elc = UI.el('div', 'maze-cell maze-void');
        } else {
          elc = UI.el('div', 'maze-cell');
          if (cl.walls[0]) { elc.classList.add('wt'); }
          if (cl.walls[3]) { elc.classList.add('wl'); }
          if (cl.walls[1] && !masked(x + 1, y)) { elc.classList.add('wr'); }
          if (cl.walls[2] && !masked(x, y + 1)) { elc.classList.add('wb'); }
        }
        cellEls.push(elc);
        box.appendChild(elc);
      }
    }
    var goalEl = cellEls[idx(endCell.x, endCell.y)];
    goalEl.classList.add('goal');
    var starSpan = UI.el('span', 'cell-em', '⭐');
    starSpan.style.fontSize = emSize + 'px';
    goalEl.appendChild(starSpan);

    var cv = document.createElement('canvas');
    cv.className = 'maze-canvas';
    cv.width = size;
    cv.height = size;
    box.appendChild(cv);
    var ctx = cv.getContext('2d');

    wrap.appendChild(box);
    panel.appendChild(wrap);

    var dpad = UI.el('div', 'dpad');
    var dirs = [
      { ar: '⬆️', g: 'grid-column:2;grid-row:1', dx: 0, dy: -1 },
      { ar: '⬅️', g: 'grid-column:1;grid-row:2', dx: -1, dy: 0 },
      { ar: '➡️', g: 'grid-column:3;grid-row:2', dx: 1, dy: 0 },
      { ar: '⬇️', g: 'grid-column:2;grid-row:3', dx: 0, dy: 1 }
    ];
    dirs.forEach(function (d) {
      var b = UI.el('button', 'dpad-btn', d.ar);
      b.setAttribute('style', d.g);
      b.addEventListener('click', function () { if (active) { move(d.dx, d.dy); } });
      dpad.appendChild(b);
    });
    panel.appendChild(dpad);
    c.appendChild(panel);

    var pos = { x: startCell.x, y: startCell.y };
    var playerEl = null;
    function placePlayer() {
      if (playerEl && playerEl.parentNode) { playerEl.parentNode.removeChild(playerEl); }
      playerEl = UI.el('span', 'cell-em', L.animal);
      playerEl.style.fontSize = Math.floor(emSize * 1.05) + 'px';
      cellEls[idx(pos.x, pos.y)].appendChild(playerEl);
      cellEls[idx(pos.x, pos.y)].classList.add('trail');
    }
    placePlayer();

    function drawStep(fx, fy, tx, ty) {
      var cw = size / w, ch = size / h;
      try {
        ctx.strokeStyle = 'rgba(255,152,0,.55)';
        ctx.lineWidth = Math.max(3, cw * 0.28);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo((fx + 0.5) * cw, (fy + 0.5) * ch);
        ctx.lineTo((tx + 0.5) * cw, (ty + 0.5) * ch);
        ctx.stroke();
      } catch (e) {}
    }

    var won = false;
    function move(dx, dy) {
      if (won) { return; }
      var cl = cells[idx(pos.x, pos.y)];
      var wi = dy === -1 ? 0 : (dx === 1 ? 1 : (dy === 1 ? 2 : (dx === -1 ? 3 : -1)));
      if (wi < 0) { return; }
      if (cl.walls[wi]) { api.sfx.wrong(); UI.shake(box); return; }
      var mx = pos.x + dx, my = pos.y + dy;
      if (!masked(mx, my)) { return; }
      var fx = pos.x, fy = pos.y;
      pos.x = mx; pos.y = my;
      api.sfx.tap();
      drawStep(fx, fy, pos.x, pos.y);
      placePlayer();
      if (pos.x === endCell.x && pos.y === endCell.y) {
        won = true;
        api.sfx.win();
        api.speak('到啦！你真棒！');
        setTimeout(function () {
          if (!active) { return; }
          api.finish(3, level < LEVELS.length - 1 ? { onNext: function () { level++; }, nextLabel: '➡️ 下一关' } : {});
        }, 900);
      }
    }

    // 遥控器/键盘方向键（安卓电视等）
    docKeyHandler = function (e) {
      if (!active) { return; }
      var k = e.key;
      var code = e.keyCode;
      if (k === 'ArrowUp' || code === 38) { move(0, -1); }
      else if (k === 'ArrowDown' || code === 40) { move(0, 1); }
      else if (k === 'ArrowLeft' || code === 37) { move(-1, 0); }
      else if (k === 'ArrowRight' || code === 39) { move(1, 0); }
      else { return; }
      e.preventDefault();
    };
    document.addEventListener('keydown', docKeyHandler);

    // 画线走迷宫：鼠标或手指拖动，小动物沿着画的线走
    var dragging = false, lastCell = null;
    function cellFromEvent(e) {
      var rect = box.getBoundingClientRect();
      var px, py;
      if (e.touches && e.touches.length) { px = e.touches[0].clientX; py = e.touches[0].clientY; }
      else if (e.changedTouches && e.changedTouches.length) { px = e.changedTouches[0].clientX; py = e.changedTouches[0].clientY; }
      else { px = e.clientX; py = e.clientY; }
      var cx2 = Math.floor((px - rect.left) / (rect.width / w));
      var cy2 = Math.floor((py - rect.top) / (rect.height / h));
      if (cx2 < 0) { cx2 = 0; } if (cx2 >= w) { cx2 = w - 1; }
      if (cy2 < 0) { cy2 = 0; } if (cy2 >= h) { cy2 = h - 1; }
      return { x: cx2, y: cy2 };
    }
    function sgn(v) { return v > 0 ? 1 : (v < 0 ? -1 : 0); }
    function dirOpen(dx, dy) {
      if (dx === 0 && dy === 0) { return false; }
      var cl = cells[idx(pos.x, pos.y)];
      var wi = dy === -1 ? 0 : (dx === 1 ? 1 : (dy === 1 ? 2 : 3));
      return !cl.walls[wi];
    }
    function walkToward(target) {
      var guard = 0;
      while (guard++ < w * h) {
        if (pos.x === target.x && pos.y === target.y) { return; }
        var dx = target.x - pos.x, dy = target.y - pos.y;
        var sx = sgn(dx), sy = sgn(dy);
        var fx, fy, sx2, sy2;
        if (Math.abs(dx) >= Math.abs(dy)) {
          fx = sx; fy = 0; sx2 = 0; sy2 = sy;
        } else {
          fx = 0; fy = sy; sx2 = sx; sy2 = 0;
        }
        if (dirOpen(fx, fy)) {
          move(fx, fy);
        } else if (dirOpen(sx2, sy2)) {
          move(sx2, sy2);
        } else {
          return;
        }
      }
    }

    box.addEventListener('mousedown', function (e) {
      if (!active) { return; }
      dragging = true;
      lastCell = cellFromEvent(e);
      walkToward(lastCell);
    });
    docMouseHandler = function (e) {
      if (!active || !dragging) { return; }
      var cc = cellFromEvent(e);
      if (lastCell && cc.x === lastCell.x && cc.y === lastCell.y) { return; }
      lastCell = cc;
      walkToward(cc);
    };
    document.addEventListener('mousemove', docMouseHandler);
    document.addEventListener('mouseup', function () { dragging = false; });
    box.addEventListener('touchstart', function (e) {
      if (!active) { return; }
      dragging = true;
      lastCell = cellFromEvent(e);
      walkToward(lastCell);
    }, { passive: true });
    box.addEventListener('touchmove', function (e) {
      if (!active || !dragging) { return; }
      var cc = cellFromEvent(e);
      if (lastCell && cc.x === lastCell.x && cc.y === lastCell.y) { return; }
      lastCell = cc;
      walkToward(cc);
    }, { passive: true });
    box.addEventListener('touchend', function () { dragging = false; }, { passive: true });

    api.speak('帮' + L.name + '走到星星那里吧！可以用手指画一画，也可以点箭头哦！');
    return { stop: stop };
  }

  KidGames.register({ id: 'maze', name: '走迷宫', emoji: '🌀', color: '#FF9800', desc: '画一画线走迷宫', start: start });
})();
