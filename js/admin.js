const BACKEND_URL = 'https://houseconf26-backend.onrender.com';
let token = new URLSearchParams(location.search).get('token') || localStorage.getItem('hc26_admin_token') || '';
let dataCache = null;
let chartTipo = null;
let chartStatus = null;
const $ = (s) => document.querySelector(s);
const money = (v) => Number(v || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

function showDash() { $('#login').classList.add('hidden'); $('#dashboard').classList.remove('hidden'); }
function showLogin() { $('#login').classList.remove('hidden'); $('#dashboard').classList.add('hidden'); }

async function load() {
  if (!token) return showLogin();
  try {
    const res = await fetch(`${BACKEND_URL}/admin/stats?token=${encodeURIComponent(token)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Acesso negado');
    localStorage.setItem('hc26_admin_token', token);
    dataCache = json;
    render(json);
    showDash();
  } catch (e) {
    alert('Não foi possível acessar o painel. Confira o ADMIN_TOKEN.');
    showLogin();
  }
}

function render(json) {
  const s = json.summary;
  $('#k-total').textContent = s.total;
  $('#k-aprovadas').textContent = s.aprovados;
  $('#k-pendentes').textContent = s.pendentes;
  $('#k-participantes').textContent = s.participantes;
  $('#k-receita').textContent = money(s.receitaBruta);
  renderChart('chartTipo', chartTipo, json.porTipo, (c) => chartTipo = c);
  renderChart('chartStatus', chartStatus, json.porStatus, (c) => chartStatus = c);
  renderRows(json.items || []);
}

function renderChart(id, current, obj, set) {
  if (current) current.destroy();
  const labels = Object.keys(obj || {});
  const values = Object.values(obj || {});
  set(new Chart(document.getElementById(id), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values }] },
    options: { plugins: { legend: { labels: { color: '#fff0dc' } } } }
  }));
}

function renderRows(items) {
  const q = ($('#search').value || '').toLowerCase();
  const rows = items.filter(i => JSON.stringify(i).toLowerCase().includes(q)).map(i => `
    <tr>
      <td><strong>${i.codigo_inscricao || '-'}</strong></td>
      <td><span class="status ${i.status_pagamento === 'aprovado' ? 'aprovado' : 'pendente'}">${i.status_pagamento || '-'}</span></td>
      <td>${i.nome || '-'}</td>
      <td>${i.tipo_label || i.tipo || '-'}</td>
      <td>${i.quantidade_participantes || 1}</td>
      <td>${i.metodo_pagamento || '-'}</td>
      <td>${money(i.valor_final)}</td>
      <td>${i.created_at ? new Date(i.created_at).toLocaleString('pt-BR') : '-'}</td>
    </tr>
  `).join('');
  $('#rows').innerHTML = rows || '<tr><td colspan="8">Nenhum registro carregado neste ciclo do servidor.</td></tr>';
}

$('#enter').addEventListener('click', () => { token = $('#token').value.trim(); load(); });
$('#refresh').addEventListener('click', load);
$('#search').addEventListener('input', () => dataCache && renderRows(dataCache.items || []));
if (token) $('#token').value = token;
load();
