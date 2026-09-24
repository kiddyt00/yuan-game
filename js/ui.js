function kgShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function kgRand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function kgPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function kgDistinct(arr, n) { var s = kgShuffle(arr); return s.slice(0, Math.min(n, arr.length)); }
function kgEl(tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) { e.className = cls; }
  if (html != null) { e.innerHTML = html; }
  return e;
}

var UI = {
  shuffle: kgShuffle,
  rand: kgRand,
  pick: kgPick,
  distinct: kgDistinct,
  el: kgEl,

  shake: function (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); },
  pop: function (el) { el.classList.remove('popIn'); void el.offsetWidth; el.classList.add('popIn'); },

  makeProgress: function (total) {
    var wrap = kgEl('div', 'progress-dots');
    var dots = [];
    for (var i = 0; i < total; i++) {
      var d = kgEl('span', 'pdot');
      wrap.appendChild(d);
      dots.push(d);
    }
    var cur = 0;
    if (total > 0) { dots[0].classList.add('now'); }
    wrap.next = function () {
      if (cur < total) {
        dots[cur].classList.remove('now');
        dots[cur].classList.add('done');
        cur++;
        if (cur < total) { dots[cur].classList.add('now'); }
      }
    };
    return wrap;
  },

  confetti: function (layer) {
    if (!layer) { return; }
    layer.innerHTML = '';
    var colors = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb', '#ff9e80', '#b2ff59'];
    var ems = ['🎉', '⭐', '🌟', '🎈', '✨', '🍬'];
    for (var i = 0; i < 56; i++) {
      var p = kgEl('div', 'confetti');
      if (Math.random() < 0.35) {
        p.textContent = kgPick(ems);
        p.style.fontSize = kgRand(14, 26) + 'px';
      } else {
        p.style.background = kgPick(colors);
        p.style.width = kgRand(8, 14) + 'px';
        p.style.height = kgRand(10, 16) + 'px';
      }
      p.style.left = (Math.random() * 100) + '%';
      p.style.animationDuration = (Math.random() * 1.6 + 1.6) + 's';
      p.style.animationDelay = (Math.random() * 0.8) + 's';
      layer.appendChild(p);
    }
    setTimeout(function () { layer.innerHTML = ''; }, 4600);
  }
};
