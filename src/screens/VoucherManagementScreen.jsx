import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import Icon from '../components/Icons.jsx';

export default function VoucherManagementScreen({ onBack }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkCodes, setBulkCodes] = useState('');
  const [bulkValue, setBulkValue] = useState(100);
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [msg, setMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('vouchers')
      .select('*, recipient:profiles!vouchers_issued_to_fkey(firstname, lastname, alias_nickname, email)')
      .order('created_at', { ascending: false });
    setVouchers(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleBulkAdd = async () => {
    const codes = bulkCodes.split('\n').map(c => c.trim()).filter(c => c.length > 0);
    if (codes.length === 0) { setMsg({ type: 'err', text: 'No codes entered' }); return; }
    setAdding(true);
    const rows = codes.map(code => ({ code, value: bulkValue, status: 'available' }));
    const { error } = await supabase.from('vouchers').insert(rows);
    if (error) {
      setMsg({ type: 'err', text: error.message });
    } else {
      setMsg({ type: 'ok', text: `${codes.length} voucher${codes.length !== 1 ? 's' : ''} added` });
      setBulkCodes('');
      setShowAdd(false);
      load();
    }
    setAdding(false);
    setTimeout(() => setMsg(null), 4000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this unused voucher?')) return;
    await supabase.from('vouchers').delete().eq('id', id);
    load();
  };

  const pool = {
    available: vouchers.filter(v => v.status === 'available').length,
    issued: vouchers.filter(v => v.status === 'issued').length,
    viewed: vouchers.filter(v => v.status === 'viewed').length,
    total: vouchers.length,
    totalValue: vouchers.reduce((s, v) => s + (v.value || 0), 0),
    issuedValue: vouchers.filter(v => v.status !== 'available').reduce((s, v) => s + (v.value || 0), 0),
  };

  const filtered = filter === 'all' ? vouchers : vouchers.filter(v => v.status === filter);

  const recipientName = (v) => {
    if (!v.recipient) return '—';
    return v.recipient.alias_nickname || v.recipient.firstname || v.recipient.email || '—';
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const statusStyle = (s) => {
    if (s === 'available') return { bg: '#10B98122', color: '#10B981' };
    if (s === 'issued') return { bg: '#F59E0B22', color: '#F59E0B' };
    if (s === 'viewed') return { bg: '#3B82F622', color: '#3B82F6' };
    return { bg: '#33415566', color: '#94A3B8' };
  };

  return (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: 16 }}>

      {/* Title */}
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Voucher Management</div>

      {msg && (
        <div style={{ padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 12, fontWeight: 600, background: msg.type === 'ok' ? '#10B98122' : '#EF444422', color: msg.type === 'ok' ? '#10B981' : '#EF4444' }}>{msg.text}</div>
      )}

      {/* Pool summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 16 }}>
        {[
          { label: 'Available', val: pool.available, color: '#10B981' },
          { label: 'Issued', val: pool.issued, color: '#F59E0B' },
          { label: 'Viewed', val: pool.viewed, color: '#3B82F6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1E293B', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#64748B' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 11, color: '#64748B' }}>
        <span>Total pool: {pool.total} vouchers (R{pool.totalValue.toLocaleString()})</span>
        <span>Issued: R{pool.issuedValue.toLocaleString()}</span>
      </div>

      {/* Add vouchers */}
      <button onClick={() => setShowAdd(!showAdd)} style={{
        width: '100%', padding: 12, borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 12,
        background: '#10B981', color: '#0B0F1A', fontSize: 13, fontWeight: 700,
      }}>
        + Add Vouchers to Pool
      </button>

      {showAdd && (
        <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Bulk add voucher codes</div>
          <div style={{ fontSize: 10, color: '#64748B', marginBottom: 8 }}>Paste one code per line. Codes are stored exactly as entered.</div>
          <textarea
            value={bulkCodes}
            onChange={e => setBulkCodes(e.target.value)}
            placeholder={"TAKE-XXXX-YYYY\nTAKE-XXXX-ZZZZ\nTAKE-XXXX-WWWW"}
            style={{
              width: '100%', minHeight: 100, padding: 10, borderRadius: 8,
              background: '#0B0F1A', border: '1px solid #334155', color: '#F8FAFC',
              fontSize: 12, fontFamily: 'monospace', resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <label style={{ fontSize: 11, color: '#94A3B8' }}>Value each: R</label>
            <input type="number" value={bulkValue} onChange={e => setBulkValue(Number(e.target.value))}
              style={{ width: 60, padding: 6, borderRadius: 6, background: '#0B0F1A', border: '1px solid #334155', color: '#F8FAFC', fontSize: 12, textAlign: 'center' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={handleBulkAdd} disabled={adding} style={{
              flex: 1, padding: 10, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#10B981', color: '#0B0F1A', fontSize: 12, fontWeight: 700,
              opacity: adding ? 0.5 : 1,
            }}>{adding ? 'Adding...' : `Add ${bulkCodes.split('\n').filter(c => c.trim()).length} codes`}</button>
            <button onClick={() => setShowAdd(false)} style={{
              padding: 10, borderRadius: 8, border: '1px solid #334155', background: 'none',
              color: '#94A3B8', fontSize: 12, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['all', 'available', 'issued', 'viewed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 20, border: '1px solid #334155', cursor: 'pointer',
            background: filter === f ? '#F59E0B22' : '#0B0F1A',
            color: filter === f ? '#F59E0B' : '#64748B',
            fontSize: 10, fontWeight: 600, textTransform: 'capitalize',
          }}>{f} {f === 'all' ? `(${pool.total})` : `(${pool[f]})`}</button>
        ))}
      </div>

      {/* Voucher list */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748B', marginTop: 40 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#475569', marginTop: 40, fontSize: 12 }}>No vouchers {filter !== 'all' ? `with status "${filter}"` : 'in pool'}</div>
      ) : (
        filtered.map(v => {
          const st = statusStyle(v.status);
          return (
            <div key={v.id} style={{ background: '#1E293B', borderRadius: 10, padding: 12, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#F8FAFC' }}>{v.code}</span>
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: st.bg, color: st.color, fontWeight: 700 }}>{v.status}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>R{v.value}</span>
              </div>
              {v.status !== 'available' && (
                <div style={{ marginTop: 6, fontSize: 10, color: '#64748B' }}>
                  Issued to: <span style={{ color: '#94A3B8' }}>{recipientName(v)}</span>
                  {' · '}{fmtDate(v.issued_at)}
                  {v.viewed_at && <span style={{ color: '#3B82F6' }}> · Viewed {fmtDate(v.viewed_at)}</span>}
                </div>
              )}
              {v.status === 'available' && (
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => handleDelete(v.id)} style={{
                    fontSize: 10, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600,
                  }}>Delete</button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
