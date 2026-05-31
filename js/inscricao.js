/* HOUSE CONF 26 — Fluxo de inscrição completo */
(function () {
  'use strict';

  const PRICES = {
    individual_lote1: 80,
    individual_lote2: 100,
    familia3_lote1: 220,
    combo5_lote1: 380,
    crianca_ate10: 0
  };

  const LOTE_ATIVO = 1;
  const BACKEND_URL = 'https://houseconf26-backend.onrender.com';
  const MERCADO_PAGO_CHECKOUT_URL = `${BACKEND_URL}/create-payment`;

  const PAYMENT_METHODS = {
    pix: { label: 'Pix', note: 'Valor normal · compensação rápida', factor: 1, installments: 1 },
    debito: { label: 'Débito', note: 'Valor normal no cartão de débito', factor: 1, installments: 1 },
    credito1x: { label: 'Crédito 1x', note: 'Taxa de cartão embutida', factor: 1 / (1 - 0.0498), installments: 1 },
    credito2x: { label: 'Crédito 2x', note: 'Taxa de cartão embutida', factor: 1 / (1 - 0.0498), installments: 2 },
    credito3x: { label: 'Crédito 3x', note: 'Taxa de cartão embutida', factor: 1 / (1 - 0.0498), installments: 3 }
  };

  const TIPOS = {
    individual_lote1: { key: 'individual_lote1', label: 'Individual — 1º Lote', shortLabel: 'Individual', people: 1, price: PRICES.individual_lote1, disabled: LOTE_ATIVO !== 1 },
    individual_lote2: { key: 'individual_lote2', label: 'Individual — 2º Lote', shortLabel: 'Individual', people: 1, price: PRICES.individual_lote2, disabled: LOTE_ATIVO !== 2 },
    familia3_lote1: { key: 'familia3_lote1', label: 'Combo Família · 3 pessoas', shortLabel: 'Combo Família', people: 3, price: PRICES.familia3_lote1, disabled: LOTE_ATIVO !== 1 },
    combo5_lote1: { key: 'combo5_lote1', label: 'Combo 5 Amigos', shortLabel: 'Combo 5 Amigos', people: 5, price: PRICES.combo5_lote1, disabled: LOTE_ATIVO !== 1 },
    crianca_ate10: { key: 'crianca_ate10', label: 'Criança até 10 anos · Gratuito', shortLabel: 'Criança · Gratuito', people: 1, price: 0, free: true, disabled: true, infoOnly: true }
  };

  const state = {
    step: 1,
    tipo: null,
    metodoPagamento: null,
    data: {},
    participantes: [],
    reference: ''
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function formatMoney(v) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function calcFinal(base, metodo) {
    const cfg = PAYMENT_METHODS[metodo] || PAYMENT_METHODS.pix;
    return Math.round((Number(base) * cfg.factor + Number.EPSILON) * 100) / 100;
  }

  function maskCPF(v) {
    return String(v || '').replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function maskPhone(v) {
    const d = String(v || '').replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function maskDate(v) {
    return String(v || '').replace(/\D/g, '').slice(0, 8)
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2');
  }

  function isValidBirthDate(v) {
    const match = String(v || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return false;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const currentYear = new Date().getFullYear();

    if (year < 1900 || year > currentYear) return false;

    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
  }

  function genReference() {
    const random = Math.floor(1000 + Math.random() * 9000);
    const tail = Date.now().toString().slice(-3);
    return `HC26-${random}${tail}`;
  }

  function goToStep(n) {
    state.step = n;

    $$('.insc-stage').forEach(el => el.classList.remove('active'));
    const stage = $(`.insc-stage[data-stage="${n}"]`);
    if (stage) stage.classList.add('active');

    $$('.insc-step').forEach(el => {
      const num = parseInt(el.dataset.step, 10);
      el.classList.toggle('active', num === n);
      el.classList.toggle('done', num < n);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function applyPlanCardState() {
    $$('.insc-tipo').forEach(card => {
      const tipo = TIPOS[card.dataset.tipo];
      if (!tipo) return;

      if (tipo.disabled || tipo.infoOnly) {
        card.classList.add('is-disabled');
        card.setAttribute('aria-disabled', 'true');

        const input = card.querySelector('input');
        if (input) input.disabled = true;
      }
    });
  }

  function bindStep1() {
  applyPlanCardState();

  $$('.insc-tipo').forEach(card => {
    const tipoKey = card.dataset.tipo;
    const tipo = TIPOS[tipoKey];

    if (!tipo || tipo.disabled || tipo.infoOnly) return;

    card.style.cursor = 'pointer';

    card.addEventListener('click', () => {
      $$('.insc-tipo').forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');

      const input = card.querySelector('input[type="radio"]');
      if (input) input.checked = true;

      state.tipo = tipoKey;

      const btn = $('#insc-continue-1');
      if (btn) {
        btn.disabled = false;
        btn.removeAttribute('disabled');
      }
    });
  });

  const btn = $('#insc-continue-1');

  if (btn) {
    btn.addEventListener('click', () => {
      if (!state.tipo) {
        alert('Selecione um tipo de inscrição para continuar.');
        return;
      }

      const tipo = TIPOS[state.tipo];

      const contexto = $('#insc-form-context');
      if (contexto) contexto.textContent = tipo.label;

      renderParticipantsFields();
      goToStep(2);
    });
  }
  }
  
  function createField({ id, label, type = 'text', required = true, placeholder = '', key, inputmode = '', autocomplete = 'off', full = false, participantIndex = 1 }) {
    const wrap = document.createElement('div');
    wrap.className = `insc-field ${full ? 'insc-field-full' : ''}`;
    wrap.dataset.participantIndex = String(participantIndex);

    wrap.innerHTML = `
      <label for="${id}">${label}</label>
      <input type="${type}" id="${id}" data-key="${key}" data-participant="${participantIndex}" ${inputmode ? `inputmode="${inputmode}"` : ''} autocomplete="${autocomplete}" placeholder="${placeholder}" ${required ? 'required' : ''}>
      <span class="insc-field-error">Campo obrigatório</span>
    `;

    return wrap;
  }

  function renderParticipantsFields() {
    const tipo = TIPOS[state.tipo];
    const container = $('#participantes-extra');

    if (!container || !tipo) return;

    container.innerHTML = '';

    const title = $('.insc-form-section-title');
    if (title) {
      title.textContent = tipo.people > 1 ? 'Dados do responsável pela compra' : 'Dados do participante';
    }

    if (tipo.people <= 1) return;

    const section = document.createElement('div');
    section.className = 'insc-extra-participants';

    section.innerHTML = `
      <div class="insc-extra-header">
        <span>Participantes adicionais</span>
        <p>Informe nome e CPF das outras ${tipo.people - 1} pessoas inclusas neste combo.</p>
      </div>
    `;

    for (let i = 2; i <= tipo.people; i++) {
      const block = document.createElement('div');
      block.className = 'insc-participant-card';

      block.innerHTML = `
        <h4>${tipo.key === 'combo5_lote1' ? `Amigo ${i}` : `Participante ${i}`}</h4>
        <div class="insc-grid insc-grid-extra"></div>
      `;

      const grid = block.querySelector('.insc-grid-extra');

      grid.appendChild(createField({
        id: `p${i}-nome`,
        label: 'Nome completo',
        key: 'nome',
        full: true,
        participantIndex: i,
        autocomplete: 'name'
      }));

      grid.appendChild(createField({
        id: `p${i}-cpf`,
        label: 'CPF',
        key: 'cpf',
        inputmode: 'numeric',
        placeholder: '000.000.000-00',
        participantIndex: i
      }));

      section.appendChild(block);
    }

    container.appendChild(section);

    $$('input[data-key="cpf"]', container).forEach(inp => {
      inp.addEventListener('input', e => {
        e.target.value = maskCPF(e.target.value);
      });
    });

    $$('#participantes-extra input').forEach(inp => {
      inp.addEventListener('input', () => clearInputError(inp));
    });
  }

  function clearInputError(inp) {
    const field = inp.closest('.insc-field');

    if (field) {
      field.classList.remove('has-error');
      inp.classList.remove('is-error');
    }
  }

  function bindStep2() {
    $('#f-cpf').addEventListener('input', e => {
      e.target.value = maskCPF(e.target.value);
    });

    $('#f-whatsapp').addEventListener('input', e => {
      e.target.value = maskPhone(e.target.value);
    });

    $('#f-nascimento').addEventListener('input', e => {
      e.target.value = maskDate(e.target.value);
    });

    $$('#insc-form input').forEach(inp => {
      inp.addEventListener('input', () => clearInputError(inp));
    });

    ['f-aceito-termos', 'f-aceito-privacidade'].forEach(id => {
      const cb = $('#' + id);

      if (cb) {
        cb.addEventListener('change', () => {
          const t = $('#f-aceito-termos');
          const p = $('#f-aceito-privacidade');

          if (t && p && t.checked && p.checked) {
            $('.insc-consent')?.classList.remove('has-error');
          }
        });
      }
    });

    $('#insc-back-2').addEventListener('click', () => goToStep(1));

    $('#insc-form').addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      collectFormData();
      renderSummary();
      goToStep(3);
    });
  }

  function setError(field, msg) {
    field.classList.add('has-error');

    const input = field.querySelector('input');
    if (input) input.classList.add('is-error');

    const err = field.querySelector('.insc-field-error');
    if (err && msg) err.textContent = msg;
  }

  function validateInput(inp) {
    const field = inp.closest('.insc-field');
    const v = inp.value.trim();
    const key = inp.dataset.key;

    let ok = true;
    let msg = 'Campo obrigatório';

    if (!v) {
      ok = false;
    } else if (key === 'nome' && v.split(/\s+/).length < 2) {
      ok = false;
      msg = 'Informe nome e sobrenome';
    } else if (key === 'cpf' && v.replace(/\D/g, '').length !== 11) {
      ok = false;
      msg = 'CPF incompleto';
    } else if (key === 'nascimento' && !isValidBirthDate(v)) {
      ok = false;
      msg = 'Data inválida. Use DD/MM/AAAA';
    } else if (key === 'email' && !isValidEmail(v)) {
      ok = false;
      msg = 'E-mail inválido';
    } else if (key === 'whatsapp' && v.replace(/\D/g, '').length < 10) {
      ok = false;
      msg = 'WhatsApp incompleto';
    }

    if (!ok && field) setError(field, msg);

    return ok;
  }

  function validateForm() {
    let ok = true;
    let firstErr = null;

    $$('#insc-form input[required]').forEach(inp => {
      if (inp.type === 'checkbox') return;

      const valid = validateInput(inp);

      if (!valid) {
        ok = false;
        if (!firstErr) firstErr = inp.closest('.insc-field');
      }
    });

    const termos = $('#f-aceito-termos');
    const priv = $('#f-aceito-privacidade');

    if (termos && priv && (!termos.checked || !priv.checked)) {
      $('.insc-consent')?.classList.add('has-error');
      ok = false;

      if (!firstErr) firstErr = $('.insc-consent');
    } else {
      $('.insc-consent')?.classList.remove('has-error');
    }

    if (firstErr) {
      firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return ok;
  }

  function collectFormData() {
    const tipo = TIPOS[state.tipo];

    const responsavel = {
      participante_numero: 1,
      nome: $('#f-nome').value.trim(),
      cpf: $('#f-cpf').value.trim(),
      nascimento: $('#f-nascimento').value.trim(),
      whatsapp: $('#f-whatsapp').value.trim(),
      email: $('#f-email').value.trim().toLowerCase(),
      responsavel: true
    };

    const participantes = [responsavel];

    for (let i = 2; i <= tipo.people; i++) {
      participantes.push({
        participante_numero: i,
        nome: $(`#p${i}-nome`)?.value.trim() || '',
        cpf: $(`#p${i}-cpf`)?.value.trim() || '',
        nascimento: '',
        whatsapp: '',
        email: '',
        responsavel: false
      });
    }

    state.participantes = participantes;

    state.data = {
      nome: responsavel.nome,
      cpf: responsavel.cpf,
      nascimento: responsavel.nascimento,
      whatsapp: responsavel.whatsapp,
      email: responsavel.email,
      tipo: tipo.key,
      tipo_label: tipo.label,
      quantidade_participantes: tipo.people,
      valor_base: tipo.price,
      valor_final: tipo.price,
      metodo_pagamento: '',
      status: tipo.free ? 'CONFIRMADO' : 'AGUARDANDO PAGAMENTO',
      participantes,
      aceitou_termos: $('#f-aceito-termos').checked,
      aceitou_privacidade: $('#f-aceito-privacidade').checked,
      consentimento_data: new Date().toISOString()
    };
  }

  function renderPaymentOptions() {
    const tipo = TIPOS[state.tipo];
    const wrap = $('#payment-options');

    if (!wrap) return;

    if (tipo.free) {
      wrap.innerHTML = '';
      return;
    }

    wrap.innerHTML = Object.entries(PAYMENT_METHODS).map(([key, cfg]) => {
      const final = calcFinal(tipo.price, key);
      const installment = cfg.installments > 1
        ? `<strong>${cfg.installments}x de ${formatMoney(final / cfg.installments)}</strong>`
        : `<strong>${formatMoney(final)}</strong>`;

      return `
        <label class="pay-option" data-pay="${key}">
          <input type="radio" name="metodo_pagamento" value="${key}">
          <span class="pay-dot"></span>
          <span class="pay-content">
            <span class="pay-title">${cfg.label}</span>
            <span class="pay-note">${cfg.note}</span>
          </span>
          <span class="pay-value">${installment}</span>
        </label>
      `;
    }).join('');

    $$('.pay-option', wrap).forEach(opt => {
      opt.addEventListener('click', () => {
        $$('.pay-option', wrap).forEach(o => o.classList.remove('is-selected'));

        opt.classList.add('is-selected');

        const input = opt.querySelector('input');
        input.checked = true;

        state.metodoPagamento = input.value;
        state.data.metodo_pagamento = input.value;
        state.data.valor_final = calcFinal(tipo.price, input.value);

        updateTotalForPayment();
      });
    });
  }

  function updateTotalForPayment() {
    const tipo = TIPOS[state.tipo];
    const metodo = state.metodoPagamento;
    const base = tipo.price;
    const final = metodo ? calcFinal(base, metodo) : base;

    $('#sum-total').innerHTML = `<small>R$</small>${final.toFixed(2).replace('.', ',')}`;

    const p = $('#sum-parcela-info');

    if (!metodo) {
      p.textContent = 'Escolha uma forma de pagamento para continuar';
    } else if (metodo.startsWith('credito')) {
      const cfg = PAYMENT_METHODS[metodo];

      p.textContent = cfg.installments > 1
        ? `${cfg.installments}x de ${formatMoney(final / cfg.installments)} · taxa de cartão embutida`
        : 'crédito à vista · taxa de cartão embutida';
    } else {
      p.textContent = `${PAYMENT_METHODS[metodo].label} · valor normal`;
    }
  }

  function renderSummary() {
    const d = state.data;
    const tipo = TIPOS[state.tipo];

    $('#sum-nome').textContent = d.nome;
    $('#sum-tipo').textContent = tipo.label;
    $('#sum-people').textContent = `${tipo.people} ${tipo.people === 1 ? 'participante' : 'participantes'}`;
    $('#sum-whatsapp').textContent = d.whatsapp;
    $('#sum-email').textContent = d.email;
    $('#sum-total').innerHTML = `<small>R$</small>${Number(tipo.price).toFixed(2).replace('.', ',')}`;

    const list = $('#sum-participantes');

    if (list) {
      list.innerHTML = state.participantes.map(p => `
        <div class="sum-person">
          <span>${String(p.participante_numero).padStart(2, '0')}</span>
          <strong>${p.nome}</strong>
          <small>${p.responsavel ? 'Responsável' : 'Participante'} · ${p.cpf}</small>
        </div>
      `).join('');
    }

    if (tipo.free) {
      $('#sum-parcela-info').textContent = 'Entrada gratuita — não há cobrança';
      $('#insc-pay-label').textContent = 'Concluir inscrição';
      $('.insc-summary-cta-note').textContent = 'Crianças até 10 anos não pagam.';
      $('#payment-section')?.classList.add('is-hidden');
    } else {
      state.metodoPagamento = null;
      $('#insc-pay-label').textContent = 'Ir para pagamento';
      $('.insc-summary-cta-note').textContent = 'Você será redirecionado para o ambiente seguro do Mercado Pago.';
      $('#payment-section')?.classList.remove('is-hidden');
      renderPaymentOptions();
      updateTotalForPayment();
    }
  }

  function bindStep3() {
    $('#insc-back-3').addEventListener('click', () => goToStep(2));
    $('#insc-pay').addEventListener('click', handlePayment);
  }

  async function handlePayment() {
    const btn = $('#insc-pay');
    const tipo = TIPOS[state.tipo];
    const originalLabel = $('#insc-pay-label').textContent;

    if (!tipo.free && !state.metodoPagamento) {
      alert('Escolha a forma de pagamento para continuar.');
      $('#payment-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    btn.disabled = true;
    $('#insc-pay-label').textContent = 'Processando…';

    state.reference = state.reference || genReference();
    state.data.reference = state.reference;
    state.data.codigo_inscricao = state.reference;
    state.data.metodo_pagamento = state.metodoPagamento || 'gratuito';
    state.data.valor_final = tipo.free ? 0 : calcFinal(tipo.price, state.metodoPagamento);

    if (tipo.free) {
      showConfirmation();
      return;
    }

    try {
      const res = await fetch(MERCADO_PAGO_CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: state.reference,
          codigo_inscricao: state.reference,
          nome: state.data.nome,
          email: state.data.email,
          whatsapp: state.data.whatsapp,
          cpf: state.data.cpf,
          nascimento: state.data.nascimento,
          tipo: tipo.key,
          tipo_label: tipo.label,
          quantidade_participantes: tipo.people,
          metodo_pagamento: state.metodoPagamento,
          participantes: state.participantes.filter(p => !p.responsavel)
        })
      });

      const json = await res.json();

      if (json && json.reference) state.reference = json.reference;

      if (json && json.init_point) {
        window.location.href = json.init_point;
      } else {
        throw new Error(json?.message || 'Backend respondeu sem init_point');
      }
    } catch (err) {
      console.error('[MP] erro:', err);

      btn.disabled = false;
      $('#insc-pay-label').textContent = originalLabel;

      alert('Não foi possível iniciar o pagamento agora. Tente novamente em instantes ou fale com a organização pelo WhatsApp.');
    }
  }

  function showConfirmation() {
    $('#confirm-code').textContent = state.reference || '—';
    $('#confirm-title-text').innerHTML = 'Inscrição <em>confirmada</em>';
    $('#confirm-msg').innerHTML = `Sua inscrição na House Conf 26 foi registrada.<br>Guarde o código <strong>${state.reference}</strong> para conferência na entrada.`;
    goToStep(4);
  }

  function setupOverlay() {
    const overlay = $('#inscricao-overlay.insc-overlay');
    if (!overlay) return;

    const closeBtn = $('#insc-overlay-close');

    function openOverlay() {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('insc-overlay-open');
      goToStep(1);
    }

    function closeOverlay() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('insc-overlay-open');

      if (window.location.hash === '#inscricao') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
    });

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href="#inscricao"], a[href$="#inscricao"]');

      if (!link) return;

      e.preventDefault();
      openOverlay();

      if (window.location.hash !== '#inscricao') {
        history.pushState(null, '', '#inscricao');
      }
    });

    if (window.location.hash === '#inscricao') {
      setTimeout(openOverlay, 200);
    }
  }

  function init() {
    document.documentElement.classList.add('js-ready');

    const params = new URLSearchParams(window.location.search);
    const preTipo = params.get('tipo');

    if (preTipo && TIPOS[preTipo] && !TIPOS[preTipo].disabled) {
      const card = $(`.insc-tipo[data-tipo="${preTipo}"]`);

      if (card) {
        card.classList.add('is-selected');
        state.tipo = preTipo;
        $('#insc-continue-1').disabled = false;
      }
    }

    bindStep1();
    bindStep2();
    bindStep3();
    setupOverlay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HouseConf26 = {
    PRICES,
    TIPOS,
    PAYMENT_METHODS,
    state,
    goToStep
  };
})();    crianca_ate10: { key: 'crianca_ate10', label: 'Criança até 10 anos · Gratuito', shortLabel: 'Criança · Gratuito', people: 1, price: 0, free: true, disabled: true, infoOnly: true }
  };

  const state = {
    step: 1,
    tipo: null,
    metodoPagamento: null,
    data: {},
    participantes: [],
    reference: ''
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function formatMoney(v) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function calcFinal(base, metodo) {
    const cfg = PAYMENT_METHODS[metodo] || PAYMENT_METHODS.pix;
    return Math.round((Number(base) * cfg.factor + Number.EPSILON) * 100) / 100;
  }

  function maskCPF(v) {
    return String(v || '').replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function maskPhone(v) {
    const d = String(v || '').replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
  }

  function genReference() {
    const random = Math.floor(1000 + Math.random() * 9000);
    const tail = Date.now().toString().slice(-3);
    return `HC26-${random}${tail}`;
  }

  function goToStep(n) {
    state.step = n;
    $$('.insc-stage').forEach(el => el.classList.remove('active'));
    const stage = $(`.insc-stage[data-stage="${n}"]`);
    if (stage) stage.classList.add('active');
    $$('.insc-step').forEach(el => {
      const num = parseInt(el.dataset.step, 10);
      el.classList.toggle('active', num === n);
      el.classList.toggle('done', num < n);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function applyPlanCardState() {
    $$('.insc-tipo').forEach(card => {
      const tipo = TIPOS[card.dataset.tipo];
      if (!tipo) return;
      if (tipo.disabled || tipo.infoOnly) {
        card.classList.add('is-disabled');
        card.setAttribute('aria-disabled', 'true');
        const input = card.querySelector('input');
        if (input) input.disabled = true;
      }
    });
  }

  function bindStep1() {
    applyPlanCardState();
    $$('.insc-tipo').forEach(card => {
      card.addEventListener('click', (event) => {
        const tipo = TIPOS[card.dataset.tipo];
        if (!tipo || tipo.disabled || tipo.infoOnly || card.classList.contains('is-disabled')) {
          event.preventDefault();
          return;
        }
        $$('.insc-tipo').forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        const input = card.querySelector('input[type="radio"]');
        if (input) input.checked = true;
        state.tipo = card.dataset.tipo;
        $('#insc-continue-1').disabled = false;
      });
    });

    $('#insc-continue-1').addEventListener('click', () => {
      if (!state.tipo) return;
      const tipo = TIPOS[state.tipo];
      $('#insc-form-context').textContent = tipo.label;
      renderParticipantsFields();
      goToStep(2);
    });
  }

  function createField({ id, label, type = 'text', required = true, placeholder = '', key, inputmode = '', autocomplete = 'off', full = false, participantIndex = 1 }) {
    const wrap = document.createElement('div');
    wrap.className = `insc-field ${full ? 'insc-field-full' : ''}`;
    wrap.dataset.participantIndex = String(participantIndex);
    wrap.innerHTML = `
      <label for="${id}">${label}${required ? '' : ' <span style="text-transform:none;letter-spacing:0;color:var(--muted);font-weight:400">(opcional)</span>'}</label>
      <input type="${type}" id="${id}" data-key="${key}" data-participant="${participantIndex}" ${inputmode ? `inputmode="${inputmode}"` : ''} autocomplete="${autocomplete}" placeholder="${placeholder}" ${required ? 'required' : ''}>
      <span class="insc-field-error">Campo obrigatório</span>
    `;
    return wrap;
  }

  function renderParticipantsFields() {
    const tipo = TIPOS[state.tipo];
    const container = $('#participantes-extra');
    if (!container || !tipo) return;
    container.innerHTML = '';

    const title = $('.insc-form-section-title');
    if (title) title.textContent = tipo.people > 1 ? 'Dados do responsável pela compra' : 'Dados do participante';

    if (tipo.people <= 1) return;

    const section = document.createElement('div');
    section.className = 'insc-extra-participants';
    section.innerHTML = `
      <div class="insc-extra-header">
        <span>Participantes adicionais</span>
        <p>Informe os dados das outras ${tipo.people - 1} pessoas inclusas neste combo.</p>
      </div>
    `;

    for (let i = 2; i <= tipo.people; i++) {
      const block = document.createElement('div');
      block.className = 'insc-participant-card';
      block.innerHTML = `<h4>${tipo.key === 'combo5_lote1' ? `Amigo ${i}` : `Participante ${i}`}</h4><div class="insc-grid insc-grid-extra"></div>`;
      const grid = block.querySelector('.insc-grid-extra');
      grid.appendChild(createField({ id: `p${i}-nome`, label: 'Nome completo', key: 'nome', full: true, participantIndex: i, autocomplete: 'name' }));
      grid.appendChild(createField({ id: `p${i}-cpf`, label: 'CPF', key: 'cpf', inputmode: 'numeric', placeholder: '000.000.000-00', participantIndex: i }));
      grid.appendChild(createField({ id: `p${i}-nascimento`, label: 'Data de nascimento', type: 'date', key: 'nascimento', participantIndex: i, autocomplete: 'bday' }));
      grid.appendChild(createField({ id: `p${i}-whatsapp`, label: 'WhatsApp', key: 'whatsapp', inputmode: 'tel', placeholder: '(00) 00000-0000', participantIndex: i, autocomplete: 'tel' }));
      section.appendChild(block);
    }
    container.appendChild(section);

    $$('input[data-key="cpf"]', container).forEach(inp => inp.addEventListener('input', e => { e.target.value = maskCPF(e.target.value); }));
    $$('input[data-key="whatsapp"]', container).forEach(inp => inp.addEventListener('input', e => { e.target.value = maskPhone(e.target.value); }));
    $$('#participantes-extra input').forEach(inp => inp.addEventListener('input', () => clearInputError(inp)));
  }

  function clearInputError(inp) {
    const field = inp.closest('.insc-field');
    if (field) {
      field.classList.remove('has-error');
      inp.classList.remove('is-error');
    }
  }

  function bindStep2() {
    $('#f-cpf').addEventListener('input', e => { e.target.value = maskCPF(e.target.value); });
    $('#f-whatsapp').addEventListener('input', e => { e.target.value = maskPhone(e.target.value); });
    $$('#insc-form input').forEach(inp => inp.addEventListener('input', () => clearInputError(inp)));

    ['f-aceito-termos', 'f-aceito-privacidade'].forEach(id => {
      const cb = $('#' + id);
      if (cb) cb.addEventListener('change', () => {
        const t = $('#f-aceito-termos');
        const p = $('#f-aceito-privacidade');
        if (t && p && t.checked && p.checked) $('.insc-consent')?.classList.remove('has-error');
      });
    });

    $('#insc-back-2').addEventListener('click', () => goToStep(1));
    $('#insc-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      collectFormData();
      renderSummary();
      goToStep(3);
    });
  }

  function setError(field, msg) {
    field.classList.add('has-error');
    const input = field.querySelector('input');
    if (input) input.classList.add('is-error');
    const err = field.querySelector('.insc-field-error');
    if (err && msg) err.textContent = msg;
  }

  function validateInput(inp) {
    const field = inp.closest('.insc-field');
    const v = inp.value.trim();
    const key = inp.dataset.key;
    let ok = true;
    let msg = 'Campo obrigatório';
    if (!v) ok = false;
    else if (key === 'nome' && v.split(/\s+/).length < 2) { ok = false; msg = 'Informe nome e sobrenome'; }
    else if (key === 'cpf' && v.replace(/\D/g, '').length !== 11) { ok = false; msg = 'CPF incompleto'; }
    else if (key === 'email' && !isValidEmail(v)) { ok = false; msg = 'E-mail inválido'; }
    else if (key === 'whatsapp' && v.replace(/\D/g, '').length < 10) { ok = false; msg = 'WhatsApp incompleto'; }
    if (!ok && field) setError(field, msg);
    return ok;
  }

  function validateForm() {
    let ok = true;
    let firstErr = null;
    $$('#insc-form input[required]').forEach(inp => {
      if (inp.type === 'checkbox') return;
      const valid = validateInput(inp);
      if (!valid) {
        ok = false;
        if (!firstErr) firstErr = inp.closest('.insc-field');
      }
    });

    const termos = $('#f-aceito-termos');
    const priv = $('#f-aceito-privacidade');
    if (termos && priv && (!termos.checked || !priv.checked)) {
      $('.insc-consent')?.classList.add('has-error');
      ok = false;
      if (!firstErr) firstErr = $('.insc-consent');
    } else {
      $('.insc-consent')?.classList.remove('has-error');
    }
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return ok;
  }

  function collectFormData() {
    const tipo = TIPOS[state.tipo];
    const responsavel = {
      participante_numero: 1,
      nome: $('#f-nome').value.trim(),
      cpf: $('#f-cpf').value.trim(),
      nascimento: $('#f-nascimento').value.trim(),
      whatsapp: $('#f-whatsapp').value.trim(),
      email: $('#f-email').value.trim().toLowerCase(),
      responsavel: true
    };

    const participantes = [responsavel];
    for (let i = 2; i <= tipo.people; i++) {
      participantes.push({
        participante_numero: i,
        nome: $(`#p${i}-nome`)?.value.trim() || '',
        cpf: $(`#p${i}-cpf`)?.value.trim() || '',
        nascimento: $(`#p${i}-nascimento`)?.value.trim() || '',
        whatsapp: $(`#p${i}-whatsapp`)?.value.trim() || '',
        email: '',
        responsavel: false
      });
    }

    state.participantes = participantes;
    state.data = {
      nome: responsavel.nome,
      cpf: responsavel.cpf,
      nascimento: responsavel.nascimento,
      whatsapp: responsavel.whatsapp,
      email: responsavel.email,
      tipo: tipo.key,
      tipo_label: tipo.label,
      quantidade_participantes: tipo.people,
      valor_base: tipo.price,
      valor_final: tipo.price,
      metodo_pagamento: '',
      status: tipo.free ? 'CONFIRMADO' : 'AGUARDANDO PAGAMENTO',
      participantes,
      aceitou_termos: $('#f-aceito-termos').checked,
      aceitou_privacidade: $('#f-aceito-privacidade').checked,
      consentimento_data: new Date().toISOString()
    };
  }

  function renderPaymentOptions() {
    const tipo = TIPOS[state.tipo];
    const wrap = $('#payment-options');
    if (!wrap) return;
    if (tipo.free) {
      wrap.innerHTML = '';
      return;
    }
    wrap.innerHTML = Object.entries(PAYMENT_METHODS).map(([key, cfg]) => {
      const final = calcFinal(tipo.price, key);
      const installment = cfg.installments > 1 ? `<strong>${cfg.installments}x de ${formatMoney(final / cfg.installments)}</strong>` : `<strong>${formatMoney(final)}</strong>`;
      return `
        <label class="pay-option" data-pay="${key}">
          <input type="radio" name="metodo_pagamento" value="${key}">
          <span class="pay-dot"></span>
          <span class="pay-content">
            <span class="pay-title">${cfg.label}</span>
            <span class="pay-note">${cfg.note}</span>
          </span>
          <span class="pay-value">${installment}</span>
        </label>
      `;
    }).join('');

    $$('.pay-option', wrap).forEach(opt => {
      opt.addEventListener('click', () => {
        $$('.pay-option', wrap).forEach(o => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');
        const input = opt.querySelector('input');
        input.checked = true;
        state.metodoPagamento = input.value;
        state.data.metodo_pagamento = input.value;
        state.data.valor_final = calcFinal(tipo.price, input.value);
        updateTotalForPayment();
      });
    });
  }

  function updateTotalForPayment() {
    const tipo = TIPOS[state.tipo];
    const metodo = state.metodoPagamento;
    const base = tipo.price;
    const final = metodo ? calcFinal(base, metodo) : base;
    $('#sum-total').innerHTML = `<small>R$</small>${final.toFixed(2).replace('.', ',')}`;
    const p = $('#sum-parcela-info');
    if (!metodo) {
      p.textContent = 'Escolha uma forma de pagamento para continuar';
    } else if (metodo.startsWith('credito')) {
      const cfg = PAYMENT_METHODS[metodo];
      p.textContent = cfg.installments > 1 ? `${cfg.installments}x de ${formatMoney(final / cfg.installments)} · taxa de cartão embutida` : 'crédito à vista · taxa de cartão embutida';
    } else {
      p.textContent = `${PAYMENT_METHODS[metodo].label} · valor normal`;
    }
  }

  function renderSummary() {
    const d = state.data;
    const tipo = TIPOS[state.tipo];
    $('#sum-nome').textContent = d.nome;
    $('#sum-tipo').textContent = tipo.label;
    $('#sum-people').textContent = `${tipo.people} ${tipo.people === 1 ? 'participante' : 'participantes'}`;
    $('#sum-whatsapp').textContent = d.whatsapp;
    $('#sum-email').textContent = d.email;
    const loc = $('#sum-cidade');
    if (loc) loc.closest('.insc-summary-row')?.remove();
    $('#sum-total').innerHTML = `<small>R$</small>${Number(tipo.price).toFixed(2).replace('.', ',')}`;

    const list = $('#sum-participantes');
    if (list) {
      list.innerHTML = state.participantes.map(p => `
        <div class="sum-person">
          <span>${String(p.participante_numero).padStart(2, '0')}</span>
          <strong>${p.nome}</strong>
          <small>${p.responsavel ? 'Responsável' : 'Participante'} · ${p.cpf}</small>
        </div>
      `).join('');
    }

    if (tipo.free) {
      $('#sum-parcela-info').textContent = 'Entrada gratuita — não há cobrança';
      $('#insc-pay-label').textContent = 'Concluir inscrição';
      $('.insc-summary-cta-note').textContent = 'Crianças até 10 anos não pagam.';
      $('#payment-section')?.classList.add('is-hidden');
    } else {
      state.metodoPagamento = null;
      $('#insc-pay-label').textContent = 'Ir para pagamento';
      $('.insc-summary-cta-note').textContent = 'Você será redirecionado para o ambiente seguro do Mercado Pago.';
      $('#payment-section')?.classList.remove('is-hidden');
      renderPaymentOptions();
      updateTotalForPayment();
    }
  }

  function bindStep3() {
    $('#insc-back-3').addEventListener('click', () => goToStep(2));
    $('#insc-pay').addEventListener('click', handlePayment);
  }

  async function handlePayment() {
    const btn = $('#insc-pay');
    const tipo = TIPOS[state.tipo];
    const originalLabel = $('#insc-pay-label').textContent;

    if (!tipo.free && !state.metodoPagamento) {
      alert('Escolha a forma de pagamento para continuar.');
      $('#payment-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    btn.disabled = true;
    $('#insc-pay-label').textContent = 'Processando…';

    state.reference = state.reference || genReference();
    state.data.reference = state.reference;
    state.data.codigo_inscricao = state.reference;
    state.data.metodo_pagamento = state.metodoPagamento || 'gratuito';
    state.data.valor_final = tipo.free ? 0 : calcFinal(tipo.price, state.metodoPagamento);

    await registerInSheets({
      type: 'registration_created',
      inscricao: state.data,
      participantes: state.participantes
    });

    if (tipo.free) {
      showConfirmation();
      return;
    }

    try {
      const res = await fetch(MERCADO_PAGO_CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: state.reference,
          codigo_inscricao: state.reference,
          nome: state.data.nome,
          email: state.data.email,
          whatsapp: state.data.whatsapp,
          cpf: state.data.cpf,
          tipo: tipo.key,
          tipo_label: tipo.label,
          quantidade_participantes: tipo.people,
          metodo_pagamento: state.metodoPagamento,
          participantes: state.participantes
        })
      });
      const json = await res.json();
      if (json && json.reference) state.reference = json.reference;
      if (json && json.init_point) {
        window.location.href = json.init_point;
      } else {
        throw new Error(json?.message || 'Backend respondeu sem init_point');
      }
    } catch (err) {
      console.error('[MP] erro:', err);
      btn.disabled = false;
      $('#insc-pay-label').textContent = originalLabel;
      alert('Não foi possível iniciar o pagamento agora. Tente novamente em instantes ou fale com a organização pelo WhatsApp.');
    }
  }

  async function registerInSheets(payload) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('COLE_AQUI')) return { ok: false, stub: true };
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      return { ok: true };
    } catch (err) {
      console.error('[Sheets] falha:', err);
      return { ok: false, error: err };
    }
  }

  function showConfirmation() {
    $('#confirm-code').textContent = state.reference || '—';
    $('#confirm-title-text').innerHTML = 'Inscrição <em>confirmada</em>';
    $('#confirm-msg').innerHTML = `Sua inscrição na House Conf 26 foi registrada.<br>Guarde o código <strong>${state.reference}</strong> para conferência na entrada.`;
    goToStep(4);
  }

  function setupOverlay() {
    const overlay = $('#inscricao-overlay.insc-overlay');
    if (!overlay) return;
    const closeBtn = $('#insc-overlay-close');
    function openOverlay() {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('insc-overlay-open');
      goToStep(1);
    }
    function closeOverlay() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('insc-overlay-open');
      if (window.location.hash === '#inscricao') history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay(); });
    $$('.insc-topbar a[href="index.html"]', overlay).forEach(a => a.addEventListener('click', e => { e.preventDefault(); closeOverlay(); }));
    $$('.insc-confirm a[href="index.html"]', overlay).forEach(a => a.addEventListener('click', e => { e.preventDefault(); closeOverlay(); }));
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href="#inscricao"], a[href$="#inscricao"]');
      if (!link) return;
      e.preventDefault();
      openOverlay();
      if (window.location.hash !== '#inscricao') history.pushState(null, '', '#inscricao');
    });
    if (window.location.hash === '#inscricao') setTimeout(openOverlay, 200);
    window.addEventListener('popstate', () => {
      if (window.location.hash === '#inscricao') { if (!overlay.classList.contains('is-open')) openOverlay(); }
      else if (overlay.classList.contains('is-open')) closeOverlay();
    });
  }

  function init() {
    document.documentElement.classList.add('js-ready');
    const params = new URLSearchParams(window.location.search);
    const preTipo = params.get('tipo');
    if (preTipo && TIPOS[preTipo] && !TIPOS[preTipo].disabled) {
      const card = $(`.insc-tipo[data-tipo="${preTipo}"]`);
      if (card) {
        card.classList.add('is-selected');
        state.tipo = preTipo;
        $('#insc-continue-1').disabled = false;
      }
    }
    bindStep1(); bindStep2(); bindStep3(); setupOverlay();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.HouseConf26 = { PRICES, TIPOS, PAYMENT_METHODS, state, goToStep };
})();
