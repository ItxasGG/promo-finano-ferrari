/* Ferrari Professional · Promoción fin de año · Solentine Cosmética */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURACIÓN DEL PEDIDO
     channel: 'email' (por defecto) o 'whatsapp'.
     Para usar WhatsApp: channel: 'whatsapp' y whatsappNumber con prefijo
     de país, sin espacios ni '+', p. ej. '34600000000'.
     ------------------------------------------------------------------ */
  var ORDER = {
    channel: 'whatsapp',
    whatsappNumber: '34657795878',
    email: 'oficina@solentine.es',
    subject: 'Pedido promoción fin de año Ferrari Professional',
    message: 'Hola, quiero hacer un pedido con la promoción de fin de año de Ferrari Professional.'
  };

  var TIERS = [
    { min: 900, discount: 0.20, product: 0.25 },
    { min: 500, discount: 0.15, product: 0.20 },
    { min: 250, discount: 0.10, product: 0.15 }
  ];
  var MAX = 2000;
  var NEAR = 100;

  document.documentElement.classList.add('js');

  /* ---------- Enlaces de pedido ---------- */
  function orderHref() {
    if (ORDER.channel === 'whatsapp' && /^\d{8,15}$/.test(ORDER.whatsappNumber)) {
      return 'https://wa.me/' + ORDER.whatsappNumber + '?text=' + encodeURIComponent(ORDER.message);
    }
    return 'mailto:' + ORDER.email +
      '?subject=' + encodeURIComponent(ORDER.subject) +
      '&body=' + encodeURIComponent(ORDER.message);
  }
  var href = orderHref();
  var isWa = href.indexOf('https://wa.me/') === 0;
  document.querySelectorAll('.js-order').forEach(function (a) {
    a.setAttribute('href', href);
    if (isWa) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });

  /* ---------- Formato de moneda: 1.250,00 € ----------
     Intl con es-ES no agrupa los miles en cifras de 4 dígitos (1250,00 €),
     así que formateamos a mano para garantizar el punto de millar. */
  function eur(n) {
    var fixed = (Math.round(n * 100) / 100).toFixed(2).split('.');
    var int = fixed[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return int + ',' + fixed[1] + ' €';
  }
  function pct(x) { return Math.round(x * 100) + ' %'; }

  /* ---------- Simulador ---------- */
  var input = document.getElementById('sim-amount');
  var range = document.getElementById('sim-range');
  var outSave = document.getElementById('sim-save');
  var outExtra = document.getElementById('sim-extra');
  var outPctA = document.getElementById('sim-pct-a');
  var outPctB = document.getElementById('sim-pct-b');
  var results = document.getElementById('sim-results');
  var msg = document.getElementById('sim-msg');

  function parseAmount(v) {
    // Acepta "1.250,50", "1250,5" o "1250.5"
    v = String(v).trim();
    if (v.indexOf(',') > -1) v = v.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(v);
    if (!isFinite(n) || n < 0) n = 0;
    return Math.min(n, MAX);
  }

  function tierFor(amount) {
    for (var i = 0; i < TIERS.length; i++) if (amount >= TIERS[i].min) return TIERS[i];
    return null;
  }
  function nextTier(amount) {
    for (var i = TIERS.length - 1; i >= 0; i--) if (amount < TIERS[i].min) return TIERS[i];
    return null;
  }

  function render(amount) {
    range.style.setProperty('--pct', (amount / MAX * 100) + '%');
    var t = tierFor(amount);
    var next = nextTier(amount);

    if (!t) {
      var first = TIERS[TIERS.length - 1];
      results.classList.add('is-inactive');
      outPctA.textContent = pct(first.discount);
      outPctB.textContent = pct(first.product);
      outSave.textContent = 'Ahorras ' + eur(0);
      outExtra.textContent = 'Recibes ' + eur(0) + ' más en producto';
      msg.textContent = 'Te faltan ' + eur(first.min - amount) + ' para acceder a la promoción';
      return;
    }

    results.classList.remove('is-inactive');
    outPctA.textContent = pct(t.discount);
    outPctB.textContent = pct(t.product);
    outSave.textContent = 'Ahorras ' + eur(amount * t.discount);
    outExtra.textContent = 'Recibes ' + eur(amount * t.product) + ' más en producto';

    if (next && next.min - amount < NEAR) {
      msg.textContent = 'Con ' + eur(next.min - amount) + ' más pasas a la siguiente opción';
    } else {
      msg.textContent = '';
    }
  }

  if (input && range) {
    input.addEventListener('input', function () {
      var a = parseAmount(input.value);
      range.value = a;
      render(a);
    });
    input.addEventListener('blur', function () {
      var a = parseAmount(input.value);
      if (String(a) !== input.value) input.value = a;
    });
    range.addEventListener('input', function () {
      var a = parseAmount(range.value);
      input.value = a;
      render(a);
    });
    render(parseAmount(input.value));
  }

  /* ---------- Aparición al hacer scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- CTA fijo en móvil ----------
     Aparece cuando el botón del hero sale de pantalla y se oculta
     cuando el CTA final está visible, para no duplicar botones. */
  var sticky = document.getElementById('sticky-cta');
  var heroCta = document.getElementById('hero-cta');
  var finalSection = document.getElementById('pedido');
  if (sticky && heroCta && 'IntersectionObserver' in window) {
    var stickyLink = sticky.querySelector('a');
    var heroGone = false;
    var finalShown = false;

    function update() {
      var show = heroGone && !finalShown;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      stickyLink.setAttribute('tabindex', show ? '0' : '-1');
      document.body.classList.toggle('has-sticky', show);
    }

    new IntersectionObserver(function (entries) {
      var e = entries[0];
      heroGone = !e.isIntersecting && e.boundingClientRect.top < 0;
      update();
    }).observe(heroCta);

    if (finalSection) {
      new IntersectionObserver(function (entries) {
        finalShown = entries[0].isIntersecting;
        update();
      }, { threshold: 0.25 }).observe(finalSection);
    }
  }
})();
