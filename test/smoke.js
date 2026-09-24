// 冒烟测试：node test/smoke.js
// 用最小 DOM 桩加载全部脚本，启动每个游戏并模拟点击各类按钮，捕获运行时异常。
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');

/* ---------- 最小 DOM 桩 ---------- */
function makeEl(tag) {
  var el = {
    tagName: tag,
    children: [],
    className: '',
    innerHTML: '',
    textContent: '',
    style: {},
    dataset: {},
    offsetWidth: 100,
    disabled: false,
    _listeners: {},
    _attrs: {}
  };
  el.style = {
    setProperty: function (k, v) { el.style[k] = v; }
  };
  el.classList = {
    add: function () { for (var i = 0; i < arguments.length; i++) { var c = ' ' + el.className + ' '; if (c.indexOf(' ' + arguments[i] + ' ') < 0) { el.className = (el.className + ' ' + arguments[i]).trim(); } } },
    remove: function () { for (var i = 0; i < arguments.length; i++) { el.className = (' ' + el.className + ' ').split(' ' + arguments[i] + ' ').join(' ').trim(); } },
    toggle: function (c) { if (this.contains(c)) { this.remove(c); return false; } this.add(c); return true; },
    contains: function (c) { return (' ' + el.className + ' ').indexOf(' ' + c + ' ') >= 0; }
  };
  el.setAttribute = function (k, v) { el._attrs[k] = String(v); };
  el.getAttribute = function (k) { return el._attrs[k]; };
  el.appendChild = function (ch) { ch.parentNode = el; el.children.push(ch); return ch; };
  el.removeChild = function (ch) {
    var i = el.children.indexOf(ch);
    if (i >= 0) { el.children.splice(i, 1); }
    ch.parentNode = null;
    return ch;
  };
  el.addEventListener = function (t, f) { (el._listeners[t] = el._listeners[t] || []).push(f); };
  el.removeEventListener = function (t, f) {
    var arr = el._listeners[t] || [];
    var i = arr.indexOf(f);
    if (i >= 0) { arr.splice(i, 1); }
  };
  el.querySelector = function (sel) { return el.querySelectorAll(sel)[0] || null; };
  el.querySelectorAll = function (sel) {
    var cls = String(sel).replace(/^\./, '');
    var out = [];
    (function walk(node) {
      for (var i = 0; i < node.children.length; i++) {
        var ch = node.children[i];
        if ((' ' + ch.className + ' ').indexOf(' ' + cls + ' ') >= 0) { out.push(ch); }
        walk(ch);
      }
    })(el);
    return out;
  };
  el.getBoundingClientRect = function () { return { left: 0, top: 0, width: 360, height: 360 }; };
  el.getContext = function () {
    return {
      strokeStyle: '', lineWidth: 1, lineCap: '', lineJoin: '',
      beginPath: function () {}, moveTo: function () {}, lineTo: function () {}, stroke: function () {}
    };
  };
  Object.defineProperty(el, 'clientWidth', { value: 360 });
  Object.defineProperty(el, 'clientHeight', { value: 640 });
  return el;
}

var domReadyCbs = [];
var ids = {};
var documentStub = {
  createElement: function (t) { return makeEl(t); },
  getElementById: function (id) { if (!ids[id]) { ids[id] = makeEl('div'); } return ids[id]; },
  querySelectorAll: function () { return []; },
  querySelector: function () { return null; },
  addEventListener: function (t, f) { if (t === 'DOMContentLoaded') { domReadyCbs.push(f); } },
  removeEventListener: function () {}
};
var store = {};
global.window = global;
global.document = documentStub;
global.innerWidth = 360;
global.innerHeight = 640;
global.localStorage = {
  getItem: function (k) { return k in store ? store[k] : null; },
  setItem: function (k, v) { store[k] = String(v); },
  removeItem: function (k) { delete store[k]; }
};

/* ---------- 按脚本顺序加载 ---------- */
var root = path.join(__dirname, '..');
var files = [
  'js/data.js', 'js/audio.js', 'js/ui.js', 'js/app.js',
  'js/games/maze.js', 'js/games/poem.js', 'js/games/english.js', 'js/games/pattern.js',
  'js/games/numbersense.js', 'js/games/arithmetic.js', 'js/games/match.js', 'js/games/animals.js'
];
files.forEach(function (f) {
  vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f });
});
domReadyCbs.forEach(function (f) { f(); });

/* ---------- 工具：按类名找元素并模拟点击 ---------- */
function findAll(el, cls, out) {
  out = out || [];
  for (var i = 0; i < el.children.length; i++) {
    var ch = el.children[i];
    if ((' ' + ch.className + ' ').indexOf(' ' + cls + ' ') >= 0) { out.push(ch); }
    findAll(ch, cls, out);
  }
  return out;
}
function clickAll(el, cls, log) {
  findAll(el, cls).forEach(function (b) {
    try {
      (b._listeners.click || []).forEach(function (f) { f({ preventDefault: function () {} }); });
    } catch (e) {
      log.push('点击 .' + cls + ' 异常: ' + (e && e.message));
      throw e;
    }
  });
}

/* ---------- 对每个游戏执行冒烟 ---------- */
var fails = [];
function fakeApi() {
  return {
    container: documentStub.getElementById('game-container'),
    speak: function () {},
    speakSeq: function (items, onItem, onDone) { if (onDone) { onDone(); } },
    stopSpeak: function () {},
    sfx: { tap: function () {}, flip: function () {}, correct: function () {}, wrong: function () {}, win: function () {} },
    praise: function () {},
    retryMsg: function () {},
    finish: function () {}
  };
}

var SELECTORS = ['.mode-btn', '.big-btn', '.letter-card', '.option-btn', '.num-btn', '.ocard', '.cmp-side', '.mcard', '.scene-item', '.dpad-btn', '.flash-card'];

KidGames.games.forEach(function (g) {
  var name = g.name;
  try {
    var api = fakeApi();
    var inst = g.start(api);
    SELECTORS.forEach(function (sel) {
      // 每轮点击后可能渲染出新界面，重查一遍
      for (var round = 0; round < 2; round++) {
        var before = findAll(api.container, sel.slice(1)).length;
        if (before === 0) { break; }
        clickAll(api.container, sel.slice(1), fails);
      }
    });
    if (inst && inst.stop) { inst.stop(); }
    console.log('OK   ' + name);
  } catch (e) {
    console.log('FAIL ' + name + ' -> ' + (e && e.stack ? e.stack.split('\n')[0] + ' @ ' + (e.stack.split('\n')[1] || '') : e));
    fails.push(name + ': ' + (e && e.message));
  }
  documentStub.getElementById('game-container').children.length = 0;
});

setTimeout(function () {
  if (fails.length) {
    console.log('\nSMOKE FAIL (' + fails.length + '):');
    fails.forEach(function (f) { console.log('  - ' + f); });
    process.exit(1);
  }
  console.log('\nSMOKE PASS: ' + KidGames.games.length + ' 个游戏启动+交互无异常');
  process.exit(0);
}, 3600);
