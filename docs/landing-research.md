# Dossiê — Design das maiores bets do Brasil (base p/ nossas landings)

Pesquisa: set/2026. Mercado regulado (Lei 14.790/2023, +180 bets autorizadas SPA/MF).
Top por receita: **Betano** (líder, ~R$7,4bi GGR 2025), **bet365**, **Sportingbet**,
**Superbet, KTO, Betnacional, Stake, Novibet, EstrelaBet, Blaze** (melhor coleção de originais).

## 1. Anatomia padrão (todas seguem o mesmo esqueleto)

1. **Topbar fixa escura**: logo esq. + saldo pill + `Entrar` (ghost) + `Cadastrar` (sólida, cor da marca). Sempre visível no scroll.
2. **Hero**: banner largo (promo/bônus) + jackpot acumulado gigante + CTA único ("Jogar agora" / "Apostar"). Blaze: sem banner, vai direto pros jogos.
3. **Faixa de confiança**: PIX instantâneo / saque 24h / suporte 24h / licença. Ícones, nunca texto corrido.
4. **Grade de jogos**: cards quadrados de arte PNG do provider (PG Soft, Pragmatic, Evolution), nome + provider embaixo. Abas: Populares / Slots / Ao vivo / Crash.
5. **Prova social**: apostas ao vivo (nome + jogo + valor), vencedores recentes.
6. **Como funciona**: 3 passos (conta → PIX → jogue/saque).
7. **Footer**: +18, jogo responsável, licença, métodos de pagamento (bandeiras PIX).
8. **Bottom nav mobile**: Início / Jogos / Depositar / Conta. (Blaze e Betano usam.)

## 2. Paletas das grandes (fundo escuro é regra no cassino)

| Bet | Fundo | Superfície | Acento/CTA | Texto | Observação |
|---|---|---|---|---|---|
| Blaze | `#0f1923` | `#1d2730` | vermelho `#ff4a00`-like / branco | branco | Minimalista, sem banner: grade direta de Originals |
| Betano | `#1a1a1a`/`#111` | `#222` | laranja `#ff5c00` | branco | Missões + SuperOdds no hero |
| bet365 | `#222`/`#333` | `#3a3a3a` | verde `#027b5b` + amarelo `#ffdf1b` | branco/cinza | A mais "completa", densa em mercados |
| Sportingbet | `#0e0e0e` | `#1c1c1c` | vermelho `#e30613` | branco | Super odds / múltipla turbinada |
| Superbet | `#121212` | `#1e1e1e` | rosa/magenta `#ff2e7e` | branco | Área interativa, promoções no hero |
| KTO | `#101010` | `#1b1b1b` | amarelo `#ffc400` + preto | branco | Torneios, cashback 1ª aposta |
| EstrelaBet | `#0d1117`-like | cards escuros | amarelo-estrela `#ffd400` | branco | Bolão, free bets |
| Betnacional | `#004b23` (verde campo!) | `#006633` | amarelo `#ffcc00` | branco | Única com fundo VERDE futebol, depósito desde R$1 |
| Stake | `#0f212e` | `#1a2c38` | azul `#1475e1` | branco | VIP, chat ao vivo, dark-blue |
| Novibet | `#150f2e` (roxo escuro) | `#221744` | verde-limão `#a3e635` | branco | Pagamento antecipado |
| Profits blockbast (ref) | `#0f1923` | `#1d2730` | verde `#8cb506` | branco | Jackpot + grade Populares + bottom nav |

**Regra de ouro**: fundo escuro + 1 cor de acento saturada no CTA + jackpot em amarelo-ouro. Nossos presets do `p.html` já seguem isso.

## 3. Cards de jogo (sem emoji — arte PNG real)

- Formato: quadrado ou 3:4 vertical, arte do provider ocupando 100% do card, sem texto por cima (nome/provider em legenda abaixo).
- Provedores que o BR reconhece de longe: **PG Soft** (Fortune Tiger/Dragon/Ox), **Pragmatic Play**, **Evolution** (ao vivo), **Spribe** (Aviator/Mines).
- Onde conseguir PNG: nossos `public/layouts/*.png` (19 prints), dashboard do provider/Fiverscan (`banner` da API `game_list`), ou recorte dos cards do Profits.
- Tamanho: thumbs ~400x400, hero/banner 1600x500. Max 3MB (regra que já usamos no painel).

## 4. Copy que converte (padrões repetidos em todas)

- Hero: bônus quantificado ("100% até R$X", "Prêmios até R$100 mil", "Depósito desde R$1").
- Urgência/quantidade: jackpot acumulado subindo, "X pessoas jogando agora".
- Risco invertido: "saque 24/7", "PIX instantâneo", "suporte 24h".
- Rodapé legal obrigatório: +18, jogo responsável, licença SPA/MF.

## 5. Mapeamento p/ nossos 19 layouts (`p.html` presets)

- Block Blast → verde `#8cb506` (igual ref Profits), hero blocos.
- Raspadinha/Copa → laranja/vermelho, "raspou ganhou".
- 777/Chineses (777, MK, CM777, W1, FPMMM, Caktus, Venon, Onaplay) → dourado/preto, jackpot milionário.
- Retrô (Subway, Helix) → verde-azul neon.
- Blaze (double/mines/crash) → vermelho Blaze, grade direta sem banner (igual original).
- Lootbox/Caixa → roxo mistério.
- Padrão → neutro escuro.

## 6. Próximo passo (quando voltar)

Trocar emojis do `p.html` por: PNGs dos providers nos cards, SVGs inline nos ícones de confiança/steps/bottom-nav, e textura/hero por layout. Nada de lógica — só assets + CSS.
