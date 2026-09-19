# Zeus Olympus - Theme Design Document

## Pilar 1: Identidade Visual e Cores (Tema: Dark Olympus)

### Background
Templo no topo do Monte Olimpo à noite, com nuvens densas. Raios reagem dinamicamente no Frontend (CSS/Canvas) a cada Tumble ou Scatters caindo.

### Cores Primárias (Hex)
- **Fundo/UI**: `#0B0C10` (Dark background) e `#1F2833` (Painéis e modais)
- **Destaque Ouro (High Pays/Wins)**: `#FFD700` com glow radial
- **Energia/Raios (Efeitos)**: `#45A29E` (Cyan) e `#66FCF1` (Neon Blue)
- **Multiplicadores Épicos (50x+)**: `#8A2BE2` (Roxo Elétrico) e Vermelho Carmesim

---

## Pilar 2: Lista de Imagens e Estados (Assets do Jogo)

O Frontend precisará de uma sprite sheet ou carregamento de imagens em 3 estados para cada símbolo.

| ID do Símbolo | Categoria | Descrição Visual | Estados (Sufixos do Arquivo) |
|---------------|-----------|------------------|------------------------------|
| sym_crown | High Pay | Coroa de Ouro de Zeus | _normal, _blur (queda), _win (brilho/escala) |
| sym_hourglass | High Pay | Ampulheta com areia dourada | _normal, _blur, _win |
| sym_ring | High Pay | Anel com pedra rubi | _normal, _blur, _win |
| sym_chalice | High Pay | Cálice de vinho brilhante | _normal, _blur, _win |
| sym_gem_red | Low Pay | Gema vermelha pentagonal | _normal, _blur, _win (destruição 3D) |
| sym_gem_purple | Low Pay | Gema roxa triangular | _normal, _blur, _win (destruição 3D) |
| sym_gem_yellow | Low Pay | Gema amarela hexagonal | _normal, _blur, _win (destruição 3D) |
| sym_gem_green | Low Pay | Gema verde losango | _normal, _blur, _win (destruição 3D) |
| sym_gem_blue | Low Pay | Gema azul quadrada | _normal, _blur, _win (destruição 3D) |
| sym_scatter | Scatter | Rosto de Zeus (animado) | _normal, _blur, _win (dispara raios) |
| sym_mult_x | Feature | Orbes com asas (Verde, Azul, Roxo, Vermelho) | _normal, _blur, _win (absorção na UI) |

---

## Pilar 3: Estrutura Matemática e Regras

### Grid
- **6 colunas x 5 linhas** (30 posições)
- A cada spin, o RNG preenche a matriz

### Regra de Tumble (Cascata)
- Símbolos vencedores (8+) são removidos
- Símbolos acima caem para preencher espaços
- Novos símbolos caem do topo
- Ciclo continua até não haver mais combinações
- Multiplicadores na tela são somados ao final do Tumble completo e aplicados ao ganho total do spin

### Paytable (Multiplicador sobre a Bet Base) e Pesos (RNG)

| Símbolo | 8-9 Ocorrências | 10-11 Ocorrências | 12+ Ocorrências | Peso Base (RNG) |
|---------|-----------------|-------------------|-----------------|-----------------|
| Crown | 10x | 25x | 50x | 20 |
| Hourglass | 2.5x | 10x | 25x | 35 |
| Ring | 2x | 5x | 15x | 50 |
| Chalice | 1.5x | 2x | 12x | 70 |
| Gem Red | 1x | 1.5x | 10x | 150 |
| Gem Purple | 0.8x | 1.2x | 8x | 200 |
| Gem Yellow | 0.5x | 1x | 5x | 300 |
| Gem Green | 0.4x | 0.9x | 4x | 350 |
| Gem Blue | 0.25x | 0.75x | 2x | 400 |

> Nota: Pesos invertidos; quanto menor o peso, mais raro o símbolo.

### Regras Especiais

#### Multiplicadores Aleatórios (sym_mult_x)
- Podem cair no jogo base ou Free Spins
- Valores possíveis: 2x, 3x, 4x, 5x, 6x, 8x, 10x, 12x, 15x, 20x, 25x, 50x, 100x, 250x, 500x

#### Scatter (Zeus)
- 4 ou mais Scatters em qualquer lugar da tela acionam 15 Free Spins
- Pagam diretamente: 4 (3x), 5 (5x), 6 (100x)

#### Free Spins (Acúmulo)
- Durante os giros grátis, sempre que um multiplicador cai em um giro vencedor, ele é adicionado ao "Multiplicador Global"
- Esse multiplicador global não zera até o fim da rodada bônus
- Se caírem 3 Scatters no bônus, adiciona +5 Free Spins

---

## Métricas do Jogo
- **Target RTP**: 96.5%
- **Volatilidade**: High
- **Max Win Multiplier**: 5000x