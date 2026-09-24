(function () {
  var LEVELS = [
    { name: '⭐ 5以内', max: 5, btn: 'btn-teal' },
    { name: '⭐⭐ 10以内', max: 10, btn: 'btn-orange' },
    { name: '⭐⭐⭐ 20以内', max: 20, btn: 'btn-pink' }
  ];

  function start(api) {
    var active = true;
    var c = api.container;
    function stop() { active = false; api.stopSpeak(); }

    function showLevels() {
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      panel.appendChild(UI.el('div', 'question-text', '➕ 选一个难度开始吧！'));
      var grid = UI.el('div', 'mode-grid');
      LEVELS.forEach(function (L) {
        var b = UI.el('button', 'mode-btn ' + L.btn,
          '<div class="mode-name" style="font-size:1.3rem">' + L.name + '</div>');
        b.addEventListener('click', function () {
          if (!active) { return; }
          api.sfx.tap();
          startRound(L);
        });
        grid.appendChild(b);
      });
      panel.appendChild(grid);
      c.appendChild(panel);
      api.speak('选一个难度，开始算一算吧！');
    }

    function startRound(L) {
      var total = 10, qi = 0, stars = 0, firstTry = true;
      var lastKey = '';
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      var prog = UI.makeProgress(total);
      var eq = UI.el('div', 'eq-text', '');
      var visual = UI.el('div', 'visual-row');
      var optBox = UI.el('div', 'options');
      var hint = UI.el('div', 'hint-text', '小提示：可以点一点，数一数哦！');
      panel.appendChild(prog);
      panel.appendChild(eq);
      panel.appendChild(visual);
      panel.appendChild(optBox);
      panel.appendChild(hint);
      c.appendChild(panel);

      function mkItem(em, taken) {
        var it = UI.el('div', 'count-item' + (taken ? ' taken' : ''), em);
        if (!taken) {
          it.addEventListener('click', function () {
            if (!active || it.classList.contains('counted')) { return; }
            var k = visual.querySelectorAll('.counted').length + 1;
            it.classList.add('counted');
            it.appendChild(UI.el('span', 'cnt-badge', String(k)));
            api.sfx.tap();
            api.speak(String(k));
          });
        }
        return it;
      }

      function render() {
        firstTry = true;
        var op, a = 0, b = 0, ans = 0, key, tries = 0;
        do {
          op = Math.random() < 0.5 ? '+' : '-';
          if (op === '+') {
            a = UI.rand(1, L.max - 1);
            b = UI.rand(1, L.max - a);
            ans = a + b;
          } else {
            a = UI.rand(2, L.max);
            b = UI.rand(1, a - 1);
            ans = a - b;
          }
          key = op + a + '_' + b;
          tries++;
        } while (key === lastKey && tries < 25);
        lastKey = key;
        eq.textContent = a + ' ' + op + ' ' + b + ' = ?';
        visual.innerHTML = '';
        var em = UI.pick(KG_DATA.countPool);
        var i;
        if (op === '+') {
          var g1 = UI.el('div', 'vgroup');
          for (i = 0; i < a; i++) { g1.appendChild(mkItem(em, false)); }
          var plus = UI.el('div', 'vsign', '＋');
          var g2 = UI.el('div', 'vgroup');
          for (i = 0; i < b; i++) { g2.appendChild(mkItem(em, false)); }
          visual.appendChild(g1);
          visual.appendChild(plus);
          visual.appendChild(g2);
        } else {
          var g = UI.el('div', 'vgroup');
          for (i = 0; i < a; i++) { g.appendChild(mkItem(em, i >= a - b)); }
          visual.appendChild(g);
          visual.appendChild(UI.el('div', 'take-chip', '🚮 拿走 ' + b + ' 个'));
        }

        var cand = [ans - 3, ans - 2, ans - 1, ans + 1, ans + 2, ans + 3].filter(function (x) { return x >= 0 && x !== ans; });
        var opts = UI.shuffle([ans].concat(UI.distinct(cand, 3)));
        optBox.innerHTML = '';
        opts.forEach(function (v) {
          var btn = UI.el('button', 'option-btn num-opt', String(v));
          btn.addEventListener('click', function () {
            if (!active || btn.classList.contains('dim')) { return; }
            if (v === ans) {
              if (firstTry) { stars++; }
              btn.classList.add('correct');
              api.praise();
              api.speak(a + (op === '+' ? '加' : '减') + b + '等于' + ans + '！');
              setTimeout(function () {
                if (!active) { return; }
                qi++;
                prog.next();
                if (qi >= total) {
                  var s = stars >= 9 ? 3 : (stars >= 7 ? 2 : 1);
                  api.finish(s, { onNext: function () {}, nextLabel: '🔀 换个难度' });
                } else {
                  render();
                }
              }, 1500);
            } else {
              firstTry = false;
              api.retryMsg();
              btn.classList.add('dim');
              UI.shake(btn);
            }
          });
          optBox.appendChild(btn);
        });
        api.speak(a + (op === '+' ? '加' : '减') + b + '，等于几？');
      }

      render();
    }

    showLevels();
    return { stop: stop };
  }

  KidGames.register({ id: 'arithmetic', name: '加减法', emoji: '➕', color: '#FF7043', desc: '算一算等于几', start: start });
})();
