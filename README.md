# House Conf 26 — Landing Page

Refinamento da base aprovada pelo designer, agora utilizando os assets oficiais
da identidade visual (logo, fontes, degradê, fotos de palestrantes e pastores).

---

## Estrutura

```
house-conf-26/
├── index.html              Estrutura semântica completa
├── css/
│   └── styles.css          Sistema de design (tokens, tipografia, layout, motion)
├── js/
│   └── main.js             Partículas, scroll-reveal, FAQ, countdown, menu mobile
└── assets/
    ├── fonts/
    │   ├── ThirstyScriptExtraBoldDemo.otf    (decorativa - primeira letra)
    │   └── NeueHaasDisplayBold.ttf           (display editorial)
    ├── logo/
    │   └── logo-houseconf-26.png             (logo oficial branca)
    ├── gradient/
    │   └── degrade.png                       (degradê oficial bordô → âmbar)
    ├── speakers/                             (6 imagens otimizadas, 3:4)
    │   ├── danilo-pilar.jpg
    │   ├── eliseu-nogueira.jpg
    │   ├── house-music-grupo.webp            (House Music — grupo completo)
    │   ├── ludi.jpg
    │   ├── talita-zancaro.jpg
    │   └── yona-amorim.jpg
    └── pastors/                              (2 fotos 4:5 para "Quem nós somos")
        ├── pastor-reginaldo.jpg
        └── pastora-janete.jpg
```

---

## Design tokens principais

Paleta extraída do degradê oficial:

| Token         | Valor      | Uso                                   |
|---------------|------------|---------------------------------------|
| `--bordo-deep`| `#3A0703`  | base profunda do degradê              |
| `--ember`     | `#B83518`  | vermelho-tijolo queimado              |
| `--orange`    | `#E86A2A`  | laranja-Sevilha (acento principal)    |
| `--amber`     | `#E8B47A`  | âmbar (section labels, destaques)     |
| `--cream`     | `#F4D9B5`  | claro do degradê (títulos, CTAs)      |
| `--black`     | `#0A0604`  | base cinematográfica do site          |

Tipografia:

| Família             | Uso                                          |
|---------------------|----------------------------------------------|
| Thirsty Script      | primeira letra de cada título (regra do logo)|
| Neue Haas Display   | resto dos títulos editoriais                 |
| Fraunces            | itálicos/serifa contemporânea                |
| Inter               | corpo de texto e UI                          |

---

## Como abrir localmente

Basta abrir `index.html` em qualquer navegador moderno. Não há build step.

Para servir localmente com hot-reload (recomendado para evitar problemas com
fonts/CORS em alguns navegadores):

```bash
# Python 3
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Depois acesse `http://localhost:8000`.

---

## Alterações principais vs. versão original

- **Paleta** trocada de dourado/preto genérico para a paleta oficial quente
  (bordô → laranja → âmbar) extraída do degradê do designer.
- **Tipografia oficial** instalada via `@font-face` (Thirsty Script + Neue Haas).
- **Regra do logo aplicada** em todos os títulos de seção: primeira letra em
  Thirsty Script (âmbar gradiente), resto em Neue Haas Display Bold.
- **Logo PNG oficial** usada no header, hero e footer (substituindo o texto
  "House Conf" anterior).
- **Pr. Jetro removido**, substituído por **Pr. Eliseu Nogueira** no line-up
  e no cronograma do dia 12.
- **Fotos reais** aplicadas em todos os palestrantes (substituindo
  placeholders) e no card dos pastores na seção "Quem nós somos".
- **Degradê oficial** usado como camada cinematográfica em hero, transições,
  glow do line-up e CTA final (não simulado em CSS plano).
- **Grid do line-up** reorganizado para 4 colunas: Danilo e Eliseu como
  destaques `big` (preletores), seguidos pelos 4 ministros de adoração.
- **Tratamento duotone sutil** nas miniaturas do line-up (contraste + sépia)
  com reveal em cor real no hover.
- **Estrutura separada** em HTML / CSS / JS, com pasta `assets/` organizada
  por categoria.

---

## Notas para próximos ajustes

- **Mapa do local**: o `iframe` do Google Maps ainda usa coordenadas placeholder.
  Substituir pelo embed real após confirmação do endereço.
