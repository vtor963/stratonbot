#!/usr/bin/env python3
import pathlib, shutil, re
base = pathlib.Path(r"C:\Users\Lari\Downloads\app1k")
layouts = base / "public" / "layouts"
games = base / "games"
template = (layouts / "subway-site.html").read_text(encoding="utf-8", errors="ignore")

# Dados reais do lobby Subway - vamos replicar pra todos com lobby mock foda
jogos_lobby = [
    ("block-blast", "Block Blast", "🧱 Quebra-cabeça viciante"),
    ("raspadinha-copa", "Raspadinha Copa 2026", "⚽ Copa do Mundo - Raspe e ganhe"),
    ("subway", "Subway Surfers", "🏃‍♂️ Corra, desvie e colete moedas"),
    ("helix", "Helix Jump", "🌀 Desça a torre sem cair"),
    ("w1", "Fortune W1", "🐯 Tiger Fortune"),
    ("fpmmm", "FPMMM", "💰 Grupo de Sinais VIP"),
    ("lootbox", "Caixa Misteriosa", "📦 Abra e ganhe prêmios"),
    ("lootbox2", "Caixa Misteriosa 2", "📦 Pacotes Exclusivos"),
    ("raspadinha-chinese", "Raspadinha Chinese", "🥠 Sorte oriental"),
    ("raspadinha-padrao", "Raspadinha Padrão", "🎫 Raspe e ganhe na hora"),
    ("777", "777 Slots", "🎰 Caça-níqueis clássico"),
    ("mk", "MK Slots", "👊 Mortal Kombat Slots"),
    ("default", "Padrão", "🎲 Cassino completo"),
    ("cm777", "CM777", "🍀 Sorte CM"),
    ("venonpg", "VENONPG", "🦁 Leão da Sorte"),
    ("caktus", "Caktus", "🌵 Caqui do Sertão"),
    ("onaplay", "Onaplay", "🎮 Plataforma Onaplay"),
    ("blaze", "Blaze", "🔥 Crash & Double"),
    ("playpix", "Playpix", "💎 Pix instantâneo"),
]

