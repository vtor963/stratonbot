// Vercel Serverless — cria cobrança PIX (SuitPay / EzzeBank)
// Rota: POST /api/gateway-create  { platformId, tipo:'deposito', valor, player:{nome,email,cpf} }
// SEGREDO: nunca commita secret. Configura na Vercel: Project > Settings > Environment Variables
//   SUITPAY_URL, SUITPAY_CLIENT_ID, SUITPAY_CLIENT_SECRET
//   EZZEBANK_URL, EZZEBANK_CLIENT_ID, EZZEBANK_CLIENT_SECRET
// O front (p.html) hoje aprova "manual" na hora. Quando ligar o gateway de verdade,
// ele chama essa rota, recebe qrcode/copia-e-cola, e o webhook abaixo confirma.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { provider = 'suitpay', valor, player = {} } = req.body || {};
    if (!(Number(valor) > 0)) return res.status(400).json({ error: 'valor inválido' });

    if (provider === 'suitpay') {
      const base = process.env.SUITPAY_URL;
      const ci = process.env.SUITPAY_CLIENT_ID;
      const cs = process.env.SUITPAY_CLIENT_SECRET;
      if (!base || !ci || !cs) return res.status(500).json({ error: 'gateway não configurado (SUITPAY_*)' });
      const requestNumber = 'SP' + Date.now();
      const due = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
      const r = await fetch(base + '/api/v1/gateway/request-qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ci, cs },
        body: JSON.stringify({
          requestNumber, dueDate: due, amount: Number(valor),
          callbackUrl: 'https://' + req.headers.host + '/api/gateway-webhook',
          client: { name: player.nome || 'Jogador', document: (player.cpf || '').replace(/\D/g, ''), email: player.email || '' },
        }),
      });
      const data = await r.json();
      if (!data?.idTransaction) return res.status(502).json({ error: data?.message || 'falha suitpay', raw: data });
      return res.json({ gatewayId: data.idTransaction, qrcode: data.paymentCode, status: 'pendente' });
    }

    if (provider === 'ezzebank') {
      const base = process.env.EZZEBANK_URL;
      const cid = process.env.EZZEBANK_CLIENT_ID;
      const sec = process.env.EZZEBANK_CLIENT_SECRET;
      if (!base || !cid || !sec) return res.status(500).json({ error: 'gateway não configurado (EZZEBANK_*)' });
      // 1) token
      const basic = Buffer.from(cid + ':' + sec).toString('base64');
      const t = await fetch(base + '/oauth/token', {
        method: 'POST',
        headers: { Authorization: 'Basic ' + basic, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials' }),
      });
      const tj = await t.json();
      if (!tj?.access_token) return res.status(502).json({ error: 'falha token ezze', raw: tj });
      // 2) qrcode
      const r = await fetch(base + '/pix/qrcode', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + tj.access_token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(valor), payerQuestion: 'Recarga plataforma', payer: { name: player.nome || 'Jogador', document: (player.cpf || '').replace(/\D/g, '') } }),
      });
      const data = await r.json();
      if (!data?.transactionId) return res.status(502).json({ error: data?.message || 'falha ezze', raw: data });
      return res.json({ gatewayId: data.transactionId, qrcode: data.emvqrcps, qrcodeImg: data.base64image, status: 'pendente' });
    }

    return res.status(400).json({ error: 'provider desconhecido' });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
