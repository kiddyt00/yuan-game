var AudioMan = (function () {
  var ctx = null;
  var soundOn = (function () { try { return localStorage.getItem('kg_sound') !== '0'; } catch (e) { return true; } })();
  var ttsOK = ('speechSynthesis' in window) && ('SpeechSynthesisUtterance' in window);
  var voices = [];
  // 音色偏好：越靠前越优先（声音更自然、更贴近儿童内容）
  var PREF_ZH = ['xiaoxiao', '晓晓', 'xiaoyi', '小艺', 'yaoyao', '婷婷', 'huihui', 'google 普通话', 'google', '普通话', 'zh'];
  var PREF_EN = ['aria', 'jenny', 'samantha', 'libby', 'google us english', 'google', 'natural', 'en'];

  function refreshVoices() {
    if (!ttsOK) { return; }
    try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; }
  }
  if (ttsOK) {
    refreshVoices();
    try { window.speechSynthesis.onvoiceschanged = refreshVoices; } catch (e) {}
    // 部分 WebView 的 voices 加载很慢，补两次延迟刷新
    setTimeout(refreshVoices, 600);
    setTimeout(refreshVoices, 1800);
  }

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { ctx = new AC(); } catch (e) { ctx = null; } }
    }
    if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  function tone(freq, delay, dur, type, vol) {
    if (!soundOn) { return; }
    var c = ac();
    if (!c) { return; }
    try {
      var t = c.currentTime + (delay || 0);
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol || 0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) {}
  }

  var sfx = {
    tap: function () { tone(700, 0, 0.08, 'sine', 0.14); },
    flip: function () { tone(500, 0, 0.06, 'square', 0.08); },
    correct: function () { tone(660, 0, 0.12); tone(880, 0.1, 0.18); },
    wrong: function () { tone(220, 0, 0.18, 'triangle', 0.2); tone(180, 0.15, 0.22, 'triangle', 0.18); },
    win: function () {
      var notes = [523, 659, 784, 1047];
      for (var i = 0; i < notes.length; i++) { tone(notes[i], i * 0.13, 0.25); }
      tone(1319, 0.55, 0.5);
    }
  };

  function storedURI(prefix) {
    try { return localStorage.getItem('kg_voice_' + prefix); } catch (e) { return null; }
  }
  function scoreVoice(v, prefs) {
    var s = ((v.name || '') + ' ' + (v.lang || '')).toLowerCase();
    for (var i = 0; i < prefs.length; i++) {
      if (s.indexOf(prefs[i]) >= 0) { return prefs.length - i; }
    }
    return 0;
  }
  function bestVoice(prefix) {
    var cands = listVoices(prefix);
    if (!cands.length) { return null; }
    var prefs = prefix === 'zh' ? PREF_ZH : PREF_EN;
    cands.sort(function (a, b) { return scoreVoice(b, prefs) - scoreVoice(a, prefs); });
    return cands[0];
  }
  function listVoices(prefix) {
    var out = [];
    for (var i = 0; i < voices.length; i++) {
      if ((voices[i].lang || '').toLowerCase().indexOf(prefix) === 0) { out.push(voices[i]); }
    }
    return out;
  }
  function pickVoice(lang) {
    if (!voices.length) { return null; }
    var prefix = (lang || 'zh-CN').toLowerCase().split('-')[0];
    var uri = storedURI(prefix);
    if (uri) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].voiceURI === uri) { return voices[i]; }
      }
    }
    return bestVoice(prefix);
  }
  function currentVoiceURI(prefix) {
    var v = pickVoice(prefix === 'zh' ? 'zh-CN' : 'en-US');
    return v ? v.voiceURI : null;
  }
  function setVoice(prefix, uri) {
    try { localStorage.setItem('kg_voice_' + prefix, uri); } catch (e) {}
  }

  function stopSpeak() { if (ttsOK) { try { window.speechSynthesis.cancel(); } catch (e) {} } }

  function makeUtter(it, forced) {
    var u = new SpeechSynthesisUtterance(String(it.text));
    u.lang = it.lang || 'zh-CN';
    u.rate = it.rate || 0.9;
    u.pitch = 1.05;
    var v = forced || pickVoice(u.lang);
    if (v) { u.voice = v; }
    return u;
  }

  function speak(text, lang, rate) {
    if (!soundOn || !ttsOK || !text) { return; }
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(makeUtter({ text: text, lang: lang, rate: rate }));
    } catch (e) {}
  }

  function speakWith(voice, text, lang) {
    if (!soundOn || !ttsOK || !text) { return; }
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(makeUtter({ text: text, lang: lang }, voice));
    } catch (e) {}
  }

  function speakSeq(items, onItem, onDone) {
    if (!soundOn || !ttsOK) { if (onDone) { onDone(); } return; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    var i = 0;
    function next() {
      if (i >= items.length) { if (onDone) { onDone(); } return; }
      var it = items[i];
      if (onItem) { onItem(i); }
      try {
        var u = makeUtter(it);
        var advanced = false;
        function adv() {
          if (advanced) { return; }
          advanced = true;
          i++;
          setTimeout(next, it.gap != null ? it.gap : 400);
        }
        u.onend = adv;
        u.onerror = adv;
        window.speechSynthesis.speak(u);
        // 部分 WebView 不触发 onend，按文本长度估算兜底
        var est = Math.max(1400, String(it.text).length * 420 / (it.rate || 0.9));
        setTimeout(adv, est + 2600);
      } catch (e) {
        i++;
        setTimeout(next, 300);
      }
    }
    next();
  }

  return {
    sfx: sfx,
    speak: speak,
    speakWith: speakWith,
    speakSeq: speakSeq,
    stopSpeak: stopSpeak,
    refreshVoices: refreshVoices,
    listVoices: listVoices,
    setVoice: setVoice,
    currentVoiceURI: currentVoiceURI,
    get soundOn() { return soundOn; },
    set soundOn(v) {
      soundOn = !!v;
      if (!v) { stopSpeak(); }
      try { localStorage.setItem('kg_sound', v ? '1' : '0'); } catch (e) {}
    }
  };
})();
