(function () {
  var level = 0;
  var CFG = [{ pairs: 6, cols: 4 }, { pairs: 8, cols: 4 }, { pairs: 10, cols: 5 }];

  function start(api) {
    var active = true;
    var c = api.container;
    var timers = [];
    function stop() {
      active = false;
      timers.forEach(function (t) { clearTimeout(t); });
      api.stopSpeak();
    }
    function later(fn, ms) {
      var t = setTimeout(function () { if (active) { fn(); } }, ms);
      timers.push(t);
    }

    var L = CFG[Math.min(level, 2)];
    var emojis = UI.distinct(KG_DATA.matchPool, L.pairs);
    var deck = UI.shuffle(emojis.concat(emojis));
    var moves = 0, matched = 0, first = null, lock = true;

    c.innerHTML = '';
    var panel = UI.el('div', 'game-panel');
    panel.appendChild(UI.el('div', 'question-text', '🎴 记住位置，找出一样的！'));
    var chip = UI.el('div', 'moves-chip', '找到 0/' + L.pairs);
    var grid = UI.el('div', 'cards-grid');
    grid.style.gridTemplateColumns = 'repeat(' + L.cols + ', 1fr)';
    var cards = [];
    deck.forEach(function (em) {
      var card = UI.el('button', 'mcard',
        '<div class="mcard-inner"><div class="mface back">🎴</div><div class="mface front">' + em + '</div></div>');
      card.dataset.em = em;
      card.addEventListener('click', function () { flip(card); });
      grid.appendChild(card);
      cards.push(card);
    });
    panel.appendChild(chip);
    panel.appendChild(grid);
    c.appendChild(panel);

    // 开局预览
    cards.forEach(function (cd) { cd.classList.add('open'); });
    api.speak('先看一看，记住它们的位置哦！');
    later(function () {
      cards.forEach(function (cd) { cd.classList.remove('open'); });
      lock = false;
      api.speak('开始吧！把一样的找出来！');
    }, 2600);

    function flip(card) {
      if (!active || lock) { return; }
      if (card.classList.contains('open') || card.classList.contains('matched')) { return; }
      api.sfx.flip();
      card.classList.add('open');
      if (!first) { first = card; return; }
      var a = first, b = card;
      first = null;
      lock = true;
      later(function () {
        if (a.dataset.em === b.dataset.em) {
          a.classList.add('matched');
          b.classList.add('matched');
          matched++;
          moves++;
          chip.textContent = '找到 ' + matched + '/' + L.pairs;
          api.sfx.correct();
          if (matched === L.pairs) {
            later(function () {
              var s = moves <= L.pairs + 2 ? 3 : (moves <= L.pairs * 2 ? 2 : 1);
              api.finish(s, level < 2 ? { onNext: function () { level++; }, nextLabel: '➡️ 更难的一关' } : {});
            }, 500);
          } else {
            lock = false;
          }
        } else {
          moves++;
          api.sfx.wrong();
          later(function () {
            a.classList.remove('open');
            b.classList.remove('open');
            lock = false;
          }, 900);
        }
      }, 420);
    }

    return { stop: stop };
  }

  KidGames.register({ id: 'match', name: '对对碰', emoji: '🎴', color: '#EC407A', desc: '翻牌配对小游戏', start: start });
})();
