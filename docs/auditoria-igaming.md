# Auditoria IGAMING — veredito por zip (17/09/2026)

Extraídos e varridos (backdoor, eval, exfiltração, minerador, nulled) fora de `vendor/` e `node_modules/`.
**Nenhum malware ativo encontrado.** Ressalvas pontuais abaixo. Origens `codelist.cc` / `digitallybold` = versões sem licença — sem garantia nem update.

## INTEGRA (front portátil → nossas landings)

| Zip | O que é | Categoria | Obs |
|---|---|---|---|
| BLAZE DOUBLE / MINES / CLONE / CRASH | Clones visuais React/Next (sem saldo) | Cassino | `blaze-crash` é o mais completo (stores+testes); usar de base visual |
| NEXTBRID PRO (`nextbirds.pro`, 259 arq) | Jogo HTML5 completo estilo Flappy (Construct 3) | Retrô/Arcade | `eval` achado = falso positivo do engine; limpo |
| GOLDSVET 8.5 (Aviator) | Aviator JS + sons + Laravel + `aviatoradmin` + `db.sql` | Cassino (Crash) | `eval` = falso positivo (plugin jQuery); front do Aviator reaproveitável |

## STANDALONE (sistema PHP próprio — deploy separado, NÃO mistura no app1k)

| Zip | Stack | Gateway | Obs |
|---|---|---|---|
| SISTEMA BET 1.0 | CodeIgniter + MySQL (`DB.sql`) | **SuitPay + EzzeBank (PIX)** | Melhor custo-benefício p/ BR; trocar `md5` e `webhook.com` |
| BETPRO betpro-22 | Laravel 8 + Flutter | Stripe/PayPal/Flutterwave/etc | Esporte (não cassino); nulled codelist |
| LARA CASSINO | Laravel + Vue (`casino/`) | a ver | Limpo; auditar gateway ao instalar |
| GOLDSVET V9 | Laravel + Node WS + dezenas de slots próprios (`app/Games/*`) | a ver | `$_POST['CMD']` = protocolo dos slots, falso positivo; projeto open-source |
| TUBARAOBET | Mesmo motor do V9 (lojas `w_shops`, ATM, fish) + dumps SQL | a ver | Trocar `Password Admin 123456`; mesmo veredito do V9 |
| RUNE CASSINO | Laravel, cassino cripto open-source | cripto, sem PIX | OAuth VK/Discord/Steam/FB/Google legítimos; sem BR sem retrabalho |

## DESCARTA

| Zip | Motivo |
|---|---|
| CASSINO RU (`lucker.zip`) | Rip russo (`luc1.fun`, RUB, VK, FreeKassa/aaio + **chave API de terceiros hardcoded** no Admin). Sem backdoor clássico, mas inútil p/ BR e antiético reaproveitar credencial alheia |
| SUBWAY MONEY (`.rar`) | Espelho HTTrack morto: formulários sem backend (`users.js` vazio), jogo sem arquivos, analytics do dono original. Só serve de referência de copy |
| JOGO DO BICHO / SEU PALPITE | Espelhos HTTrack mortos, sem lógica |
| 1WIN PRO TEMA DIFERENTE | Pasta vazia |
| `app1k/games/*` (18 scrapes) | **Apagados neste ciclo** (commit `cd7f7e4`); eram cascas Next.js sem assets |

## SubwayV3 (`subway surf completo`, 17/09) — VEREDITO: standalone com ressalvas

Sistema BR completo e funcional: Unity WebGL Subway (mapas Venice + London, personagens, áudio) + PHP (login/cadastro/depósito/saque/painel/adm/afiliados/presell/pixels) + dump SQL (tabelas `appconfig`, `gateway`, `confirmar_deposito`, `saques`, `apostas`, `ggr`...) + 2 vídeos tutorial. Scan limpo (só falsos positivos de libs). Gateway = **SuitPay** (`ws.suitpay.app`, `ci:`/`cs:` do banco, tabela `gateway`); saque = fila manual (`aguardando`, dono paga por fora).

**ATENÇÃO — coleira de receita do autor (declarada no docx: "SCRIPT FREE TEM 15% DE GGR"):**
- `auth/percas.php`: cada derrota do jogador alimenta a tabela `ggr` (`ggr_total = total_percas*0.08`) com status `IRREGULAR/REGULAR` = eles sabem quem não repassa.
- `deposito/index.php`: split SuitPay (`split_user`/`split_percent` da tabela `gateway`) = o corte pode sair automático em cada depósito.
- Para usar sem repasse: neutralizar `percas.php` + zerar split (decisão sua; se for pagar, mantém).
- Obrigatório trocar: `conectarbanco.php` (vem com senha Hostinger de terceiros: `u523120494_exclusivo`), chaves SuitPay (`gateway`), webhook `/webhook/pix.php` p/ seu domínio.
- Bugs: SQL injection em `deposito/consultarpagamento.php:31` (token cru no sprintf); restos de outro site (Google Ads `AW-11305271105`, iframes FruitsMoney); `chatwoot` com token `=======`.
- Requer hospedagem PHP + MySQL (não roda na Vercel).

## Mapa final por categoria (nada misturado)

- **Retrô/Arcade**: Block Blast (pronto) + `nextbirds.pro` (integrar) + Subway/Helix (reescrever)
- **Cassino**: Double/Mines/Crash (lógica pronta) + front Aviator GOLDSVET 8.5 + base `blaze-crash`
- **Raspadinha**: reescrever (Copa/Chinesa/Padrão)
- **Slots provider**: Fiverscan quando o dono plugar; antes disso "em breve"
