var KidGames = {
  games: [],
  register: function (g) { this.games.push(g); }
};

var App = (function () {
  var LS_TOTAL = 'kg_stars_total';
  var currentGame = null;
  var pendingNext = null;

  function $(id) { return document.getElementById(id); }

  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function totalStars() { return parseInt(lsGet(LS_TOTAL, '0'), 10) || 0; }
  function addStars(n) { lsSet(LS_TOTAL, String(totalStars() + n)); }
  function gameStars(id) { return parseInt(lsGet('kg_gs_' + id, '0'), 10) || 0; }
  function addGameStars(id, n) { lsSet('kg_gs_' + id, String(gameStars(id) + n)); }

  function showScreen(id) {
    $('home-screen').classList.toggle('active', id === 'home-screen');
    $('game-screen').classList.toggle('active', id === 'game-screen');
  }

  function updateBadges() {
    var t = totalStars();
    $('total-stars').textContent = t;
    $('game-stars').textContent = t;
    var cards = document.querySelectorAll('.menu-card');
    for (var i = 0; i < cards.length; i++) {
      var chip = cards[i].querySelector('.m-stars');
      if (chip) { chip.textContent = '⭐ ' + gameStars(cards[i].getAttribute('data-id')); }
    }
  }

  function buildMenu() {
    var grid = $('game-menu');
    grid.innerHTML = '';
    KidGames.games.forEach(function (g) {
      var b = document.createElement('button');
      b.className = 'menu-card';
      b.style.background = g.color;
      b.setAttribute('data-id', g.id);
      b.innerHTML =
        '<div class="m-emoji">' + g.emoji + '</div>' +
        '<div class="m-name">' + g.name + '</div>' +
        '<div class="m-desc">' + g.desc + '</div>' +
        '<div class="m-stars">⭐ 0</div>';
      b.addEventListener('click', function () { AudioMan.sfx.tap(); openGame(g); });
      grid.appendChild(b);
    });
    updateBadges();
  }

  function stopCurrent() {
    if (currentGame && currentGame.instance && currentGame.instance.stop) {
      currentGame.instance.stop();
    }
    AudioMan.stopSpeak();
    $('celebration').classList.add('hidden');
    pendingNext = null;
  }

  function openGame(g) {
    stopCurrent();
    $('voice-panel').classList.add('hidden');
    currentGame = { game: g, instance: null };
    $('game-title').textContent = g.emoji + ' ' + g.name;
    $('game-container').innerHTML = '';
    showScreen('game-screen');
    updateBadges();
    currentGame.instance = g.start(makeAPI(g));
  }

  function makeAPI(g) {
    return {
      container: $('game-container'),
      speak: function (t, lang, rate) { AudioMan.speak(t, lang, rate); },
      speakSeq: function (items, onItem, onDone) { AudioMan.speakSeq(items, onItem, onDone); },
      stopSpeak: function () { AudioMan.stopSpeak(); },
      sfx: AudioMan.sfx,
      praise: function () {
        AudioMan.sfx.correct();
        AudioMan.speak(UI.pick(KG_DATA.praise));
      },
      retryMsg: function () {
        AudioMan.sfx.wrong();
        AudioMan.speak(UI.pick(KG_DATA.retry));
      },
      finish: function (stars, opts) { doFinish(g, stars, opts || {}); }
    };
  }

  function doFinish(g, stars, opts) {
    var s = Math.max(1, Math.min(3, Math.round(stars) || 1));
    addStars(s);
    addGameStars(g.id, s);
    updateBadges();
    AudioMan.stopSpeak();
    AudioMan.sfx.win();
    $('cele-stars').textContent = new Array(s + 1).join('⭐');
    $('cele-title').textContent = s >= 3 ? '满分通过！' : '挑战成功！';
    var nb = $('cele-next');
    if (opts.onNext) {
      nb.classList.remove('hidden');
      nb.textContent = opts.nextLabel || '➡️ 下一关';
      pendingNext = opts.onNext;
    } else {
      nb.classList.add('hidden');
      pendingNext = null;
    }
    UI.confetti($('confetti-layer'));
    $('celebration').classList.remove('hidden');
    AudioMan.speak(s >= 3 ? '哇！三颗星，你太棒了！' : '太棒了！继续加油！');
  }

  function goHome() {
    if (currentGame && currentGame.game && currentGame.game.onHome) {
      currentGame.game.onHome();
    }
    stopCurrent();
    currentGame = null;
    showScreen('home-screen');
    updateBadges();
  }

  function buildVoiceList(listEl, prefix, sample) {
    listEl.innerHTML = '';
    var vs = AudioMan.listVoices(prefix);
    var cur = AudioMan.currentVoiceURI(prefix);
    if (!vs.length) {
      listEl.appendChild(UI.el('div', 'voice-empty', '（当前设备暂无可用朗读声音）'));
      return;
    }
    vs.forEach(function (v) {
      var on = v.voiceURI === cur;
      var label = (v.name || '（未命名）') + (v.localService === false ? ' ☁️' : '');
      var row = UI.el('button', 'voice-item' + (on ? ' on' : ''),
        '<span class="voice-name">' + label + '</span>' +
        '<span class="voice-mark">' + (on ? '✓ 使用中' : '试听') + '</span>');
      row.addEventListener('click', function () {
        AudioMan.setVoice(prefix, v.voiceURI);
        AudioMan.speakWith(v, sample, prefix === 'zh' ? 'zh-CN' : 'en-US');
        buildVoiceList(listEl, prefix, sample);
      });
      listEl.appendChild(row);
    });
  }

  function openVoicePanel() {
    AudioMan.refreshVoices();
    buildVoiceList($('voice-list-zh'), 'zh', '你好呀，小朋友！我是你的新声音。');
    buildVoiceList($('voice-list-en'), 'en', 'Hello! This is my voice!');
    $('voice-panel').classList.remove('hidden');
  }

  function init() {
    buildMenu();
    $('back-btn').addEventListener('click', function () { AudioMan.sfx.tap(); goHome(); });
    $('cele-replay').addEventListener('click', function () {
      $('celebration').classList.add('hidden');
      var g = currentGame && currentGame.game;
      if (g) { AudioMan.sfx.tap(); openGame(g); }
    });
    $('cele-home').addEventListener('click', function () { AudioMan.sfx.tap(); goHome(); });
    $('cele-next').addEventListener('click', function () {
      $('celebration').classList.add('hidden');
      var fn = pendingNext;
      pendingNext = null;
      var g = currentGame && currentGame.game;
      if (fn) { fn(); }
      if (g) { AudioMan.sfx.tap(); openGame(g); }
    });
    var sb = $('sound-toggle');
    sb.textContent = AudioMan.soundOn ? '🔊' : '🔇';
    sb.addEventListener('click', function () {
      AudioMan.soundOn = !AudioMan.soundOn;
      sb.textContent = AudioMan.soundOn ? '🔊' : '🔇';
      if (AudioMan.soundOn) { AudioMan.sfx.tap(); AudioMan.speak('声音打开啦！'); }
    });
    $('voice-btn').addEventListener('click', function () { AudioMan.sfx.tap(); openVoicePanel(); });
    $('voice-close').addEventListener('click', function () {
      AudioMan.sfx.tap();
      AudioMan.stopSpeak();
      $('voice-panel').classList.add('hidden');
    });
    updateBadges();
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', function () { App.init(); });
