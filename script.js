/* ====== SONG SETTING ======
   Ilagay ang mp3 mo sa same folder ng index.html at ilagay dito ang filename.
   Kung wala o hindi mag-load ang file, built-in Happy Birthday melody ang tutugtog. */
var SONG_FILE = 'sound.mp3';

$(document).ready(function () {
  var pinks = ['#ff8fb8', '#ffc2d9', '#ffffff', '#d8b4fe', '#f7d9a0', '#f06292'];
  var emojis = ['💖', '💗', '🌸', '✨', '🎀'];
  var lit = true;

  /* ---------- sound effects (all synthesized, no audio files) ---------- */
  var sfxCtx = null, master = null, noiseBuf = null, sfxOn = true, started = false;
  function A() {
    if (!sfxCtx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      sfxCtx = new C();
      master = sfxCtx.createGain();
      master.gain.value = 0.9;
      master.connect(sfxCtx.destination);
      noiseBuf = sfxCtx.createBuffer(1, sfxCtx.sampleRate, sfxCtx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (sfxCtx.state === 'suspended') sfxCtx.resume();
    return sfxCtx;
  }
  function tone(f0, f1, dur, type, vol, at) {
    var c = A();
    if (!c || !sfxOn) return;
    var t = c.currentTime + (at || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, ftype, f0, f1, vol, at) {
    var c = A();
    if (!c || !sfxOn) return;
    var t = c.currentTime + (at || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf; s.loop = true;
    fl.type = ftype; fl.Q.value = 1.2;
    fl.frequency.setValueAtTime(f0, t);
    fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.05, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.02);
  }
  function thud(v, p) { tone(150 * p, 45 * p, 0.25, 'sine', 0.55 * v); noise(0.08, 'lowpass', 900, 200, 0.25 * v); }
  function pour(d) { noise(d, 'bandpass', 500, 1500, 0.2); tone(220, 330, d, 'sine', 0.04); }
  function swirl() {
    noise(2, 'bandpass', 300, 3200, 0.14);
    for (var i = 0; i < 10; i++) tone(600 + i * 120, null, 0.25, 'sine', 0.07, i * 0.18);
  }
  function whoosh() { noise(0.5, 'bandpass', 2500, 300, 0.22); }
  function bell(f) { tone(f, null, 0.9, 'sine', 0.18); tone(f * 2.01, null, 0.5, 'sine', 0.06); }
  function pop(f) { tone(f, f * 2, 0.09, 'sine', 0.25); }
  function chime() { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, null, 0.7, 'sine', 0.13, i * 0.09); }); }
  function tick() { tone(900, 1400, 0.06, 'triangle', 0.15); }
  function bling() {
    var n = [784, 880, 1047, 1175, 1319], f = n[Math.floor(Math.random() * n.length)];
    tone(f, null, 0.35, 'sine', 0.12); tone(f * 2, null, 0.2, 'sine', 0.04);
  }
  function balloonPop() { noise(0.12, 'highpass', 800, 4000, 0.5); tone(220, 60, 0.15, 'sine', 0.3); }
  function blowSfx() { noise(0.9, 'bandpass', 1800, 400, 0.3); }
  function relightSfx() { noise(0.25, 'bandpass', 300, 2500, 0.2); tone(400, 900, 0.2, 'triangle', 0.08); }
  function paper() { noise(0.25, 'bandpass', 3500, 1500, 0.12); chime(); }

  $('#sfxBtn').on('click', function () {
    sfxOn = !sfxOn;
    $(this).text(sfxOn ? '🔊 Sound on' : '🔇 Sound off');
    if (sfxOn) tick();
  });
  $('#musicBtn').on('click', tick);

  /* ---------- intro: one tap starts the animation + sound (browsers need a tap for audio) ---------- */
  var cakeSvg = document.getElementById('cake');
  if (cakeSvg.pauseAnimations) cakeSvg.pauseAnimations();
  function later(ms, fn) { setTimeout(fn, ms); }
  function begin() {
    if (started) return;
    started = true;
    A();
    bling();
    $('body').removeClass('wait');
    $('#intro').addClass('gone');
    if (cakeSvg.unpauseAnimations) cakeSvg.unpauseAnimations();
    /* timed to the cake animation */
    later(2150, function () { thud(1, 1); });
    later(2550, function () { thud(0.4, 1.3); });
    later(2800, function () { pour(0.5); });
    later(3450, function () { thud(0.8, 1.1); });
    later(3800, function () { pour(0.5); });
    later(4350, function () { thud(0.7, 1.2); });
    later(4600, swirl);
    later(6000, whoosh);
    later(6500, function () { bell(1319); noise(0.4, 'bandpass', 600, 2200, 0.15); });
    later(6700, function () { pop(660); });
    later(6850, function () { pop(740); });
    later(7000, function () { pop(830); });
    later(7100, function () { pop(520); });
    later(7200, function () { for (var i = 0; i < 6; i++) tone(1200 + i * 150, null, 0.3, 'sine', 0.06, i * 0.07); });
    later(7400, chime);
  }
  $('#startBtn').on('click', begin);

  /* ---------- candle: blow out / relight ---------- */
  function shower() {
    var end = Date.now() + 3000;
    (function frame() {
      confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors: pinks });
      confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: pinks });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  $('#candle').on('click', function () {
    if (lit) {
      lit = false;
      blowSfx();
      $('.fire').stop(true).fadeOut(500);
      shower();
      var $w = $('#wish').removeClass('show');
      void $w[0].offsetWidth;
      $w.addClass('show');
      $('#hint').text('Tap the candle again to relight 🕯️');
      playSong();
    } else {
      lit = true;
      relightSfx();
      $('.fire').stop(true).fadeIn(400);
      $('#hint').text('Tap the candle & make a wish 🕯️');
    }
  });

  /* ---------- balloons: pop, then a new one floats back ---------- */
  $('.balloon').on('click', function () {
    var rect = this.getBoundingClientRect();
    var $b = $(this);
    balloonPop();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
      colors: [$b.css('background-color'), '#ffffff', '#f7d9a0']
    });
    $b.addClass('popped');
    setTimeout(function () { $b.removeClass('popped'); }, 5000);
  });

  /* ---------- tap anywhere = little heart burst ---------- */
  function burst(x, y) {
    for (var i = 0; i < 8; i++) {
      var el = document.createElement('span');
      el.textContent = emojis[i % emojis.length];
      el.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;z-index:9998;pointer-events:none;font-size:' + (14 + Math.random() * 10) + 'px';
      document.body.appendChild(el);
      var a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 50;
      el.animate([
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + Math.cos(a) * d + 'px),calc(-50% + ' + (Math.sin(a) * d - 20) + 'px)) scale(1.1)', opacity: 0 }
      ], { duration: 900, easing: 'ease-out' }).onfinish = (function (n) { return function () { n.remove(); }; })(el);
    }
  }
  $(document).on('pointerdown', function (e) {
    if ($(e.target).closest('.modal, button, .intro').length) return;
    burst(e.clientX, e.clientY);
    if (!$(e.target).closest('.balloon, #candle').length) bling();
  });

  /* ---------- sparkle cursor trail (mouse + touch) ---------- */
  var canvas = document.getElementById('magicCursor');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouse = { x: null, y: null };
  function size() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  size();
  window.addEventListener('resize', size);

  window.addEventListener('pointermove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (Math.random() > 0.3) particles.push(new Particle());
  });

  function Particle() {
    var colors = ['rgba(255,255,255,0.85)', 'rgba(255,143,184,0.75)', 'rgba(247,217,160,0.8)', 'rgba(216,180,254,0.7)'];
    this.x = mouse.x;
    this.y = mouse.y;
    this.size = Math.random() * 2 + 1.5;
    this.speedX = Math.random() - 0.5;
    this.speedY = Math.random() - 0.5;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.life = 100;
  }
  Particle.prototype.update = function () {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 3;
    if (this.size > 0.05) this.size -= 0.05;
  };
  Particle.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  };
  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].life <= 0 || particles[i].size <= 0.1) particles.splice(i, 1);
    }
    requestAnimationFrame(animate);
  })();

  /* ---------- background: stars, bunting, floating hearts ---------- */
  var stars = document.getElementById('stars');
  for (var s = 0; s < 55; s++) {
    var st = document.createElement('div');
    var sz = 1 + Math.random() * 2;
    st.className = 'star';
    st.style.cssText = 'left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;width:' + sz + 'px;height:' + sz + 'px;--t:' + (2 + Math.random() * 3) + 's;animation-delay:-' + Math.random() * 4 + 's';
    stars.appendChild(st);
  }

  var flagColors = ['#ff8fb8', '#fff0f6', '#f7d9a0', '#d8b4fe', '#ffc2d9', '#f06292'];
  var bunting = document.getElementById('bunting');
  for (var f = 0; f < 14; f++) {
    var fl = document.createElement('div');
    fl.className = 'flag';
    fl.style.background = flagColors[f % flagColors.length];
    fl.style.animationDelay = '-' + (f % 4) * 0.7 + 's';
    bunting.appendChild(fl);
  }

  setInterval(function () {
    if (document.hidden) return;
    var h = document.createElement('span');
    h.className = 'float';
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.left = Math.random() * 96 + '%';
    h.style.setProperty('--s', 14 + Math.random() * 14 + 'px');
    h.style.setProperty('--d', 7 + Math.random() * 6 + 's');
    h.style.setProperty('--x', Math.random() * 80 - 40 + 'px');
    document.body.appendChild(h);
    setTimeout(function () { h.remove(); }, 14000);
  }, 900);

  /* ---------- Happy Birthday melody (Web Audio, no file needed) ---------- */
  var F = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 784 };
  var song = 'G4:.75 G4:.25 A4:1 G4:1 C5:1 B4:2 G4:.75 G4:.25 A4:1 G4:1 D5:1 C5:2 G4:.75 G4:.25 G5:1 E5:1 C5:1 B4:1 A4:2 F5:.75 F5:.25 E5:1 C5:1 D5:1 C5:2';
  var ac = null, stopTimer = null;
  var $music = $('#musicBtn');

  function stopMelody() {
    clearTimeout(stopTimer);
    if (ac) { ac.close(); ac = null; }
    $music.text('🎵 Play song');
  }
  function playMelody() {
    stopMelody();
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    var t = ac.currentTime + 0.05, beat = 0.42;
    song.split(' ').forEach(function (n) {
      var p = n.split(':'), d = parseFloat(p[1]) * beat;
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.value = F[p[0]];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + d * 0.95);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t);
      o.stop(t + d);
      t += d;
    });
    $music.text('⏸ Stop song');
    stopTimer = setTimeout(stopMelody, (t - ac.currentTime) * 1000);
  }

  /* mp3 first, melody as fallback */
  var mp3 = SONG_FILE ? new Audio(SONG_FILE) : null;
  var mp3Ok = !!mp3;
  if (mp3) {
    mp3.preload = 'auto';
    mp3.addEventListener('error', function () { mp3Ok = false; });
    mp3.addEventListener('ended', function () { $music.text('🎵 Play song'); });
  }
  function isPlaying() { return !!ac || (mp3Ok && mp3 && !mp3.paused); }
  function stopSong() {
    stopMelody();
    if (mp3) { mp3.pause(); mp3.currentTime = 0; }
    $music.text('🎵 Play song');
  }
  function playSong() {
    stopSong();
    if (mp3Ok) {
      mp3.play().then(function () { $music.text('⏸ Stop song'); })
        .catch(function () { mp3Ok = false; playMelody(); });
    } else {
      playMelody();
    }
  }
  $music.on('click', function () { isPlaying() ? stopSong() : playSong(); });

  /* ---------- letter popup ---------- */
  function letter(open) {
    if (open) paper(); else tick();
    $('#letter').toggleClass('open', open).attr('aria-hidden', !open);
    if (open) $('#closeLetter').trigger('focus');
  }
  $('#letterBtn').on('click', function () { letter(true); });
  $('#closeLetter').on('click', function () { letter(false); });
  $('#letter').on('click', function (e) { if (e.target === this) letter(false); });
  $(document).on('keydown', function (e) { if (e.key === 'Escape') letter(false); });
});