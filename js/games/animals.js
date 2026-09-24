(function () {
  function start(api) {
    var active = true;
    var c = api.container;
    function stop() { active = false; api.stopSpeak(); }

    function buildScene(parent, groups) {
      var scene = UI.el('div', 'scene');
      var deco = ['🌳', '🌻', '🍄', '🌷', '🌿'];
      for (var d = 0; d < 5; d++) {
        var de = UI.el('div', 'scene-deco', UI.pick(deco));
        de.style.left = UI.rand(4, 86) + '%';
        de.style.top = UI.rand(4, 78) + '%';
        scene.appendChild(de);
      }
      var cols = 6, rows = 4;
      var cellIdx = [];
      for (var ci = 0; ci < cols * rows; ci++) { cellIdx.push(ci); }
      cellIdx = UI.shuffle(cellIdx);
      var flat = [];
      groups.forEach(function (g, gi) {
        for (var i = 0; i < g.count; i++) { flat.push(gi); }
      });
      flat.forEach(function (gi, k) {
        var g = groups[gi];
        var it = UI.el('div', 'scene-item', g.emoji);
        it.setAttribute('data-gi', String(gi));
        var cell = cellIdx[k];
        var cx = cell % cols, cy = Math.floor(cell / cols);
        it.style.left = (cx * 100 / cols + UI.rand(2, 9)) + '%';
        it.style.top = (cy * 100 / rows + UI.rand(2, 7)) + '%';
        it.style.transform = 'rotate(' + UI.rand(-14, 14) + 'deg)';
        scene.appendChild(it);
      });
      parent.appendChild(scene);
      return scene;
    }

    function eachItem(scene, fn) {
      var items = scene.querySelectorAll('.scene-item');
      for (var i = 0; i < items.length; i++) { fn(items[i]); }
    }

    function showModes() {
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      panel.appendChild(UI.el('div', 'question-text', '🐾 想玩哪一个呢？'));
      var grid = UI.el('div', 'mode-grid');
      var modes = [
        { emoji: '🔍', name: '找动物', btn: 'btn-teal', fn: findMode },
        { emoji: '🔢', name: '数动物', btn: 'btn-orange', fn: countMode }
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
      api.speak('想玩找动物，还是数动物呢？');
    }

    function findMode() {
      var rounds = 3, ri = 0, wrong = 0;
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      var prog = UI.makeProgress(rounds);
      var qText = UI.el('div', 'question-text', '');
      var chipWrap = UI.el('div', 'scene-wrap');
      var sceneWrap = UI.el('div', 'scene-wrap');
      panel.appendChild(prog);
      panel.appendChild(qText);
      panel.appendChild(chipWrap);
      panel.appendChild(sceneWrap);
      c.appendChild(panel);

      function renderRound() {
        var species = UI.distinct(KG_DATA.animalSpecies, 4);
        var target = species[0];
        var k = UI.rand(3, 6);
        var groups = [{ emoji: target.emoji, name: target.name, count: k }];
        for (var i = 1; i < 4; i++) {
          groups.push({ emoji: species[i].emoji, name: species[i].name, count: UI.rand(2, 4) });
        }
        qText.textContent = '把所有的' + target.name + ' ' + target.emoji + ' 找出来！';
        sceneWrap.innerHTML = '';
        var scene = buildScene(sceneWrap, groups);
        var chip = UI.el('div', 'scene-chip', '找到 0/' + k);
        chipWrap.innerHTML = '';
        chipWrap.appendChild(chip);
        var found = 0;

        eachItem(scene, function (it) {
          it.addEventListener('click', function () {
            if (!active || it.classList.contains('found')) { return; }
            if (it.getAttribute('data-gi') === '0') {
              found++;
              it.classList.add('found');
              api.sfx.correct();
              api.speak('找到啦！');
              chip.textContent = '找到 ' + found + '/' + k;
              if (found === k) {
                api.praise();
                setTimeout(function () {
                  if (!active) { return; }
                  ri++;
                  prog.next();
                  if (ri >= rounds) {
                    var s = wrong === 0 ? 3 : (wrong <= 3 ? 2 : 1);
                    api.finish(s, { onNext: function () {}, nextLabel: '🔁 再玩一次' });
                  } else {
                    renderRound();
                  }
                }, 1200);
              }
            } else {
              wrong++;
              api.sfx.wrong();
              UI.shake(it);
              api.speak('这不是' + target.name + '，再找找看！');
            }
          });
        });
        api.speak('请把所有的' + target.name + '找出来！');
      }
      renderRound();
    }

    function countMode() {
      var total = 8, qi = 0, stars = 0, firstTry = true;
      c.innerHTML = '';
      var panel = UI.el('div', 'game-panel');
      var prog = UI.makeProgress(total);
      var qText = UI.el('div', 'question-text', '');
      var sceneWrap = UI.el('div', 'scene-wrap');
      var optBox = UI.el('div', 'options');
      panel.appendChild(prog);
      panel.appendChild(qText);
      panel.appendChild(sceneWrap);
      panel.appendChild(optBox);
      c.appendChild(panel);

      function render() {
        firstTry = true;
        var nspec = UI.rand(2, 3);
        var species = UI.distinct(KG_DATA.animalSpecies, nspec);
        var counts = species.map(function () { return UI.rand(2, 9); });
        var targetIdx = UI.rand(0, species.length - 1);
        var groups = species.map(function (s, i) {
          return { emoji: s.emoji, name: s.name, count: counts[i] };
        });
        var t = groups[targetIdx];
        var n = counts[targetIdx];
        qText.textContent = '数一数，有几只' + t.name + ' ' + t.emoji + '？';
        sceneWrap.innerHTML = '';
        var scene = buildScene(sceneWrap, groups);

        eachItem(scene, function (it) {
          it.addEventListener('click', function () {
            if (!active || it.classList.contains('counted')) { return; }
            if (it.getAttribute('data-gi') === String(targetIdx)) {
              var k = scene.querySelectorAll('.counted').length + 1;
              it.classList.add('counted');
              it.appendChild(UI.el('span', 'cnt-badge', String(k)));
              api.sfx.tap();
              api.speak(String(k));
            } else {
              api.sfx.wrong();
              UI.shake(it);
            }
          });
        });

        optBox.innerHTML = '';
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
              api.speak('一共有' + n + '只' + t.name + '！');
              setTimeout(function () {
                if (!active) { return; }
                qi++;
                prog.next();
                if (qi >= total) {
                  var s = stars >= 7 ? 3 : (stars >= 5 ? 2 : 1);
                  api.finish(s, { onNext: function () {}, nextLabel: '🔀 换个玩法' });
                } else {
                  render();
                }
              }, 1400);
            } else {
              firstTry = false;
              api.retryMsg();
              b.classList.add('dim');
              UI.shake(b);
            }
          });
          optBox.appendChild(b);
        });
        api.speak('数一数，草地上有几只' + t.name + '？');
      }
      render();
    }

    showModes();
    return { stop: stop };
  }

  KidGames.register({ id: 'animals', name: '找动物', emoji: '🐾', color: '#8D6E63', desc: '找一找，数一数', start: start });
})();
