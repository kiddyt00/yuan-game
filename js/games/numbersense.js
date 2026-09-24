(function () {
  function start(api) {
    var active = true;
    var c = api.container;
    function stop() { active = false; api.stopSpeak(); }

    function scaleStars(s, total) {
      if (s >= total - 1) { return 3; }
      if (s >= Math.ceil(total * 0.6)) { return 2; }
      return 1;
    }
    function endRound(stars, total) {
      api.finish(scaleStars(stars, total), { onNext: function () {}, nextLabel: '🔀 换个玩法' });
    }

    function shell(total) {
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      var prog = UI.makeProgress(total);
      var qText = UI.el('div', 'question-text', '');
      var content = UI.el('div', 'content-box');
      var optBox = UI.el('div', 'options');
      panel.appendChild(prog);
      panel.appendChild(qText);
      panel.appendChild(content);
      panel.appendChild(optBox);
      c.appendChild(panel);
      return { qText: qText, content: content, optBox: optBox, prog: prog };
    }

    function showModes() {
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      panel.appendChild(UI.el('div', 'question-text', '6️⃣ 想练哪一项呢？'));
      var grid = UI.el('div', 'mode-grid');
      var modes = [
        { emoji: '🔢', name: '数一数', btn: 'btn-teal', fn: countMode },
        { emoji: '⚖️', name: '比多少', btn: 'btn-orange', fn: compareMode },
        { emoji: '🔍', name: '找数字', btn: 'btn-blue', fn: findMode },
        { emoji: '🧩', name: '排顺序', btn: 'btn-purple', fn: orderMode }
      ];
      modes.forEach(function (m) {
        var b = UI.el('button', 'mode-btn ' + m.btn,
          '<div class="mode-emoji">' + m.emoji + '</div><div class="mode-name">' + m.name + '</div>');
        b.addEventListener('click', function () {
          if (!active) { return; }
          api.sfx.tap();
          m.fn();
        });
        grid.appendChild(b);
      });
      panel.appendChild(grid);
      c.appendChild(panel);
      api.speak('想练哪一项本领呢？');
    }

    function countMode() {
      var total = 8, qi = 0, stars = 0, firstTry = true;
      var sh = shell(total);
      function render() {
        firstTry = true;
        var n = UI.rand(3, 10);
        var em = UI.pick(KG_DATA.countPool);
        sh.qText.textContent = '数一数，一共有几个呀？';
        sh.content.innerHTML = '';
        sh.optBox.innerHTML = '';
        var area = UI.el('div', 'count-area');
        var indices = [];
        for (var i = 0; i < n; i++) { indices.push(i); }
        var count = 0;
        indices.forEach(function () {
          var it = UI.el('div', 'count-item', em);
          it.addEventListener('click', function () {
            if (!active || it.classList.contains('counted')) { return; }
            count++;
            it.classList.add('counted');
            it.appendChild(UI.el('span', 'cnt-badge', String(count)));
            api.sfx.tap();
            api.speak(String(count));
          });
          area.appendChild(it);
        });
        sh.content.appendChild(area);

        var cand = [n - 2, n - 1, n + 1, n + 2].filter(function (x) { return x >= 1 && x <= 12 && x !== n; });
        var opts = UI.shuffle([n].concat(UI.distinct(cand, 2)));
        opts.forEach(function (v) {
          var b = UI.el('button', 'option-btn num-opt', String(v));
          b.addEventListener('click', function () {
            if (!active || b.classList.contains('dim')) { return; }
            if (v === n) {
              if (firstTry) { stars++; }
              b.classList.add('correct');
              api.praise();
              api.speak('一共有' + n + '个！');
              setTimeout(function () {
                if (!active) { return; }
                qi++;
                sh.prog.next();
                if (qi >= total) { endRound(stars, total); } else { render(); }
              }, 1400);
            } else {
              firstTry = false;
              api.retryMsg();
              b.classList.add('dim');
              UI.shake(b);
            }
          });
          sh.optBox.appendChild(b);
        });
        api.speak('数一数，点一个数一个，一共有几个呀？');
      }
      render();
    }

    function compareMode() {
      var total = 8, qi = 0, stars = 0, firstTry = true;
      var sh = shell(total);
      function render() {
        firstTry = true;
        var a, b;
        do { a = UI.rand(2, 9); b = UI.rand(2, 9); } while (a === b);
        var more = Math.random() < 0.6;
        sh.qText.textContent = more ? '哪一边的多呀？' : '哪一边的少呀？';
        sh.content.innerHTML = '';
        sh.optBox.innerHTML = '';
        var eA = UI.pick(KG_DATA.countPool);
        var eB = UI.pick(KG_DATA.countPool);
        while (eB === eA) { eB = UI.pick(KG_DATA.countPool); }
        var row = UI.el('div', 'compare-row');
        var left = UI.el('button', 'cmp-side', '<div class="cmp-emoji-row">' + new Array(a + 1).join(eA) + '</div>');
        var right = UI.el('button', 'cmp-side', '<div class="cmp-emoji-row">' + new Array(b + 1).join(eB) + '</div>');
        row.appendChild(left);
        row.appendChild(right);
        sh.content.appendChild(row);

        var correctIsLeft = more ? (a > b) : (a < b);
        function pick(isLeftSide, el) {
          if (!active) { return; }
          if (isLeftSide === correctIsLeft) {
            if (firstTry) { stars++; }
            el.classList.add('correct');
            api.praise();
            api.speak('左边' + a + '个，右边' + b + '个。');
            setTimeout(function () {
              if (!active) { return; }
              qi++;
              sh.prog.next();
              if (qi >= total) { endRound(stars, total); } else { render(); }
            }, 1500);
          } else {
            firstTry = false;
            api.retryMsg();
            UI.shake(el);
          }
        }
        left.addEventListener('click', function () { pick(true, left); });
        right.addEventListener('click', function () { pick(false, right); });
        api.speak(more ? '哪一边的多呀？' : '哪一边的少呀？');
      }
      render();
    }

    function findMode() {
      var total = 8, qi = 0, stars = 0, firstTry = true;
      var sh = shell(total);
      function render() {
        firstTry = true;
        var target = UI.rand(1, 10);
        sh.qText.textContent = '🔍 找出数字 ' + target;
        sh.content.innerHTML = '';
        sh.optBox.innerHTML = '';
        var cand = [];
        for (var v = Math.max(1, target - 3); v <= Math.min(12, target + 3); v++) {
          if (v !== target) { cand.push(v); }
        }
        var nums = UI.shuffle([target].concat(UI.distinct(cand, 5)));
        var grid = UI.el('div', 'num-grid');
        nums.forEach(function (v) {
          var b = UI.el('button', 'num-btn', String(v));
          b.addEventListener('click', function () {
            if (!active || b.classList.contains('dim')) { return; }
            if (v === target) {
              if (firstTry) { stars++; }
              b.classList.add('correct');
              api.praise();
              setTimeout(function () {
                if (!active) { return; }
                qi++;
                sh.prog.next();
                if (qi >= total) { endRound(stars, total); } else { render(); }
              }, 1200);
            } else {
              firstTry = false;
              api.retryMsg();
              b.classList.add('dim');
              UI.shake(b);
            }
          });
          grid.appendChild(b);
        });
        sh.content.appendChild(grid);
        api.speak('找出数字' + target);
      }
      render();
    }

    function orderMode() {
      var total = 8, qi = 0, stars = 0, firstTry = true;
      var sh = shell(total);
      function render() {
        firstTry = true;
        var wrongCount = 0;
        var asc = qi % 2 === 0;
        var cnt = qi < 4 ? 4 : 5;
        var nums = UI.distinct(UI.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), cnt);
        var sorted = nums.slice().sort(function (x, y) { return asc ? x - y : y - x; });
        sh.qText.textContent = asc ? '🧩 按从小到大，点一点！' : '🧩 按从大到小，点一点！';
        sh.content.innerHTML = '';
        sh.optBox.innerHTML = '';

        var slots = UI.el('div', 'order-slots');
        for (var i = 0; i < cnt; i++) { slots.appendChild(UI.el('div', 'slot', '')); }
        var cards = UI.el('div', 'order-cards');
        var expect = 0;
        var cardByValue = {};
        UI.shuffle(nums).forEach(function (v) {
          var card = UI.el('button', 'ocard', String(v));
          cardByValue[v] = card;
          card.addEventListener('click', function () {
            if (!active || card.classList.contains('used')) { return; }
            if (v === sorted[expect]) {
              card.classList.add('used');
              card.classList.remove('hint-glow');
              var slot = slots.children[expect];
              slot.textContent = String(v);
              slot.classList.add('filled');
              expect++;
              wrongCount = 0;
              api.sfx.tap();
              api.speak(String(v));
              if (expect === cnt) {
                api.praise();
                setTimeout(function () {
                  if (!active) { return; }
                  qi++;
                  sh.prog.next();
                  if (qi >= total) { endRound(stars, total); } else { render(); }
                }, 1300);
              }
            } else {
              firstTry = false;
              wrongCount++;
              UI.shake(card);
              if (wrongCount >= 2) {
                // 连续两次点错：高亮提示下一个该点的卡片，并用语音提示
                var hintCard = cardByValue[sorted[expect]];
                if (hintCard) { hintCard.classList.add('hint-glow'); }
                api.speak(asc
                  ? '想一想，最小的数字是' + sorted[expect] + '，先点它！'
                  : '想一想，最大的数字是' + sorted[expect] + '，先点它！');
              } else {
                api.retryMsg();
              }
            }
          });
          cards.appendChild(card);
        });
        sh.content.appendChild(slots);
        sh.content.appendChild(cards);
        api.speak(asc ? '按从小到大的顺序，点一点！' : '按从大到小的顺序，点一点！');
      }
      render();
    }

    showModes();
    return { stop: stop };
  }

  KidGames.register({ id: 'numbersense', name: '数感训练', emoji: '6️⃣', color: '#66BB6A', desc: '数数比比排一排', start: start });
})();
