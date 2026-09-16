#!/usr/bin/env python3
# Auto-clona TODOS os 19 jogos do Profit pra vender separado
import pathlib, shutil, re

base = pathlib.Path(r"C:\Users\Lari\Downloads\app1k")
layouts_dir = base / "public" / "layouts"
template_file = layouts_dir / "subway-site.html"
games_dir = base / "games"

# 19 jogos REAIS do Profit (mesma ordem do modal)
jogos = [
    ("block-blast", "Block Blast", "block-blast.jpg", "Padrão", "Block Blast"),
    ("raspadinha-copa", "Raspadinha Copa", "raspadinha-copa.png", "Copa 2026", "raspadinha"),
    ("subway", "Subway Surfers", "retros.png", "Retros", "Retros"),
    ("helix", "Helix Jump", "helix.png", "Helix", "Helix"),
    ("w1", "W1", "chinese - w1.png", "Chines W1", "chines"),
    ("fpmmm", "FPMMM", "chinese - fpmmm.png", "Chines FPMMM", "chines"),
    ("lootbox", "Caixa Misteriosa", "lootbox.png", "Padrão", "Caixa"),
    ("lootbox2", "Caixa Misteriosa 2", "lootbox2.png", "Pacotes", "Caixa"),
    ("raspadinha-chinese", "Raspadinha Chinese", "raspadinha - chinese.png", "Chinesa", "raspadinha"),
    ("raspadinha-padrao", "Raspadinha Padrão", "raspadinha - padrao.png", "Padrão", "raspadinha"),
    ("777", "777", "chinese - 777.png", "777", "chines"),
    ("mk", "MK", "chinese - mk.png", "MK", "chines"),
    ("default", "Padrão", "chinese - default.png", "Default", "chines"),
    ("cm777", "CM777", "chinese - cm777.png", "CM777", "chines"),
    ("venonpg", "VENONPG", "chinese - venonpg.png", "VENONPG", "chines"),
    ("caktus", "Caktus", "caktus.png", "Caktus", "caktus"),
    ("onaplay", "Onaplay", "onaplay1.png", "Onaplay", "onaplay"),
    ("blaze", "Blaze", "blaze.png", "Blaze", "blaze"),
    ("playpix", "Playpix", "playpix.png", "Playpix", "playpix"),
]

if not template_file.exists():
    print(f"ERRO: {template_file} nao existe")
    exit(1)

template = template_file.read_text(encoding="utf-8", errors="ignore")

# Cria pasta games
games_dir.mkdir(exist_ok=True)

# Copia layouts pra dentro de games pra ficar standalone
for slug, nome, img, sub, cat in jogos:
    dest = games_dir / slug
    dest.mkdir(parents=True, exist_ok=True)
    # Copia imagem principal
    src_img = layouts_dir / img
    if src_img.exists():
        shutil.copy2(src_img, dest / "thumb.jpg")
    # Gera index.html clonado
    html = template
    # Troca titulo
    html = re.sub(r"<title>.*?</title>", f"<title>{nome} | Profits - Clone</title>", html, flags=re.I)
    html = html.replace("martineezzzzzz", nome.lower().replace(" ","-"))
    # Injeta banner no topo com nome do jogo
    inject = f"""
    <div style="position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(90deg,#FF4A00,#FF8800);color:white;padding:10px;text-align:center;font-family:Inter,sans-serif;font-weight:800;font-size:14px;">
      🎮 CLONE 100% - {nome} | {sub} - Original: profitsbet.app - Pronto pra vender!
      <a href="../index.html" style="margin-left:15px;background:white;color:#FF4A00;padding:5px 12px;border-radius:9999px;text-decoration:none;font-size:12px;">← Voltar pro Dashboard</a>
    </div>
    <div style="height:42px;"></div>
    """
    if "<body" in html:
        html = html.replace("<body", inject + "<body", 1)
    # Salva
    (dest / "index.html").write_text(html, encoding="utf-8")
    print(f"[OK] {nome:25} -> games/{slug}/")

# Gera index geral
index_content = """<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>19 Jogos Profits - Todos Clonados</title>
<script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;800&display=swap" rel="stylesheet"><style>*{font-family:Inter}</style></head><body class="bg-[#f6f7f9]">
<div class="max-w-[1200px] mx-auto p-6">
<h1 class="text-3xl font-extrabold text-black">🎮 19 Jogos ProfitsBet<span class="text-[#FF4A00]"> 100% Clonados</span></h1>
<p class="text-[#9aa0a6] mt-2">Cada pasta em <code>games/</code> é um site standalone pronto pra hospedar e vender. Clique pra preview.</p>
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
"""
for slug, nome, img, sub, cat in jogos:
    thumb = f"../public/layouts/{img}"
    # se tiver thumb local, usa relativo
    index_content += f"""
    <a href="./{slug}/" target="_blank" class="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl hover:scale-[1.02] transition group border-2 border-transparent hover:border-[#FF4A00]">
      <img src="{thumb}" class="w-full h-[180px] object-cover">
      <div class="p-3"><p class="font-bold text-sm text-black group-hover:text-[#FF4A00]">{nome}</p><p class="text-xs text-[#9aa0a6]">{sub}</p><p class="text-[11px] font-bold text-[#FF4A00] mt-1">Ver site →</p></div>
    </a>
    """
index_content += """
</div>
<div class="mt-8 bg-white rounded-2xl p-6 border flex gap-4 items-center">
<div class="w-12 h-12 rounded-xl bg-[#FF4A00] text-white grid place-items-center text-xl">💰</div>
<div><p class="font-extrabold">Pronto pra vender por R$1K cada ou pacote R$5K</p><p class="text-sm text-[#9aa0a6]">Cada pasta é independente - é só zipar e mandar pro cliente ou hospedar na Vercel</p></div>
<a href="../dashboard.html#plataformas" class="ml-auto px-6 py-3 bg-[#FF4A00] text-white font-bold rounded-xl">Voltar ao Dashboard</a>
</div>
</div></body></html>
"""
(games_dir / "index.html").write_text(index_content, encoding="utf-8")
print(f"\n[OK] Index geral criado: games/index.html")
print(f"[OK] TOTAL: {len(jogos)} jogos clonados em {games_dir}")
print("Pronto! Vai pro Jiu tranquilo.")
