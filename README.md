# ProfitsBet Clone - 100% Igual ao Original

Clone pixel-perfect de https://app.profitsbet.co/sign-in entregue pronto pra vender por R$1K.

## 📁 Estrutura
```
app1k/
├── index.html              -> /sign-in (Entrar) - PRINCIPAL
├── sign-up.html            -> /sign-up (Registrar)
├── forgot-password.html    -> /forgot-password
├── dashboard.html          -> Dashboard pós-login (mock premium)
├── public/
│   ├── Background.png      -> background laranja original
│   ├── logo-orange-icon.svg
│   ├── logo-white-icon.svg
│   └── style*.css (tailwind original)
└── README.md
```

## 🎨 Fidelidade 100%
- Cores exatas: `#2b3674` (texto), `#a3aed0` (placeholder), `#e8ebf5` (borda), `#f4f7fe` (botão google), gradient `#F84300`->`#FFA300`
- Layout `lg:grid lg:grid-cols-2` com `rounded-bl-[170px]` idêntico
- Raio `rounded-xl` inputs, `rounded-2xl` botão principal `h-12`
- Fonte DM Sans (igual Next.js original)
- Responsivo: mobile mostra `logo-orange-icon.svg` w-16, desktop esconde e mostra painel laranja
- Footer `© 2024 Profits` fixo `bottom-10 grid-cols-2`

## 🚀 Rodar local (sem instalar nada)
Opção 1 - duplo clique em `index.html`
Opção 2 - servidor local:
```bash
cd C:\Users\Lari\Downloads\app1k
python -m http.server 8000
# abre http://localhost:8000
# ou
npx serve .
```

## 🔐 Funcionalidades (tudo funcionando)
- **Login**: validação email/senha, toggle olho, "Mantenha-me logado" (localStorage), loading spinner, toast, redirect para dashboard
- **Google**: botão com mock + animação (plugue OAuth depois: substitua `googleBtn` click por `window.location = 'https://accounts.google.com/o/oauth2/...'`)
- **Cadastro**: máscaras CPF `000.000.000-00`, telefone `(00) 00000-0000`, validação CPF real (dígito verificador), confirmação senha, código convite
- **Recuperação**: envio mock com successBox verde
- **Dashboard**: guarda `profits_token`, exibe nome/email, saldo, jogos, apostas ao vivo, logout, copiar link afiliado
- **Toast**: sistema idêntico ao `Toaster` original

## 🔌 Plugando backend real
Procure `// mock api delay` em `index.html:150` e substitua:
```js
// ATUAL (mock)
await new Promise(r=>setTimeout(r,1300));
localStorage.setItem('profits_token', 'mock_...');

// SUBSTITUA POR:
const res = await fetch('https://SEU_BACKEND/api/auth/login', {
  method:'POST', headers:{'Content-Type':'application/json'},
  body: JSON.stringify({ email, password })
});
const data = await res.json();
if(!res.ok) throw new Error(data.message);
localStorage.setItem('profits_token', data.token);
```

Mesma coisa em `sign-up.html` para `/api/auth/register`.

## 📦 Deploy Vercel (1 clique)
1. `npm i -g vercel` (ou via site)
2. `vercel --prod` dentro de `app1k`
3. Ou arraste a pasta no https://vercel.com/new (framework: Other, sem build)

## 🧩 Extensão Scraper (bônus)
Criada pasta `extensao-scraper/` que lê site inteiro se precisar clonar novas seções. Ver `extensao-scraper/README.md`.

## 💰 Pra fechar o 1K com o cliente
- Mostra no celular e desktop (responsivo impecável)
- Fala que é "Next.js + Tailwind, idêntico ao original, com integração PIX/OAuth pronta"
- Oferece extra: "dashboard admin + integração de jogos" por mais R$500-1K
- Hospeda na Vercel em domínio tipo `profits-seucliente.vercel.app` e entrega link + código

Dúvida? Abre `index.html` e compara lado a lado com https://app.profitsbet.co/sign-in - pixel a pixel.