- **Links de inscrição**: todos apontam para `#inscricao` (a seção do CTA final).
  Trocar pelo link real do checkout quando definido.
- **Redes sociais**: links no footer estão como `#`. Substituir pelos URLs reais.
- **CNPJ no footer**: atualmente como placeholder.

---

## Changelog — Refinamento V2 (21/maio/2026)

Ajustes solicitados sobre a base anterior, sem recriar o site nem alterar a identidade visual principal:

1. **House Music** — substituição da foto do Samuel (solo) pela foto oficial do grupo completo (`assets/speakers/house-music-grupo.webp`, 900×1200, ~98KB). Mesmo card, mesmo layout, mesmo padrão visual do line-up.
2. **Letras ornamentais** — refinamento de kerning óptico para integração natural ("Quem", "Sobre", "Line", "Local", "Perguntas" e nomes do line-up se leem como uma palavra contínua, sem cortar swashes nem sobrepor o texto seguinte). Ajuste no `margin-right` da `.ornamental-letter` (de `-0.1em` para `-0.18em`), com exceção dedicada ao `.pastor-amp` para preservar o espaço normal antes de "Janete".
3. **Cronograma** — seção `#cronograma` removida temporariamente (HTML + CSS órfão removidos). Link "Cronograma" do footer também retirado. Quando a programação oficial dos 3 dias estiver confirmada, basta reintroduzir os blocos.
4. **Countdown** — redesenhado como destaque editorial no lugar da programação removida. Números maiores (4.6rem), separadores ":" sutis em laranja, container delimitado por linhas finas horizontais com gradient discreto. Mais presença, mais urgência, sem perder o minimalismo.
5. **Footer — ícones reais** — botões "IG/YT/WA/FB" substituídos por ícones SVG (Instagram da Igreja, Instagram da Juventude House com tags "IGREJA"/"HOUSE" sob o botão, WhatsApp, Facebook). Links abrem em nova aba. Hover sutil com leve elevação.
6. **Footer — contato** — e-mail removido; WhatsApp (`+55 18 99678-3104`) e Instagram (`@casadeamoroficial`) clicáveis com ícone à esquerda. "Fale conosco" do FAQ também aponta para o WhatsApp.
7. **Local** — botão "Como Chegar" virou "Abrir no Google Maps" com ícone de pin, apontando para `https://share.google/28KgarkLwAHqlpPt4`, abre em nova aba.

Estrutura mantida dentro de `house-conf-26/`. Nada criado fora da pasta principal. Nenhum arquivo duplicado.

---

## Changelog — Refinamento V3 (22/maio/2026)

Quatro ajustes finos sobre a V2:

1. **Footer / redes sociais** — ícones reais mantidos, mas removidas as legendas "IGREJA / HOUSE" abaixo dos botões. O segundo Instagram (Juventude House) tem um glyph adicional sutil dentro do círculo para diferenciação visual, e os 4 links seguem rótulos completos via `title` (tooltip nativo) e `aria-label` (acessibilidade). Padrão visual recuperado: círculos minimalistas, alinhados à esquerda, hover suave.

2. **Contato** — adicionado e-mail clicável (`contato@casadeamor.com.br`). Os 3 links (WhatsApp, Instagram, E-mail) agora seguem uma hierarquia label/valor: ícone redondo + linha "WHATSAPP" / valor "+55 18 99678-3104", muito mais premium e legível.

3. **Local** — o card central do mapa, que mostrava "Endereço a confirmar", agora exibe **"Igreja Quadrangular Casa de Amor"** + **"Abrir localização no Google Maps"** e é um link clicável apontando para `https://share.google/28KgarkLwAHqlpPt4` (com indicador de "abrir externo" no canto superior direito). O bloco direito "Endereço" também recebe um link inline "Ver no Google Maps". Botão grande "ABRIR NO GOOGLE MAPS" mantido.

