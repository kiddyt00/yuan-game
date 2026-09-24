(function () {
  function start(api) {
    var active = true;
    var c = api.container;
    function stop() { active = false; api.stopSpeak(); }

    var total = 10, qi = 0, stars = 0, firstTry = true;

    c.innerHTML = '';
    var panel = UI.el('div', 'game-panel');
    var prog = UI.makeProgress(total);
    var qText = UI.el('div', 'question-text', '找一找规律，接下来是哪一个？');
    var seqBox = UI.el('div', 'pattern-row');
    var optBox = UI.el('div', 'options');
    panel.appendChild(prog);
    panel.appendChild(qText);
    panel.appendChild(seqBox);
    panel.appendChild(optBox);
    c.appendChild(panel);
    api.speak('看一看，找一找规律，接下来应该是哪一个呢？');

    function renderHtml(it) {
      if (it.cls) { return '<span class="dot ' + it.cls + '"></span>'; }
      return '<span class="pattern-emoji">' + it.emoji + '</span>';
    }

    function makeQ(i) {
      var pat = [];
      var poolAll;
      if (i < 3) {
        var cs = UI.distinct(KG_DATA.patternColors, 2);
        pat = [cs[0], cs[1]];
        poolAll = KG_DATA.patternColors;
      } else if (i < 6) {
        var es = UI.distinct(KG_DATA.patternEmojis, 2);
        pat = [es[0], es[1]];
        poolAll = KG_DATA.patternEmojis;
      } else if (i < 8) {
        var es2 = UI.distinct(KG_DATA.patternEmojis, 2);
        pat = [es2[0], es2[0], es2[1], es2[1]];
        poolAll = KG_DATA.patternEmojis;
      } else {
        var es3 = UI.distinct(KG_DATA.patternEmojis, 3);
        pat = [es3[0], es3[1], es3[2]];
        poolAll = KG_DATA.patternEmojis;
      }
      var seq = [];
      for (var k = 0; k < 6; k++) { seq.push(pat[k % pat.length]); }
      var answer = pat[6 % pat.length];
      var others = UI.shuffle(poolAll.filter(function (x) { return x !== answer; })).slice(0, 2);
      return { seq: seq, answer: answer, options: UI.shuffle([answer].concat(others)) };
    }

    function render() {
      firstTry = true;
      var q = makeQ(qi);
      seqBox.innerHTML = '';
      optBox.innerHTML = '';
      q.seq.forEach(function (it) {
        var d = UI.el('div', 'pattern-item', renderHtml(it));
        seqBox.appendChild(d);
      });
      seqBox.appendChild(UI.el('div', 'pattern-item pattern-unknown', '?'));

      q.options.forEach(function (it) {
        var b = UI.el('button', 'option-btn pattern-opt', renderHtml(it));
        b.addEventListener('click', function () {
          if (!active || b.classList.contains('dim')) { return; }
          if (it === q.answer) {
            if (firstTry) { stars++; }
            b.classList.add('correct');
            var unk = seqBox.querySelector('.pattern-unknown');
            if (unk) { unk.innerHTML = renderHtml(it); }
            api.praise();
            setTimeout(function () {
              if (!active) { return; }
              qi++;
              prog.next();
              if (qi >= total) {
                var s = stars >= 9 ? 3 : (stars >= 7 ? 2 : 1);
                api.finish(s);
              } else {
                render();
              }
            }, 1000);
          } else {
            firstTry = false;
            api.retryMsg();
            b.classList.add('dim');
            UI.shake(b);
          }
        });
        optBox.appendChild(b);
      });

      var items = q.seq.map(function (it) { return { text: it.name, gap: 280 }; });
      items.push({ text: '接下来是哪一个呢？' });
      api.speakSeq(items, null, null);
    }

    render();
    return { stop: stop };
  }

  KidGames.register({ id: 'pattern', name: '找规律', emoji: '🔷', color: '#26C6DA', desc: '接下来是哪个呢', start: start });
})();
