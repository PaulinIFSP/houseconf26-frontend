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

  const BACKEND_URL = 'https://houseconf26-backend.onrender.com';
  const MERCADO_PAGO_CHECKOUT_URL = `${BACKEND_URL}/create-payment`;

  const PAYMENT_METHODS = {
    pix: { label: 'Pix', note: 'Valor normal', factor: 1, installments: 1 },
    credito1x: { label: 'Crédito 1x', note: 'Taxa embutida', factor: 1 / (1 - 0.0498), installments: 1 },
    credito2x: { label: 'Crédito 2x', note: 'Taxa embutida', factor: 1 / (1 - 0.0498), installments: 2 },
    credito3x: { label: 'Crédito 3x', note: 'Taxa embutida', factor: 1 / (1 - 0.0498), installments: 3 }
  };

  const TIPOS = {
    individual_lote1: { key: 'individual_lote1', label: 'Individual — 1º Lote', people: 1, price: 80 },
    familia3_lote1: { key: 'familia3_lote1', label: 'Combo Família · 3 pessoas', people: 3, price: 220 },
    combo5_lote1: { key: 'combo5_lote1', label: 'Combo 5 Amigos', people: 5, price: 380 },
    crianca_ate10: { key: 'crianca_ate10', label: 'Criança até 10 anos · Gratuito', people: 1, price: 0, disabled: true, infoOnly: true }
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

  function removeDuplicatedDOM() {
    const ids = new Set();

    $$('[id]').forEach(el => {
      if (ids.has(el.id)) el.remove();
      else ids.add(el.id);
    });

    const seenStages = new Set();

    $$('.insc-stage').forEach(stage => {
      const key = stage.dataset.stage || stage.className;
      if (seenStages.has(key)) stage.remove();
      else seenStages.add(key);
    });

    const steps = $$('.insc-steps');
    steps.forEach((el, index) => {
      if (index > 0) el.remove();
    });
  }

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
    const m = String(v || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return false;

    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    const now = new Date().getFullYear();

    if (y < 1900 || y > now) return false;

    const date = new Date(y, mo - 1, d);
    return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
  }

  function genReference() {
    return `HC26-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  function goToStep(n) {
    state.step = n;

    $$('.insc-stage').forEach(el => el.classList.remove('active'));
    const stage = $(`.insc-stage[data-stage="${n}"]`);
    if (stage) stage.classList.add('active');

    $$('.insc-step').forEach(el => {
      const num = Number(el.dataset.step);
      el.classList.toggle('active', num === n);
      el.classList.toggle('done', num < n);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindStep1() {
    const btn = $('#insc-continue-1');

    $$('.insc-tipo').forEach(card => {
      const tipoKey = card.dataset.tipo;
      const tipo = TIPOS[tipoKey];

      if (!tipo) return;

      if (tipo.disabled || tipo.infoOnly) {
        card.classList.add('is-disabled');
        card.setAttribute('aria-disabled', 'true');
        return;
      }

      card.style.cursor = 'pointer';

      card.onclick = function () {
        $$('.insc-tipo').forEach(c => {
          c.classList.remove('is-selected');
          const check = c.querySelector('.tipo-check');
          if (check) check.remove();
        });

        card.classList.add('is-selected');

        const check = document.createElement('span');
        check.className = 'tipo-check';
        check.textContent = '✓';
        card.appendChild(check);

        const input = card.querySelector('input[type="radio"]');
        if (input) input.checked = true;

        state.tipo = tipoKey;

        if (btn) {
          btn.disabled = false;
          btn.removeAttribute('disabled');
          btn.classList.add('is-ready');
        }
      };
    });

    if (btn) {
      btn.onclick = function () {
        if (!state.tipo) {
          alert('Selecione um tipo de inscrição para continuar.');
          return;
        }

        const contexto = $('#insc-form-context');
        if (contexto) contexto.textContent = TIPOS[state.tipo].label;

        renderParticipantsFields();
        goToStep(2);
      };
    }
  }

  function createField({ id, label, key, full = false, placeholder = '', inputmode = '', autocomplete = 'off' }) {
    const wrap = document.createElement('div');
    wrap.className = `insc-field ${full ? 'insc-field-full' : ''}`;

    wrap.innerHTML = `
      <label for="${id}">${label}</label>
      <input type="text" id="${id}" data-key="${key}" ${inputmode ? `inputmode="${inputmode}"` : ''} autocomplete="${autocomplete}" placeholder="${placeholder}" required>
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
        autocomplete: 'name'
      }));

      grid.appendChild(createField({
        id: `p${i}-cpf`,
        label: 'CPF',
        key: 'cpf',
        inputmode: 'numeric',
        placeholder: '000.000.000-00'
      }));

      section.appendChild(block);
    }

    container.appendChild(section);

    $$('input[data-key="cpf"]', container).forEach(inp => {
      inp.addEventListener('input', e => e.target.value = maskCPF(e.target.value));
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
    const cpf = $('#f-cpf');
    const whats = $('#f-whatsapp');
    const nasc = $('#f-nascimento');
    const back = $('#insc-back-2');
    const form = $('#insc-form');

    if (cpf) cpf.addEventListener('input', e => e.target.value = maskCPF(e.target.value));
    if (whats) whats.addEventListener('input', e => e.target.value = maskPhone(e.target.value));
    if (nasc) nasc.addEventListener('input', e => e.target.value = maskDate(e.target.value));

    $$('#insc-form input').forEach(inp => {
      inp.addEventListener('input', () => clearInputError(inp));
    });

    if (back) back.onclick = () => goToStep(1);

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        if (!validateForm()) return;

        collectFormData();
        renderSummary();
        goToStep(3);
      };
    }
  }

  function setError(field, msg) {
    field.classList.add('has-error');
    const err = field.querySelector('.insc-field-error');
    if (err) err.textContent = msg;
  }

  function validateInput(inp) {
    const field = inp.closest('.insc-field');
    const v = inp.value.trim();
    const key = inp.dataset.key;

    let ok = true;
    let msg = 'Campo obrigatório';

    if (!v) ok = false;
    else if (key === 'nome' && v.split(/\s+/).length < 2) {
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

      if (!validateInput(inp)) {
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
        responsavel: false
      });
    }

    state.participantes = participantes;

    state.data = {
      ...responsavel,
      tipo: tipo.key,
      tipo_label: tipo.label,
      quantidade_participantes: tipo.people,
      valor_base: tipo.price,
      valor_final: tipo.price,
      participantes
    };
  }

  function renderPaymentOptions() {
    const tipo = TIPOS[state.tipo];
    const wrap = $('#payment-options');
    if (!wrap) return;

    wrap.innerHTML = Object.entries(PAYMENT_METHODS).map(([key, cfg]) => {
      const final = calcFinal(tipo.price, key);
      const valor = cfg.installments > 1
        ? `${cfg.installments}x de ${formatMoney(final / cfg.installments)}`
        : formatMoney(final);

      return `
        <label class="pay-option" data-pay="${key}">
          <input type="radio" name="metodo_pagamento" value="${key}">
          <span class="pay-dot"></span>
          <span class="pay-content">
            <span class="pay-title">${cfg.label}</span>
            <span class="pay-note">${cfg.note}</span>
          </span>
          <span class="pay-value"><strong>${valor}</strong></span>
        </label>
      `;
    }).join('');

    $$('.pay-option', wrap).forEach(opt => {
      opt.onclick = function () {
        $$('.pay-option').forEach(o => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');

        const input = opt.querySelector('input');
        input.checked = true;

        state.metodoPagamento = input.value;
        state.data.metodo_pagamento = input.value;
        state.data.valor_final = calcFinal(tipo.price, input.value);

        updateTotalForPayment();
      };
    });
  }

  function updateTotalForPayment() {
    const tipo = TIPOS[state.tipo];
    const final = state.metodoPagamento ? calcFinal(tipo.price, state.metodoPagamento) : tipo.price;

    const total = $('#sum-total');
    if (total) total.innerHTML = `<small>R$</small>${final.toFixed(2).replace('.', ',')}`;

    const info = $('#sum-parcela-info');
    if (info) {
      if (!state.metodoPagamento) info.textContent = 'Escolha uma forma de pagamento para continuar';
      else info.textContent = `${PAYMENT_METHODS[state.metodoPagamento].label} selecionado`;
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

    const oldPix = $('#pix-payment-box');
    if (oldPix) oldPix.remove();

    renderPaymentOptions();
    updateTotalForPayment();
  }

  function bindStep3() {
    const back = $('#insc-back-3');
    const pay = $('#insc-pay');

    if (back) back.onclick = () => goToStep(2);
    if (pay) pay.onclick = handlePayment;
  }

  function showPixPayment(json) {
    const old = $('#pix-payment-box');
    if (old) old.remove();

    const box = document.createElement('div');
    box.id = 'pix-payment-box';
    box.style.cssText = `
      margin: 2rem auto 0;
      padding: 1.5rem;
      max-width: 620px;
      border: 1px solid rgba(232, 106, 42, 0.45);
      border-radius: 22px;
      background: rgba(40, 12, 6, 0.72);
      color: var(--cream, #fff4e6);
      text-align: center;
    `;

    const img = json.qr_code_base64
      ? `<img src="data:image/png;base64,${json.qr_code_base64}" alt="QR Code Pix" style="width:220px;max-width:100%;background:#fff;padding:12px;border-radius:16px;margin:1rem auto;display:block">`
      : '';

    box.innerHTML = `
      <h3 style="font-size:1.6rem;margin:0 0 .5rem">Pagamento via Pix</h3>
      <p style="opacity:.85;margin:0 0 1rem">Escaneie o QR Code ou copie o código Pix abaixo para finalizar sua inscrição. Após o pagamento, a confirmação pode levar alguns instantes.</p>
      ${img}
      <textarea readonly id="pix-copy-code" style="width:100%;min-height:110px;border-radius:14px;padding:1rem;background:#120806;color:#fff;border:1px solid rgba(255,255,255,.18);font-size:.85rem">${json.qr_code || ''}</textarea>
      <button type="button" id="copy-pix-btn" style="margin-top:1rem;width:100%;padding:1rem;border:0;border-radius:999px;background:linear-gradient(135deg,#ffd0a1,#ff7a2f);font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#160704">Copiar código Pix</button>
      ${json.ticket_url ? `<a href="${json.ticket_url}" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:1rem;color:#ffd0a1;text-decoration:underline">Abrir pagamento Pix</a>` : ''}
      <p style="font-size:.9rem;opacity:.75;margin-top:1rem">Depois de pagar, aguarde a atualização automática do status. Código da inscrição: <strong>${json.codigo_inscricao || json.reference || state.reference}</strong></p>
    `;

    const cta = $('.insc-summary-cta') || $('#insc-pay')?.parentElement || $('.insc-summary');
    cta.insertAdjacentElement('afterend', box);

    const btn = $('#copy-pix-btn');
    if (btn) {
      btn.onclick = async function () {
        const code = $('#pix-copy-code')?.value || json.qr_code || '';

        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = 'Código Pix copiado';
        } catch {
          const area = $('#pix-copy-code');
          if (area) {
            area.focus();
            area.select();
          }
          alert('Selecione e copie o código Pix manualmente.');
        }
      };
    }

    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function handlePayment() {
    const tipo = TIPOS[state.tipo];

    if (!state.metodoPagamento) {
      alert('Escolha a forma de pagamento para continuar.');
      return;
    }

    const btn = $('#insc-pay');
    const label = $('#insc-pay-label');

    btn.disabled = true;
    if (label) label.textContent = 'Processando…';

    state.reference = state.reference || genReference();

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

      if (json.reference) state.reference = json.reference;

      if (json.payment_type === 'pix' && (json.qr_code || json.qr_code_base64 || json.ticket_url)) {
        showPixPayment(json);
        btn.disabled = false;
        if (label) label.textContent = 'Gerar Pix novamente';
        return;
      }

      if (json.init_point) {
        window.location.href = json.init_point;
        return;
      }

      throw new Error(json.message || 'Sem link de pagamento');
    } catch (err) {
      console.error(err);
      alert('Não foi possível iniciar o pagamento. Tente novamente.');
      btn.disabled = false;
      if (label) label.textContent = 'Ir para pagamento';
    }
  }

  function init() {
    removeDuplicatedDOM();

    bindStep1();
    bindStep2();
    bindStep3();

    goToStep(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HouseConf26 = { state, TIPOS, PAYMENT_METHODS, goToStep };
})();