4. **Compatibilidade Safari/iPhone** —
   - **`.reveal` agora aparece por padrão**; só fica invisível quando o JS confirma a inicialização (classe `.js-ready` no `<html>`, setada por um script bootstrap inline no `<head>`). Se o JS falhar (CSP, Reader Mode, rede ruim, JS desabilitado), o conteúdo continua visível — sem fantasmas.
   - **`min-height: 100vh` → `100svh`** no hero e no CTA final, com fallback `100vh`. Corrige o bug clássico do iOS Safari onde a barra de URL "engolia" parte do conteúdo.
   - **`-webkit-backdrop-filter`** adicionado em todas as ocorrências que faltavam (header, menu mobile, btn-outline, map arrow).
   - **`<noscript>`** para o countdown: se o JS não rodar, mostra "11 · 12 · 13 de Setembro de 2026" como fallback elegante abaixo dos zeros.
   - **`-webkit-tap-highlight-color: transparent`** e **`text-size-adjust: 100%`** no `<body>` / `<html>` — sem flash azul ao tocar, sem zoom indesejado ao virar o iPhone.
   - **`prefers-reduced-motion: reduce`** desativa todas as animações de reveal para usuários que pediram movimento reduzido no sistema.
   - Caminhos relativos validados: `assets/`, `css/`, `js/` — tudo relativo a `index.html`, funciona em qualquer host.

Estrutura mantida dentro de `house-conf-26/`. Nada criado fora.

---

## Changelog — Refinamento V4 (22/maio/2026)

Foco apenas em três pontos. Tudo o resto (hero, timer, footer, redes sociais, contato, FAQ, navegação) intocado.

1. **Seção Local — mapa premium**
   - O iframe do Google Maps agora ocupa todo o card (600px no desktop, 500px em tablet, 380px em mobile). Acabou a sensação de "mapa dentro de uma caixinha".
   - Filtro CSS (`invert + hue-rotate`) aplica um look noturno/cinematográfico ao mapa, alinhando à identidade visual.
   - Botão **"ABRIR NO GOOGLE MAPS"** sobreposto na base do card, glass premium (backdrop-filter + blur + saturate), centralizado, com ícone de pin laranja + seta de "abrir externo". Hover: vira laranja sólido sobre cream, com leve elevação.
   - Endereço atualizado para `https://share.google/lyI0NgCxhQRfg05D5` nos três pontos: iframe (via query pelo nome), botão sobreposto, link inline "Ver no Google Maps" e botão grande do painel direito.

2. **Talita Cantazaro** — nome corrigido (era "Zancaro"). Foto substituída pela versão nova. Arquivo `talita-zancaro.jpg` removido, `talita-cantazaro.jpg` adicionado (900×1200, JPG q88). Cantar e contexto de palco preservados no enquadramento. Função: Adoração + Palavra (mantida).

3. **Eliseu Nogueira** — foto substituída pela versão nova. Mesmo enquadramento 3:4 do line-up. Nome e função (Preletor) mantidos. Card big, mesmo layout.

Preservados no line-up: overlay escuro, gradientes nos cards, hover, grid 4+2 (cards big × 2 + 4 menores), responsividade. Estrutura do grid inalterada.

---

## Changelog — Refinamento V5 (22/maio/2026)

Apenas um ajuste: o bloco de contato no footer.

**WhatsApp — CTA no lugar de número estático**

A antiga linha "WhatsApp · +55 18 99678-3104" foi removida e substituída por um card de chamada para ação:

- **Título**: "Dúvidas sobre a conferência?" (em Inter peso 600, cream)
- **Texto**: "Fale diretamente com nossa equipe pelo WhatsApp."
- **Botão**: "CHAMAR NO WHATSAPP →" (outline cream no estado normal; preenche com o gradiente assinatura do site — cream → orange-warm → orange — no hover, texto vira preto)
- **Link**: https://wa.me/5518996783104, abre em nova aba (`target="_blank"`, `rel="noopener noreferrer"`)
- **Card inteiro clicável**: o `<a>` envolve título, texto e botão; clicar em qualquer parte aciona o link
- **Identidade visual**: fundo radial sutil em laranja translúcido, borda em cream/18%, fio decorativo vertical à esquerda com gradiente (transparente → orange → orange-warm → transparente), ícone do WhatsApp em círculo
- **Hover**: borda fica laranja, fundo intensifica, card sobe 2px com sombra laranja, ícone aumenta levemente, fio lateral fica em opacidade total, botão preenche com gradiente, seta desliza 3px
- **Responsivo**: layout adapta naturalmente (testado em 1440px desktop e 393px mobile/iPhone). Botão usa `white-space: nowrap` para garantir uma linha em qualquer largura razoável; título usa `font-family: var(--font-body)` para legibilidade em sentence case
- **Acessibilidade**: `aria-label` descritivo, `focus-visible` com outline laranja

