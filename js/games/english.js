(function () {
  // goNext：结算页"下一项"时记录要直接进入的模式
  var goNext = null;

  function start(api) {
    var active = true;
    var c = api.container;
    function stop() { active = false; api.stopSpeak(); }

    function menu() {
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      panel.appendChild(UI.el('div', 'question-text', '🔤 想学哪一样呢？'));
      var grid = UI.el('div', 'mode-grid');
      var modes = [
        { emoji: '🔤', name: '字母乐园', btn: 'btn-purple', fn: lettersHome },
        { emoji: '🔊', name: '听音找图', btn: 'btn-teal', fn: listenPick },
        { emoji: '👀', name: '认一认', btn: 'btn-orange', fn: flashPick }
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
      api.speak('想先学字母，还是学单词呢？');
    }

    function catPick(title, onPick) {
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      panel.appendChild(UI.el('div', 'question-text', title));
      var grid = UI.el('div', 'mode-grid');
      KG_DATA.englishCategories.forEach(function (cat) {
        var b = UI.el('button', 'mode-btn ' + cat.btn,
          '<div class="mode-emoji">' + cat.emoji + '</div><div class="mode-name">' + cat.name + '</div>');
        b.addEventListener('click', function () {
          if (!active) { return; }
          api.sfx.tap();
          onPick(cat);
        });
        grid.appendChild(b);
      });
      panel.appendChild(grid);
      c.appendChild(panel);
      api.speak('想学哪一类单词呀？');
    }

    function scaleStars(s, total) {
      if (s >= total - 1) { return 3; }
      if (s >= Math.ceil(total * 0.6)) { return 2; }
      return 1;
    }

    /* ---------- 字母乐园 ---------- */
    function lettersHome() {
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      panel.appendChild(UI.el('div', 'question-text', '🔤 点一点字母，听一听！'));
      var show = UI.el('div', 'letter-show');
      var big = UI.el('div', 'letter-big', 'Aa');
      var em = UI.el('div', 'letter-emoji', '🍎');
      show.appendChild(big);
      show.appendChild(em);
      var board = UI.el('div', 'letter-board');
      var quizBtn = UI.el('button', 'big-btn btn-green', '🎯 考一考');
      panel.appendChild(show);
      panel.appendChild(board);
      panel.appendChild(quizBtn);
      c.appendChild(panel);

      KG_DATA.letters.forEach(function (L) {
        var b = UI.el('button', 'letter-card', L.L + L.L.toLowerCase());
        b.addEventListener('click', function () {
          if (!active) { return; }
          var all = board.querySelectorAll('.letter-card');
          for (var i = 0; i < all.length; i++) { all[i].classList.remove('active'); }
          b.classList.add('active');
          big.textContent = L.L + L.L.toLowerCase();
          em.textContent = L.emoji;
          api.sfx.tap();
          api.speakSeq([
            { text: L.L, lang: 'en-US', rate: 0.75, gap: 200 },
            { text: L.L, lang: 'en-US', rate: 0.75, gap: 250 },
            { text: L.L + ' is for ' + L.word + '!', lang: 'en-US', rate: 0.85 }
          ], null, null);
        });
        board.appendChild(b);
      });
      quizBtn.addEventListener('click', function () { if (active) { letterQuiz(); } });
      api.speak('点一点字母，听一听它们的声音吧！');
    }

    function letterQuiz() {
      var total = 8, qi = 0, stars = 0, firstTry = true;
      var targets = UI.shuffle(KG_DATA.letters).slice(0, total);
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      var prog = UI.makeProgress(total);
      var qText = UI.el('div', 'question-text', '');
      var optBox = UI.el('div', 'quiz-letters');
      panel.appendChild(prog);
      panel.appendChild(qText);
      panel.appendChild(optBox);
      c.appendChild(panel);

      function render() {
        firstTry = true;
        var L = targets[qi];
        qText.textContent = '🔍 听一听，找出字母 ' + L.L;
        optBox.innerHTML = '';
        var others = UI.shuffle(KG_DATA.letters.filter(function (x) { return x.L !== L.L; })).slice(0, 3);
        var opts = UI.shuffle([L].concat(others));
        opts.forEach(function (o) {
          var b = UI.el('button', 'letter-card', o.L);
          b.addEventListener('click', function () {
            if (!active || b.classList.contains('dim')) { return; }
            if (o === L) {
              if (firstTry) { stars++; }
              b.classList.add('correct');
              api.sfx.correct();
              api.speakSeq([
                { text: L.L, lang: 'en-US', rate: 0.8 },
                { text: L.L + ' is for ' + L.word + '!', lang: 'en-US', rate: 0.85 }
              ], null, null);
              setTimeout(function () {
                if (!active) { return; }
                qi++;
                prog.next();
                if (qi >= total) {
                  api.finish(scaleStars(stars, total), {
                    onNext: function () { goNext = function () { lettersHome(); }; },
                    nextLabel: '🔤 回字母乐园'
                  });
                } else {
                  render();
                }
              }, 1800);
            } else {
              firstTry = false;
              api.retryMsg();
              b.classList.add('dim');
              UI.shake(b);
            }
          });
          optBox.appendChild(b);
        });
        api.speakSeq([
          { text: '找出字母', lang: 'zh-CN' },
          { text: L.L, lang: 'en-US', rate: 0.7, gap: 200 },
          { text: L.L, lang: 'en-US', rate: 0.7 }
        ], null, null);
      }
      render();
    }

    /* ---------- 听音找图 ---------- */
    function listenPick() {
      catPick('🔊 想考哪一类单词？', function (cat) { listenRound(cat); });
    }

    function listenRound(cat) {
      var total = Math.min(8, cat.words.length), qi = 0, stars = 0, firstTry = true;
      var words = UI.shuffle(cat.words).slice(0, total);
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      var prog = UI.makeProgress(total);
      var qText = UI.el('div', 'question-text', '听一听，点出你听到的');
      var showBox = UI.el('div', 'show-box');
      showBox.appendChild(UI.el('div', 'emoji-show', '🔊'));
      var optBox = UI.el('div', 'options');
      var hearBtn = UI.el('button', 'big-btn btn-blue', '🔊 再听一次');
      panel.appendChild(prog);
      panel.appendChild(qText);
      panel.appendChild(showBox);
      panel.appendChild(optBox);
      panel.appendChild(hearBtn);
      c.appendChild(panel);

      function render() {
        firstTry = true;
        var w = words[qi];
        optBox.innerHTML = '';
        var others = UI.shuffle(cat.words.filter(function (x) { return x.en !== w.en; })).slice(0, 2);
        var opts = UI.shuffle([w].concat(others));
        opts.forEach(function (ow) {
          var b = UI.el('button', 'option-btn emoji-opt', ow.emoji);
          b.addEventListener('click', function () {
            if (!active || b.classList.contains('dim')) { return; }
            if (ow === w) {
              if (firstTry) { stars++; }
              b.classList.add('correct');
              api.sfx.correct();
              api.speakSeq([
                { text: w.en, lang: 'en-US', rate: 0.8 },
                { text: '就是' + w.zh + '！', lang: 'zh-CN' }
              ], null, null);
              setTimeout(function () {
                if (!active) { return; }
                qi++;
                prog.next();
                if (qi >= total) {
                  api.finish(scaleStars(stars, total), {
                    onNext: function () { goNext = function () { listenRound(cat); }; },
                    nextLabel: '🎧 再考一轮'
                  });
                } else {
                  render();
                }
              }, 1800);
            } else {
              firstTry = false;
              b.classList.add('dim');
              UI.shake(b);
              api.speakSeq([
                { text: UI.pick(KG_DATA.retry) },
                { text: w.en, lang: 'en-US', rate: 0.75 }
              ], null, null);
            }
          });
          optBox.appendChild(b);
        });
        hearBtn.onclick = function () {
          if (active) { AudioMan.speak(w.en, 'en-US', 0.75); }
        };
        if (qi === 0) {
          api.speakSeq([
            { text: '听一听，点出你听到的单词', lang: 'zh-CN' },
            { text: w.en, lang: 'en-US', rate: 0.75 }
          ], null, null);
        } else {
          api.speak(w.en, 'en-US', 0.75);
        }
      }
      render();
    }

    /* ---------- 认一认闪卡 ---------- */
    function flashPick() {
      catPick('👀 想认哪一类单词？', function (cat) { flashcards(cat); });
    }

    function flashcards(cat) {
      var i = 0;
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      panel.appendChild(UI.el('div', 'question-text', cat.emoji + ' ' + cat.name + ' · 认一认'));
      var chip = UI.el('div', 'pos-chip', '1 / ' + cat.words.length);
      var card = UI.el('button', 'flash-card');
      var em = UI.el('div', 'flash-emoji', '');
      var en = UI.el('div', 'flash-en', '');
      var zh = UI.el('div', 'flash-zh', '');
      card.appendChild(em);
      card.appendChild(en);
      card.appendChild(zh);
      var nav = UI.el('div', 'nav-row');
      var prevBtn = UI.el('button', 'big-btn btn-blue', '◀ 上一张');
      var nextBtn = UI.el('button', 'big-btn btn-orange', '下一张 ▶');
      nav.appendChild(prevBtn);
      nav.appendChild(nextBtn);
      panel.appendChild(chip);
      panel.appendChild(card);
      panel.appendChild(nav);
      c.appendChild(panel);

      function speak(w) {
        api.speakSeq([
          { text: w.en, lang: 'en-US', rate: 0.8 },
          { text: w.zh, lang: 'zh-CN' }
        ], null, null);
      }
      function show() {
        var w = cat.words[i];
        em.textContent = w.emoji;
        en.textContent = w.en;
        zh.textContent = w.zh;
        chip.textContent = (i + 1) + ' / ' + cat.words.length;
        speak(w);
      }
      card.addEventListener('click', function () { if (active) { speak(cat.words[i]); } });
      prevBtn.addEventListener('click', function () {
        if (!active) { return; }
        api.sfx.tap();
        if (i > 0) { i--; show(); }
      });
      nextBtn.addEventListener('click', function () {
        if (!active) { return; }
        api.sfx.tap();
        if (i < cat.words.length - 1) { i++; show(); }
        else { endPanel(); }
      });

      function endPanel() {
        c.innerHTML = '';
        var panel2 = UI.el('div', 'game-panel');
        panel2.appendChild(UI.el('div', 'emoji-show', '🎉'));
        panel2.appendChild(UI.el('div', 'question-text', cat.name + '都认完啦！'));
        var quizBtn = UI.el('button', 'big-btn btn-green', '🔊 听音考一考');
        var againBtn = UI.el('button', 'big-btn btn-orange', '🔁 再看一遍');
        quizBtn.addEventListener('click', function () { if (active) { listenRound(cat); } });
        againBtn.addEventListener('click', function () { if (active) { flashcards(cat); } });
        panel2.appendChild(quizBtn);
        panel2.appendChild(againBtn);
        c.appendChild(panel2);
        api.praise();
        api.speak('都认完啦！要不要考一考？');
      }

      show();
    }

    if (goNext) {
      var f = goNext;
      goNext = null;
      f();
    } else {
      menu();
    }
    return { stop: stop };
  }

  KidGames.register({
    id: 'english', name: '学英语', emoji: '🔤', color: '#42A5F5', desc: '字母和单词，听一听',
    start: start,
    onHome: function () { goNext = null; }
  });
})();
