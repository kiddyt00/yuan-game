(function () {
  var order = null, orderIdx = 0;
  function nextPoem() {
    if (!order || orderIdx >= order.length) {
      order = UI.shuffle(KG_DATA.poems);
      orderIdx = 0;
    }
    return order[orderIdx++];
  }

  function start(api) {
    var active = true;
    var c = api.container;
    var poem = nextPoem();
    function stop() { active = false; api.stopSpeak(); }

    // 第一阶段：领读（逐行高亮，可反复听）
    function showListen() {
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      var head = UI.el('div', 'poem-head',
        '<span class="poem-emoji">' + poem.emoji + '</span>' +
        '<div><div class="poem-title">《' + poem.title + '》</div>' +
        '<div class="poem-author">' + poem.author + '</div></div>');
      var lines = UI.el('div', 'poem-lines');
      var lineEls = [];
      poem.lines.forEach(function (l) {
        var d = UI.el('div', 'poem-line', l);
        lines.appendChild(d);
        lineEls.push(d);
      });
      var listenBtn = UI.el('button', 'big-btn btn-purple', '▶️ 听一听');
      var goBtn = UI.el('button', 'big-btn btn-orange hidden', '✨ 开始挑战');
      panel.appendChild(head);
      panel.appendChild(lines);
      panel.appendChild(listenBtn);
      panel.appendChild(goBtn);
      c.appendChild(panel);

      listenBtn.addEventListener('click', function () {
        if (!active) { return; }
        lineEls.forEach(function (e) { e.classList.remove('reading'); });
        var items = [{ text: poem.title + '，' + poem.author + '。', gap: 550 }];
        poem.lines.forEach(function (l) { items.push({ text: l }); });
        api.speakSeq(items, function (i) {
          var li = i - 1;
          lineEls.forEach(function (e, idx) { e.classList.toggle('reading', idx === li); });
        }, function () {
          if (!active) { return; }
          lineEls.forEach(function (e) { e.classList.remove('reading'); });
          goBtn.classList.remove('hidden');
          api.speak('听完啦！现在把听到的句子排一排吧！');
        });
      });
      goBtn.addEventListener('click', function () { if (active) { showChallenge(); } });
      api.speak('小朋友，先听一听这首古诗吧！');
    }

    // 第二阶段：听音排句——点卡片听读音，按顺序点亮；不识字也能玩
    function showChallenge() {
      var progress = 0, wrongCount = 0, firstTryTotal = 0;
      var ORD = ['第一', '第二', '第三', '第四'];

      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      var prog = UI.makeProgress(poem.lines.length);
      var qText = UI.el('div', 'question-text', '按顺序点一点，把古诗排出来！');
      var cardsBox = UI.el('div', 'options');
      var fullBtn = UI.el('button', 'big-btn btn-blue', '🔊 再听全诗');
      panel.appendChild(prog);
      panel.appendChild(qText);
      panel.appendChild(cardsBox);
      panel.appendChild(fullBtn);
      c.appendChild(panel);

      var cardByLine = {};
      UI.shuffle(poem.lines).forEach(function (lineText, i) {
        var card = UI.el('button', 'line-card lc-' + (i % 4),
          '<span class="lc-audio">🔊</span>' + lineText);
        cardByLine[lineText] = card;
        card.addEventListener('click', function () {
          if (!active) { return; }
          if (card.classList.contains('locked')) {
            // 已排好的句子可以再点着听
            api.speak(lineText);
            return;
          }
          if (lineText === poem.lines[progress]) {
            var firstTry = wrongCount === 0;
            if (firstTry) { firstTryTotal++; }
            wrongCount = 0;
            card.classList.add('locked');
            card.classList.remove('hint-glow');
            var badge = UI.el('span', 'ord-badge', String(progress + 1));
            card.appendChild(badge);
            progress++;
            prog.next();
            api.sfx.correct();
            api.speakSeq([{ text: lineText }, { text: UI.pick(KG_DATA.praise) }], null, null);
            if (progress >= poem.lines.length) { complete(); }
          } else {
            wrongCount++;
            UI.shake(card);
            if (wrongCount >= 2) {
              // 连续两次排错：高亮提示 + 回放前文
              var hintCard = cardByLine[poem.lines[progress]];
              if (hintCard) { hintCard.classList.add('hint-glow'); }
              var items = [];
              for (var i2 = 0; i2 < progress; i2++) { items.push({ text: poem.lines[i2] }); }
              items.push({ text: '想一想，' + ORD[progress] + '句是哪一句呢？' });
              api.sfx.wrong();
              api.speakSeq(items, null, null);
            } else {
              api.sfx.wrong();
              api.speakSeq([{ text: lineText }, { text: UI.pick(KG_DATA.retry) }], null, null);
            }
          }
        });
        cardsBox.appendChild(card);
      });

      fullBtn.addEventListener('click', function () {
        if (!active) { return; }
        api.speakSeq(poem.lines.map(function (l) { return { text: l }; }), null, null);
      });

      function complete() {
        // 夸奖并入朗读队列，避免被 speakSeq 的 cancel 打断
        var items = [{ text: UI.pick(KG_DATA.praise) }].concat(
          poem.lines.map(function (l) { return { text: l }; }));
        api.sfx.win();
        api.speakSeq(items, null, function () {
          if (!active) { return; }
          var s = firstTryTotal >= 4 ? 3 : (firstTryTotal >= 3 ? 2 : 1);
          api.finish(s, { onNext: function () {}, nextLabel: '📖 学下一首' });
        });
      }

      api.speakSeq(
        [{ text: '把听到的句子，按顺序排一排吧！先听一遍全诗。' }].concat(
          poem.lines.map(function (l) { return { text: l }; })),
        null, null);
    }

    showListen();
    return { stop: stop };
  }

  KidGames.register({ id: 'poem', name: '背古诗', emoji: '📜', color: '#AB47BC', desc: '听一听，排一排', start: start });
})();