Os outros 2 contatos (Instagram, E-mail) permanecem na lista abaixo do CTA, mantendo o padrão label/valor com ícone.

---

## Changelog — Refinamento V6 (22/maio/2026)

Refino do bloco **Contato** no footer — limpeza completa para tirar a aparência de "central de atendimento / SAC / card de propaganda".

**Removido**
- E-mail (`contato@casadeamor.com.br`)
- Card pesado "Dúvidas sobre a conferência?" com ícone grande, fundo gradiente, botão e fio decorativo
- Linha "Igreja Quadrangular Casa de Amor" duplicada no topo da coluna (já aparece no `footer-bottom`)
- Círculos ao redor dos ícones de contato (deixavam aparência de SAC)

**Novo formato — minimalista, premium**
```
CONTATO
[💬] WHATSAPP OFICIAL
     +55 18 99678-3104

[◉] INSTAGRAM OFICIAL
    @quadrangularcasadeamor

[◉] INSTAGRAM JUVENTUDE HOUSE
    @juventudehouse

Falar com a organização →
```

- Ícones **soltos** (sem caixa, sem círculo), 16px, em cobre/`--amber`, opacidade 85%
- Hierarquia em duas linhas: label uppercase + valor texto-claro (mesmo padrão dos outros contatos)
- 3 links, todos `target="_blank"`, todos abrem em nova aba
- CTA discreto na base: texto **"Falar com a organização →"** com underline cobre, seta âmbar. Sem fundo, sem borda — só uma linha refinada
- Hover: ícone vira laranja vivo, valor vira cream, link desliza 2px à direita
- CTA hover: sublinhado intensifica em laranja, seta laranja desliza, gap aumenta levemente
- Foco visível com outline laranja para acessibilidade via teclado

**URLs padronizadas em todo o site** (limpas, sem `?igsh=...`):
- WhatsApp: `https://wa.me/5518996783104`
- Instagram Igreja: `https://www.instagram.com/quadrangularcasadeamor`
- Instagram Juventude House: `https://www.instagram.com/juventudehouse`

**Resultado** — quatro colunas do footer com densidade visual equilibrada. A área de contato transmite organização, confiança, atendimento humano, sem aparência de propaganda ou central de atendimento.

---

## Changelog — Refinamento V7 (22/maio/2026)

Ajuste único na seção Contato.

**Removido**
- Exibição visual do número `+55 18 99678-3104`
- CTA inferior "Falar com a organização →" (redundante após o novo formato)
- CSS órfão de `.contact-cta-link`

**Novo formato do WhatsApp**
- Label: `WHATSAPP OFICIAL`
- Valor (clicável): `Fale com a organização`
- Link: `https://wa.me/5518996783104` (abre em nova aba)

O WhatsApp continua 100% funcional — o link permanece exato, apenas o número não aparece mais na tela. O texto "Fale com a organização" comunica atendimento humano em vez de canal técnico.

**Estrutura final do bloco Contato**
```
CONTATO

💬  WHATSAPP OFICIAL
    Fale com a organização

◉  INSTAGRAM OFICIAL
   @quadrangularcasadeamor

◉  INSTAGRAM JUVENTUDE HOUSE
   @juventudehouse
```

Os três itens seguem exatamente o mesmo padrão visual (ícone solto cobre + label uppercase + valor texto-claro), com hover suave: ícone vira laranja, valor vira cream, leve deslocamento 2px à direita.

---

## Changelog — V8 — Fluxo de Inscrição (24/maio/2026)

Implementado o fluxo completo de inscrição em página dedicada (`inscricao.html`),
preservando 100% do site existente. Lógica baseada no cadastro-base oficial enviado.

### Arquivos novos
- `inscricao.html` — fluxo SPA-style com 4 etapas
- `js/inscricao.js` — lógica completa (estado, validação, integrações)
- `css/inscricao.css` — estilos exclusivos (prefixo `.insc-`)

