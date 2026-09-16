// Vercel Serverless — webhook do gateway (confirma pagamento e credita)
// Rota: POST /api/gateway-webhook
// Cadastra essa URL no painel do gateway (SuitPay/Ezze) como callback.
// Ele marca platform_transactions.status='pago' e soma saldo em platform_players.
// Precisa de SUPABASE_URL + SUPABASE_SERVICE_KEY nas env da Vercel (service key, NÃO a publishable).
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const body = req.body || {};
    // SuitPay manda idTransaction + status PAID_OUT; Ezze manda transactionId + APPROVED. Aceita os dois:
    const gwId = body.idTransaction || body.transactionId || body.id || null;
    const status = body.status || body.transactionStatus || '';
    const paid = ['PAID_OUT', 'APPROVED', 'paid', 'pago', 'PAID'].includes(status);
    if (!gwId) return res.status(400).json({ error: 'sem id da transação' });
    const { data: tx } = await supa.from('platform_transactions').select('*').or(`gateway_id.eq.${gwId},transacao_id.eq.${gwId}`).limit(1).maybeSingle();
    // fallback: procura por código pix também
    let row = tx;
    if (!row && body.code) {
      const r = await supa.from('platform_transactions').select('*').eq('pix_copia_cola', body.code).limit(1).maybeSingle();
      row = r.data;
    }
    if (!row) return res.status(404).json({ error: 'transação não encontrada' });
    if (paid) {
      await supa.from('platform_transactions').update({ status: 'pago' }).eq('id', row.id);
      if (row.tipo === 'deposito' && row.player_id) {
        const { data: pl } = await supa.from('platform_players').select('*').eq('id', row.player_id).single();
        if (pl) await supa.from('platform_players').update({ saldo: Number(pl.saldo || 0) + Number(row.valor || 0) }).eq('id', row.player_id);
      }
    } else {
      await supa.from('platform_transactions').update({ status: 'processamento' }).eq('id', row.id);
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
