/* ═══════════════════════════════════════════════════════════════
   HOUSE CONF 26 — Fluxo de Inscrição
   ════════════════════════════════════════════════════════════════
   Arquivo único, sem dependências. Baseado na lógica do cadastro
   oficial enviado, integrado ao visual do site.

   ┌──────────────────────────────────────────────────────────┐
   │  ANTES DE PUBLICAR EM PRODUÇÃO, EDITE 2 LINHAS:          │
   │                                                          │
   │   1) GOOGLE_SCRIPT_URL      → linha ~71  (busque por     │
   │                                "COLE_AQUI_A_URL")        │
   │                                                          │
   │   2) MERCADO_PAGO_CHECKOUT_URL → linha ~92 (busque por   │
   │                                "COLE_AQUI_O_LINK")       │
   │                                                          │
   │  Nenhum outro valor precisa mudar. PRICES, TIPOS,        │
   │  LOTE_ATIVO, etc., já estão prontos.                     │
   └──────────────────────────────────────────────────────────┘
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     ÁREA CENTRALIZADA — valores e endpoints
     ─────────────────────────────────────────────────────────────
     Para trocar de lote no futuro:
       • mude LOTE_ATIVO de 1 para 2
       • o card individual_lote2 vira "ativo" automaticamente
     Para reajustar preços, edite PRICES.
  ───────────────────────────────────────────────────────────── */
  const PRICES = {
    individual_lote1: 80,
    individual_lote2: 100,
    combo5_lote1: 380,
    familia3_lote1: 220,
    crianca_ate10: 0
  };

  const LOTE_ATIVO = 1; // 1 ou 2
  const IDADE_GRATUIDADE = 10;
  const PARCELAS_MAX = 3;

  /* ╔════════════════════════════════════════════════════════╗
     ║ GOOGLE SHEETS via Apps Script                          ║
     ║ Cole o URL /exec do Web App publicado.                 ║
     ║                                                        ║
     ║ Apps Script exemplo (Editor de Script da planilha):    ║
     ║   function doPost(e){                                  ║
     ║     const d = JSON.parse(e.postData.contents);         ║
     ║     const sh = SpreadsheetApp.getActiveSheet();        ║
     ║     sh.appendRow([                                     ║
     ║       new Date(), d.reference, d.nome, d.cpf,          ║
     ║       d.nascimento, d.whatsapp, d.email, d.cidade,     ║
     ║       d.igreja, d.tipo, d.tipo_label, d.valor,         ║
     ║       d.status                                         ║
     ║     ]);                                                ║
     ║     return ContentService                              ║
     ║       .createTextOutput(JSON.stringify({ok:true}))     ║
     ║       .setMimeType(ContentService.MimeType.JSON);      ║
     ║   }                                                    ║
     ║                                                        ║
     ║ Deploy: "Implantar" → "Aplicativo da Web" →            ║
     ║   Executar como: Eu                                    ║
     ║   Quem tem acesso: Qualquer pessoa                     ║
     ╚════════════════════════════════════════════════════════╝ */
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwiNWqVj5g5O91eqjOtZPT1MxXG7Ppik5SLkGa2mpWeQ1bwV7NAJY2Cvfe6edq1bpEs/exec";

  /* ╔════════════════════════════════════════════════════════╗
     ║ MERCADO PAGO — Checkout Pro                            ║
     ║                                                        ║
     ║ Duas opções:                                           ║
     ║  A) Link de pagamento fixo (mais simples)              ║
     ║     Crie no painel do MP e cole aqui.                  ║
     ║                                                        ║
     ║  B) Endpoint do seu backend (mais flexível)            ║
     ║     O backend cria a preferência via SDK do MP e       ║
     ║     devolve { init_point: "https://..." }.             ║
     ║                                                        ║
     ║ ⚠ NUNCA coloque o ACCESS_TOKEN no frontend.            ║
     ║   Ele vive APENAS no backend.                          ║
     ╚════════════════════════════════════════════════════════╝ */
  const MERCADO_PAGO_CHECKOUT_URL = "https://houseconf26-backend.onrender.com/create-payment";

  /* ─────────────────────────────────────────────────────────────
     TIPOS DE INSCRIÇÃO
  ───────────────────────────────────────────────────────────── */
  const TIPOS = {
    individual_lote1: {
      key: 'individual_lote1',
      label: 'Individual — 1º Lote',
      shortLabel: 'Individual',
      people: 1,
      price: PRICES.individual_lote1,
      disabled: LOTE_ATIVO !== 1
    },
    individual_lote2: {
      key: 'individual_lote2',
      label: 'Individual — 2º Lote',
      shortLabel: 'Individual',
      people: 1,
      price: PRICES.individual_lote2,
      disabled: LOTE_ATIVO !== 2
    },
    familia3_lote1: {
      key: 'familia3_lote1',
      label: 'Combo Família · 3 pessoas',
      shortLabel: 'Combo Família',
      people: 3,
      price: PRICES.familia3_lote1,
      disabled: LOTE_ATIVO !== 1
    },
    combo5_lote1: {
      key: 'combo5_lote1',
      label: 'Combo 5 Amigos',
      shortLabel: 'Combo 5 Amigos',
      people: 5,
      price: PRICES.combo5_lote1,
      disabled: LOTE_ATIVO !== 1
    },
    crianca_ate10: {
      key: 'crianca_ate10',
      label: 'Criança até 10 anos · Gratuito',
      shortLabel: 'Criança · Gratuito',
      people: 1,
      price: PRICES.crianca_ate10,
      free: true,
      disabled: false
    }
  };

  /* ─────────────────────────────────────────────────────────────
     ESTADO
  ───────────────────────────────────────────────────────────── */
  const state = {
    step: 1,
    tipo: null,
    data: {},
    reference: ''
  };

  /* ─────────────────────────────────────────────────────────────
     UTILITÁRIOS
  ───────────────────────────────────────────────────────────── */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function maskCPF(v) {
    return v.replace(/\D/g, '').slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1-$2');
  }
  function maskPhone(v) {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
  }
  function genReference() {
    const y = new Date().getFullYear();
    const r = Math.floor(Math.random() * 9000 + 1000);
    return `HC26-${y}-${r}`;
  }

  /* ─────────────────────────────────────────────────────────────
     NAVEGAÇÃO
  ───────────────────────────────────────────────────────────── */
  function goToStep(n) {
    state.step = n;
    $$('.insc-stage').forEach(el => el.classList.remove('active'));
    const stage = $('.insc-stage[data-stage="' + n + '"]');
    if (stage) stage.classList.add('active');
    $$('.insc-step').forEach(el => {
      const num = parseInt(el.dataset.step, 10);
      el.classList.toggle('active', num === n);
      el.classList.toggle('done', num < n);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ─────────────────────────────────────────────────────────────
     ETAPA 1 — Seleção de Plano
  ───────────────────────────────────────────────────────────── */
  function bindStep1() {
    $$('.insc-tipo').forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('is-disabled')) return;
        $$('.insc-tipo').forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        state.tipo = card.dataset.tipo;
        $('#insc-continue-1').disabled = false;
      });
    });

    $('#insc-continue-1').addEventListener('click', () => {
      if (!state.tipo) return;
      const tipo = TIPOS[state.tipo];
      $('#insc-form-context').textContent = tipo.label;
      $('#insc-free-note').style.display = tipo.free ? 'block' : 'none';
      goToStep(2);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     ETAPA 2 — Formulário
  ───────────────────────────────────────────────────────────── */
  function bindStep2() {
    $('#f-cpf').addEventListener('input', e => { e.target.value = maskCPF(e.target.value); });
    $('#f-whatsapp').addEventListener('input', e => { e.target.value = maskPhone(e.target.value); });

    $$('#insc-form input').forEach(inp => {
      inp.addEventListener('input', () => {
        const field = inp.closest('.insc-field');
        if (field) {
          field.classList.remove('has-error');
          inp.classList.remove('is-error');
        }
      });
    });

    // limpar erro de consentimento ao marcar qualquer um dos checkboxes
    ['f-aceito-termos', 'f-aceito-privacidade'].forEach(id => {
      const cb = $('#' + id);
      if (cb) cb.addEventListener('change', () => {
        const t = $('#f-aceito-termos');
        const p = $('#f-aceito-privacidade');
        if (t && p && t.checked && p.checked) {
          const c = $('.insc-consent');
          if (c) c.classList.remove('has-error');
        }
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
    field.querySelector('input').classList.add('is-error');
    const errEl = field.querySelector('.insc-field-error');
    if (errEl && msg) errEl.textContent = msg;
  }

  function validateForm() {
    let allOk = true;
    let firstErr = null;

    $$('#insc-form input[required]').forEach(inp => {
      // checkboxes têm validação separada abaixo
      if (inp.type === 'checkbox') return;

      const field = inp.closest('.insc-field');
      const v = inp.value.trim();
      const key = inp.dataset.key;
      let ok = true, msg = '';

      if (!v) { ok = false; msg = 'Campo obrigatório'; }
      else if (key === 'nome' && v.split(/\s+/).length < 2) {
        ok = false; msg = 'Informe nome e sobrenome';
      }
      else if (key === 'cpf' && v.replace(/\D/g, '').length !== 11) {
        ok = false; msg = 'CPF incompleto';
      }
      else if (key === 'email' && !isValidEmail(v)) {
        ok = false; msg = 'E-mail inválido';
      }
      else if (key === 'whatsapp' && v.replace(/\D/g, '').length < 10) {
        ok = false; msg = 'WhatsApp incompleto';
      }

      if (!ok) {
        setError(field, msg);
        allOk = false;
        if (!firstErr) firstErr = field;
      }
    });

    // Validação de consentimento (Termos + Privacidade)
    const consent = $('.insc-consent');
    const termos = $('#f-aceito-termos');
    const privacidade = $('#f-aceito-privacidade');
    if (consent && termos && privacidade) {
      if (!termos.checked || !privacidade.checked) {
        consent.classList.add('has-error');
        allOk = false;
        if (!firstErr) firstErr = consent;
      } else {
        consent.classList.remove('has-error');
      }
    }

    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return allOk;
  }

  function collectFormData() {
    const tipo = TIPOS[state.tipo];
    state.data = {
      nome:       $('#f-nome').value.trim(),
      cpf:        $('#f-cpf').value.trim(),
      nascimento: $('#f-nascimento').value.trim(),
      whatsapp:   $('#f-whatsapp').value.trim(),
      email:      $('#f-email').value.trim().toLowerCase(),
      cidade:     $('#f-cidade').value.trim(),
      igreja:     $('#f-igreja').value.trim(),
      tipo:       tipo.key,
      tipo_label: tipo.label,
      valor:      tipo.price,
      status:     tipo.free ? 'CONFIRMADO' : 'AGUARDANDO PAGAMENTO',
      // consentimentos LGPD — registrados com timestamp para auditoria
      aceitou_termos:        $('#f-aceito-termos').checked,
      aceitou_privacidade:   $('#f-aceito-privacidade').checked,
      consentimento_data:    new Date().toISOString()
    };
  }

  /* ─────────────────────────────────────────────────────────────
     ETAPA 3 — Resumo
  ───────────────────────────────────────────────────────────── */
  function renderSummary() {
    const d = state.data;
    const tipo = TIPOS[state.tipo];
    const parcela = (tipo.price / PARCELAS_MAX).toFixed(2).replace('.', ',');

    $('#sum-nome').textContent = d.nome;
    $('#sum-tipo').textContent = tipo.label;
    $('#sum-people').textContent = tipo.people + (tipo.people === 1 ? ' participante' : ' participantes');
    $('#sum-whatsapp').textContent = d.whatsapp;
    $('#sum-email').textContent = d.email;
    $('#sum-cidade').textContent = d.cidade + (d.igreja ? ' · ' + d.igreja : '');

    $('#sum-total').innerHTML = '<small>R$</small>' + Number(tipo.price).toFixed(2).replace('.', ',');

    const parcelaInfo = $('#sum-parcela-info');
    if (tipo.free) {
      parcelaInfo.textContent = 'Entrada gratuita — não há cobrança';
      $('#insc-pay-label').textContent = 'Concluir inscrição';
      $('.insc-summary-cta-note').textContent = 'Crianças até 10 anos não pagam. A confirmação será enviada para o WhatsApp e e-mail cadastrados.';
      $('#insc-payment-info').style.display = 'none';
    } else {
      parcelaInfo.textContent = 'ou ' + PARCELAS_MAX + 'x de R$ ' + parcela + ' no cartão';
      $('#insc-pay-label').textContent = 'Ir para pagamento';
      $('.insc-summary-cta-note').textContent = 'Você será redirecionado para o ambiente seguro do Mercado Pago.';
      $('#insc-payment-info').style.display = '';
    }
  }

  function bindStep3() {
    $('#insc-back-3').addEventListener('click', () => goToStep(2));
    $('#insc-pay').addEventListener('click', handlePayment);
  }

  /* ─────────────────────────────────────────────────────────────
     ENVIO — Sheets + Mercado Pago
  ───────────────────────────────────────────────────────────── */
  
function normalizarTipoParaPagamento(tipo) {
  const raw = String(tipo || "").toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\-]/g, " ")
    .trim();

  if (raw.includes("combo") && (raw.includes("famil") || raw.includes("3") || raw.includes("tres"))) {
    return "familia3";
  }

  if (raw.includes("combo") && raw.includes("5")) {
    return "combo5";
  }

  if (raw.includes("individual") && (raw.includes("2") || raw.includes("lote2") || raw.includes("segundo"))) {
    return "individual_lote2";
  }

  return "individual_lote1";
}

async function handlePayment() {
    const btn = $('#insc-pay');
    const tipo = TIPOS[state.tipo];
    const originalLabel = $('#insc-pay-label').textContent;

    btn.disabled = true;
    $('#insc-pay-label').textContent = 'Processando…';

    state.reference = genReference();
    state.data.reference = state.reference;

    await registerInSheets(state.data);

    if (tipo.free) {
      showConfirmation();
      return;
    }

    if (!MERCADO_PAGO_CHECKOUT_URL || MERCADO_PAGO_CHECKOUT_URL.includes('COLE_AQUI')) {
      setTimeout(showConfirmation, 800);
      return;
    }

    // Caso A: URL fixa do MP
    if (/^https?:\/\//.test(MERCADO_PAGO_CHECKOUT_URL) &&
        (MERCADO_PAGO_CHECKOUT_URL.includes('mercadopago.com') ||
         MERCADO_PAGO_CHECKOUT_URL.includes('mpago.la'))) {
      window.location.href = MERCADO_PAGO_CHECKOUT_URL;
      return;
    }

    // Caso B: endpoint backend
    try {
      const res = await fetch(MERCADO_PAGO_CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: state.reference,
          tipo: tipo.key,
          tipo_label: tipo.label,
          valor: tipo.price,
          parcelas_max: PARCELAS_MAX,
          participante: state.data
        })
      });
      const json = await res.json();
      if (json && json.init_point) {
        window.location.href = json.init_point;
      } else {
        throw new Error('Backend respondeu sem init_point');
      }
    } catch (err) {
      console.error('[MP] erro:', err);
      btn.disabled = false;
      $('#insc-pay-label').textContent = originalLabel;
      alert('Não foi possível iniciar o pagamento agora. Tente novamente em instantes ou fale com a organização pelo WhatsApp.');
    }
  }

  async function registerInSheets(payload) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('COLE_AQUI')) {
      console.info('[Sheets] STUB — endpoint não configurado. Payload:', payload);
      return { ok: false, stub: true };
    }
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

  /* ─────────────────────────────────────────────────────────────
     ETAPA 4 — Confirmação
  ───────────────────────────────────────────────────────────── */
  function showConfirmation() {
    $('#confirm-code').textContent = state.reference || '—';
    const tipo = TIPOS[state.tipo];
    if (tipo && tipo.free) {
      $('#confirm-title-text').innerHTML = 'Inscrição <em>confirmada</em>';
      $('#confirm-msg').innerHTML =
        'Crianças até 10 anos têm entrada gratuita.<br>' +
        'A confirmação foi registrada e será enviada para o WhatsApp e e-mail cadastrados.';
    } else {
      $('#confirm-title-text').innerHTML = 'Inscrição <em>registrada</em>';
      $('#confirm-msg').innerHTML =
        'Sua inscrição na House Conf 26 foi registrada com sucesso.<br>' +
        'Após a aprovação do pagamento, a confirmação será enviada para o WhatsApp e e-mail cadastrados.';
    }
    goToStep(4);
  }

  /* ─────────────────────────────────────────────────────────────
     OVERLAY MODE — quando o fluxo está embutido no index.html
     como <aside class="insc-overlay" id="inscricao">, gerencia
     abertura/fechamento via hash, botão X e tecla Esc.
     Se não houver overlay (página standalone inscricao.html),
     essa parte simplesmente não faz nada — o conteúdo já está
     visível diretamente.
  ───────────────────────────────────────────────────────────── */
  function setupOverlay() {
    const overlay = $('#inscricao-overlay.insc-overlay');
    if (!overlay) return; // modo standalone

    const closeBtn = $('#insc-overlay-close');

    function openOverlay() {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('insc-overlay-open');
      // Reset para etapa 1 sempre que abrir
      goToStep(1);
    }
    function closeOverlay() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('insc-overlay-open');
      // Limpa hash sem rolar a página
      if (window.location.hash === '#inscricao') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }

    // Botão X
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);

    // Tecla Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
    });

    // Links da topbar interna (logo + "Voltar ao site") fecham o overlay
    // em vez de navegar para index.html (já estamos lá).
    $$('.insc-topbar a[href="index.html"]', overlay).forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        closeOverlay();
      });
    });
    // Botão "Voltar ao início" da etapa 4 também — mesmo motivo.
    $$('.insc-confirm a[href="index.html"]', overlay).forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        closeOverlay();
      });
    });

    // Intercepta CTAs que apontam para #inscricao
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href="#inscricao"], a[href$="#inscricao"]');
      if (!link) return;
      e.preventDefault();
      openOverlay();
      // Atualiza hash sem rolar
      if (window.location.hash !== '#inscricao') {
        history.pushState(null, '', '#inscricao');
      }
    });

    // Se a URL já vier com #inscricao (ex: link compartilhado), abre
    if (window.location.hash === '#inscricao') {
      // Pequeno delay pra deixar reveals e fontes assentarem
      setTimeout(openOverlay, 200);
    }

    // Suporte ao botão "voltar" do navegador
    window.addEventListener('popstate', () => {
      if (window.location.hash === '#inscricao') {
        if (!overlay.classList.contains('is-open')) openOverlay();
      } else {
        if (overlay.classList.contains('is-open')) closeOverlay();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     ENTRY POINT
  ───────────────────────────────────────────────────────────── */
  function init() {
    document.documentElement.classList.add('js-ready');

    const params = new URLSearchParams(window.location.search);

    const preTipo = params.get('tipo');
    if (preTipo && TIPOS[preTipo] && !TIPOS[preTipo].disabled) {
      const card = $('.insc-tipo[data-tipo="' + preTipo + '"]');
      if (card) {
        card.classList.add('is-selected');
        state.tipo = preTipo;
        $('#insc-continue-1').disabled = false;
      }
    }

    const mpStatus = params.get('status');
    if (mpStatus === 'success') {
      state.reference = params.get('ref') || '—';
      bindStep1(); bindStep2(); bindStep3();
      setupOverlay();
      showConfirmation();
      return;
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

  window.HouseConf26 = { PRICES, TIPOS, LOTE_ATIVO, IDADE_GRATUIDADE, PARCELAS_MAX, state, goToStep };
})();