### Site principal — alterações mínimas
- Todos os 5 CTAs ("Faça sua inscrição", "Garantir minha vaga", "Fazer minha inscrição", etc.) agora apontam para `inscricao.html`
- FAQ ajustada: parcelamento em 3x (antes era 6x) e regra de crianças (até 10 anos não pagam — antes era 5 anos)

### Fluxo de inscrição (4 etapas)

**Etapa 1 — Plano**
Apresenta os dois lotes (1º ativo, 2º "em breve" esmaecido) + 4 cards de tipo:
- Individual · R$ 80,00
- Combo Família · 3 pessoas · R$ 220,00
- Combo 5 Amigos · R$ 380,00
- Criança até 10 anos · Gratuito (borda tracejada cobre)

Barra de benefícios: "Crianças até 10 anos não pagam · Cartão em até 3x · Pagamento seguro · Mercado Pago · Confirmação imediata".

**Etapa 2 — Dados do participante**
Form premium (linhas minimalistas, sem caixas pesadas) com 7 campos:
- Nome Completo *
- CPF * (com máscara automática)
- Data de Nascimento * (input `type="date"` estilizado para tema escuro)
- WhatsApp * (com máscara automática)
- E-mail *
- Cidade *
- Igreja / Congregação (opcional)

Validação básica: nome com sobrenome, CPF com 11 dígitos, e-mail formato válido, WhatsApp com ao menos 10 dígitos. Erros inline em cada campo, scroll automático até o primeiro erro.

**Etapa 3 — Resumo**
Lista todas as informações cadastradas, valor total em destaque (gradient cream→orange), informação de parcelamento ("ou 3x de R$ XX,XX no cartão"), três métodos de pagamento (Pix · À vista, Cartão · Crédito e débito, Parcelamento · Em até 3x), botão "Ir para pagamento", nota "Você será redirecionado para o ambiente seguro do Mercado Pago".

**Comportamento especial para criança gratuita:**
- Valor total: R$ 0,00 com "Entrada gratuita — não há cobrança"
- Botão muda para "Concluir inscrição"
- Métodos de pagamento ocultados
- Pula MP, vai direto para confirmação

**Etapa 4 — Confirmação**
Círculo grande em gradient com check ✓ animado (pop-in), título "Inscrição registrada" (ou "confirmada" para criança), mensagem informando confirmação por WhatsApp/e-mail, código de referência (`HC26-2026-XXXX`) em mono dentro de borda tracejada, botão "Voltar ao início".

### Integrações (stubs prontos)

**Google Sheets** — variável `GOOGLE_SCRIPT_URL` em `js/inscricao.js`:
- Modo demo: enquanto não preenchida, registra no `console.log` o payload completo
- Produção: cole o URL `/exec` do Apps Script Web App. Exemplo de `doPost` no comentário do JS (recebe JSON e usa `sh.appendRow(...)`)
- Envio via `fetch(..., { mode: 'no-cors' })` — padrão para Apps Script
- Colunas geradas automaticamente:
  `data | reference | nome | cpf | nascimento | whatsapp | email | cidade | igreja | tipo | tipo_label | valor | status`
- Status possíveis no campo `status`: `AGUARDANDO PAGAMENTO` · `CONFIRMADO` (criança) · `PAGO` · `CANCELADO` · `REEMBOLSADO`

**Mercado Pago Checkout Pro** — variável `MERCADO_PAGO_CHECKOUT_URL`:
- Modo demo: enquanto não preenchida, simula sucesso após 0.8s e vai para confirmação
- Modo A — Link de pagamento fixo: cole um link do tipo `https://mpago.la/...` ou `https://mercadopago.com.br/...`. O JS detecta automaticamente e redireciona com `window.location.href`
- Modo B — Endpoint backend: cole o URL do seu backend que cria a preferência. O backend recebe POST JSON `{ reference, tipo, tipo_label, valor, parcelas_max, participante }` e deve responder `{ init_point: "https://..." }`. O JS então redireciona para o init_point
- **ACCESS_TOKEN nunca aparece no frontend** (segurança)
- Retorno do MP: ao redirecionar de volta com `?status=success&ref=HC26-2026-XXXX`, o fluxo pula direto para a Etapa 4