for slug, nome, desc in jogos_lobby:
    pasta = games / slug
    pasta.mkdir(parents=True, exist_ok=True)
    # pega o template original (subway) e injeta lobby apresentando jogos
    lobby_html = template
    # troca cores e titulo
    lobby_html = lobby_html.replace("<title>martineezzzzzz</title>", f"<title>{nome} | Lobby Profits</title>", 1) if "<title>martineezzzzzz</title>" in lobby_html else lobby_html.replace("<title>", f"<title>{nome} | ", 1)
    # injeta secao de lobby apresentando jogos logo apos <body
    lobby_section = f"""
    <div id="LOBBY-INJETADO" style="position:relative;z-index:9998;background:#0f1923;color:white;font-family:Inter,sans-serif;">
      <div style="background:linear-gradient(90deg,#FF4A00,#FF8800);padding:14px;text-align:center;font-weight:800;">🎮 LOBBY - {nome} | {desc} | CLONE 100% <a href="../dashboard.html#plataformas" style="margin-left:12px;background:white;color:#FF4A00;padding:6px 14px;border-radius:9999px;text-decoration:none;font-size:12px;">← Dashboard</a> <a href="./index.html" style="margin-left:8px;background:rgba(0,0,0,0.2);color:white;padding:6px 14px;border-radius:9999px;text-decoration:none;font-size:12px;border:1px solid rgba(255,255,255,0.3)">Site Principal</a></div>
      <div style="max-width:1200px;margin:0 auto;padding:24px;">
        <h2 style="font-size:22px;font-weight:800;margin-bottom:6px;">{nome} <span style="color:#FF4A00;">| {desc}</span></h2>
        <p style="color:#9aa0a6;font-size:13px;margin-bottom:16px;">Lobby apresentando jogos - clique em qualquer slot pra jogar (demo). Todos os jogos deste layout já inclusos.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">
          <div style="background:#1d2730;border-radius:16px;padding:10px;text-align:center;border:1px solid #26323e;"><div style="height:110px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;display:grid;place-items:center;font-size:32px;">🎰</div><p style="font-weight:700;font-size:13px;margin-top:8px;">Fortune Tiger</p><p style="font-size:11px;color:#9aa0a6;">PG Soft • 96.8%</p><button style="margin-top:8px;width:100%;background:#FF4A00;color:white;border:0;padding:8px;border-radius:9999px;font-weight:700;font-size:12px;cursor:pointer;">JOGAR</button></div>
          <div style="background:#1d2730;border-radius:16px;padding:10px;text-align:center;border:1px solid #26323e;"><div style="height:110px;background:linear-gradient(135deg,#11998e,#38ef7d);border-radius:12px;display:grid;place-items:center;font-size:32px;">✈️</div><p style="font-weight:700;font-size:13px;margin-top:8px;">Aviator</p><p style="font-size:11px;color:#9aa0a6;">Spribe • Crash</p><button style="margin-top:8px;width:100%;background:#FF4A00;color:white;border:0;padding:8px;border-radius:9999px;font-weight:700;font-size:12px;cursor:pointer;">JOGAR</button></div>
          <div style="background:#1d2730;border-radius:16px;padding:10px;text-align:center;border:1px solid #26323e;"><div style="height:110px;background:linear-gradient(135deg,#fc4a1a,#f7b733);border-radius:12px;display:grid;place-items:center;font-size:32px;">💣</div><p style="font-weight:700;font-size:13px;margin-top:8px;">Mines</p><p style="font-size:11px;color:#9aa0a6;">Spribe • 97%</p><button style="margin-top:8px;width:100%;background:#FF4A00;color:white;border:0;padding:8px;border-radius:9999px;font-weight:700;font-size:12px;cursor:pointer;">JOGAR</button></div>
          <div style="background:#1d2730;border-radius:16px;padding:10px;text-align:center;border:1px solid #26323e;"><div style="height:110px;background:linear-gradient(135deg,#0f0c29,#302b63);border-radius:12px;display:grid;place-items:center;font-size:32px;">♠️</div><p style="font-weight:700;font-size:13px;margin-top:8px;">Blackjack</p><p style="font-size:11px;color:#9aa0a6;">Ao vivo</p><button style="margin-top:8px;width:100%;background:#FF4A00;color:white;border:0;padding:8px;border-radius:9999px;font-weight:700;font-size:12px;cursor:pointer;">JOGAR</button></div>
          <div style="background:#1d2730;border-radius:16px;padding:10px;text-align:center;border:1px solid #26323e;"><div style="height:110px;background:linear-gradient(135deg,#ff9966,#ff5e62);border-radius:12px;display:grid;place-items:center;font-size:32px;">🎡</div><p style="font-weight:700;font-size:13px;margin-top:8px;">Roleta</p><p style="font-size:11px;color:#9aa0a6;">Brasileira</p><button style="margin-top:8px;width:100%;background:#FF4A00;color:white;border:0;padding:8px;border-radius:9999px;font-weight:700;font-size:12px;cursor:pointer;">JOGAR</button></div>
          <div style="background:#1d2730;border-radius:16px;padding:10px;text-align:center;border:1px solid #26323e;"><div style="height:110px;background:linear-gradient(135deg,#56ab2f,#a8e063);border-radius:12px;display:grid;place-items:center;font-size:32px;">🍭</div><p style="font-weight:700;font-size:13px;margin-top:8px;">Sweet Bonanza</p><p style="font-size:11px;color:#9aa0a6;">Pragmatic</p><button style="margin-top:8px;width:100%;background:#FF4A00;color:white;border:0;padding:8px;border-radius:9999px;font-weight:700;font-size:12px;cursor:pointer;">JOGAR</button></div>
        </div>
        <div style="margin-top:18px;background:#1d2730;border:1px solid #26323e;border-radius:16px;padding:14px;display:flex;gap:12px;align-items:center;">
          <div style="width:44px;height:44px;background:#FF4A00;border-radius:12px;display:grid;place-items:center;color:white;font-size:20px;">💰</div>
          <div><p style="font-weight:800;font-size:13px;">Depósito PIX instantâneo</p><p style="font-size:12px;color:#9aa0a6;">Saque 24/7 • Taxa 5.49% • Suporte no lobby</p></div>
          <button style="margin-left:auto;background:#FF4A00;color:white;border:0;padding:10px 18px;border-radius:9999px;font-weight:800;cursor:pointer;">DEPOSITAR</button>
        </div>
      </div>
    </div>
    """
    if "<body" in lobby_html:
        lobby_html = lobby_html.replace("<body", lobby_section + "<body", 1)
        # remove o loader fixo que bloqueia
        lobby_html = lobby_html.replace('class="w-full h-full flex items-center justify-center fixed inset-0 bg-main-background overflow-hidden" style="z-index:999"', 'style="display:none"')
    (pasta / "lobby.html").write_text(lobby_html, encoding="utf-8")
    print(f"[LOBBY] {nome} -> lobby.html")

print("LOBBY OK - 19 lobbies com apresentacao de jogos criados")