### Área centralizada para edição (em `js/inscricao.js`)

```js
const PRICES = {
  individual_lote1: 80,
  individual_lote2: 100,
  combo5_lote1: 380,
  familia3_lote1: 220,
  crianca_ate10: 0
};

const LOTE_ATIVO = 1; // mude para 2 quando o 1º lote acabar
const IDADE_GRATUIDADE = 10;
const PARCELAS_MAX = 3;

const GOOGLE_SCRIPT_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT_EXEC";
const MERCADO_PAGO_CHECKOUT_URL = "COLE_AQUI_O_LINK_OU_ENDPOINT_DO_CHECKOUT";
```

Trocar o lote ativo é tão simples quanto mudar `LOTE_ATIVO = 1` para `LOTE_ATIVO = 2`. Os cards de combo automaticamente ficarão desativados (configuração via TIPOS).

### Identidade visual

100% alinhada ao site:
- Mesma paleta (`--cream`, `--orange`, `--orange-warm`, `--amber`)
- Mesmas fontes (Neue Haas Display + Fraunces + Inter)
- Step bar com numeração circular em gradient
- Cards com bordas finas cobre e fundo radial laranja translúcido sobre charcoal
- Botão primário usa o mesmo gradient signature (cream → orange-warm → orange) já usado no site
- Mesma estrutura de reveal animations (compatível com fallback Safari/iOS)
- Responsivo testado em 1440px e 393px (iPhone)
- Hover suave, transições com curva `cubic-bezier(.2,.8,.2,1)`

---

## Changelog — V9 — Fluxo integrado como overlay no index.html (24/maio/2026)

O fluxo de inscrição agora vive **dentro do próprio `index.html`** como um overlay
modal full-screen. Não há mais navegação para outra página — o usuário clica em
qualquer CTA "Fazer inscrição" e o overlay sobe na hora.

### Como funciona

- **HTML do fluxo embutido** como `<aside class="insc-overlay" id="inscricao-overlay">`
  no final do `<body>`, antes dos scripts.
- **5 CTAs do site** (`a[href="#inscricao"]`) — hero, header, cta-strip, cta-final,
  link do footer — todos apontam para `#inscricao`. O JS intercepta o clique e
  abre o overlay (com `preventDefault`).
- **Botão X de fechar** no canto superior direito do overlay. Também fecha com
  **tecla Esc** ou clicando em "Voltar ao site" / "Voltar ao início".
- **Botão "Voltar"** do navegador funciona: pressionar voltar fecha o overlay
  (via `popstate` listener).
- **Scroll do site travado** quando o overlay está aberto (via `body.insc-overlay-open`).
- **Reset automático para a etapa 1** toda vez que reabrir.

### Por que `id="inscricao-overlay"` e não `#inscricao`?

O site já tem um `<section id="inscricao">` que envolve o CTA final (countdown
gigante + botão "Fazer minha inscrição"). Os 5 CTAs do site historicamente
apontavam para ele com scroll suave. Agora:
- O overlay tem id próprio (`inscricao-overlay`) para não conflitar
- Os CTAs continuam apontando para `#inscricao`, mas o JS intercepta antes do
  scroll padrão e abre o overlay
- Se o JS falhar (caso raríssimo), o navegador rola até o CTA final como
  fallback elegante — o usuário ainda chega num botão de inscrição

### `inscricao.html` continua existindo

A página standalone (`inscricao.html`) **continua funcionando** com o mesmo JS
e CSS, para o caso de alguém:
- Compartilhar o link direto
- Ter problemas com modal/popup
- Querer abrir em outra aba

O JS detecta automaticamente o modo: se o overlay existe na página atual, ele
gerencia abertura/fechamento; se não existe (página standalone), pula essa parte
e o conteúdo já aparece direto.

### Validado

Testado o fluxo completo de ponta a ponta dentro do overlay:
- Hero → click → overlay abre na etapa 1
- Seleciona Combo Família → continua
- Preenche todos os 7 campos com validação inline
- Resumo correto com valor R$ 220,00
- "Ir para pagamento" em modo demo → confirmação
- "Voltar ao início" fecha o overlay
- Site principal volta ao estado original
