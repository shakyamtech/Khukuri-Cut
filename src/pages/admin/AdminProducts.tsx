import React, { useState } from 'react';
import { ShoppingBag, Plus, Edit3, Save, X, Tag, TrendingUp, Package } from 'lucide-react';
import type { ProductItem } from '../../components/Shop';

const INITIAL_PRODUCTS: (ProductItem & { stock: number; category: string })[] = [
  { id: 'razor-1', title: 'Master Tech Extra Sharp Razor', price: 4500, image: '/images/product_razor.png', stock: 12, category: 'Razors' },
  { id: 'brush-1', title: 'Faux Feather Light Shave Brush', price: 2200, image: '/images/product_brush.png', stock: 8, category: 'Brushes' },
  { id: 'pomade-1', title: 'Deluxe Hair Styling Pomade', price: 1800, originalPrice: 2100, image: '/images/product_pomade.png', isSale: true, stock: 25, category: 'Styling' },
  { id: 'comb-1', title: 'Big Red Wooden Beard Comb', price: 850, image: '/images/product_brush.png', stock: 30, category: 'Combs' },
];

type Product = typeof INITIAL_PRODUCTS[0];
const EMPTY_PRODUCT: Omit<Product, 'id'> = { title: '', price: 0, image: '', stock: 0, category: 'Styling', isSale: false };

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [adding, setAdding] = useState(false);
  const [newData, setNewData] = useState<Omit<Product, 'id'>>(EMPTY_PRODUCT);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const startEdit = (p: Product) => { setEditing(p.id); setEditData({ ...p }); };
  const saveEdit = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...editData } as Product : p)));
    setEditing(null);
    showToast('Product updated!');
  };
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed.');
  };
  const addProduct = () => {
    if (!newData.title) return;
    setProducts((prev) => [...prev, { ...newData, id: `prod-${Date.now()}` }]);
    setAdding(false);
    setNewData(EMPTY_PRODUCT);
    showToast('Product added!');
  };

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && <div style={toastStyle}><Save size={14} />{toast}</div>}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Products', val: products.length, icon: ShoppingBag, color: '#d5a353' },
          { label: 'Total Items in Stock', val: totalItems, icon: Package, color: '#3b82f6' },
          { label: 'Inventory Value', val: `Rs ${totalValue.toLocaleString()}`, icon: TrendingUp, color: '#22c55e' },
          { label: 'On Sale', val: products.filter((p) => p.isSale).length, icon: Tag, color: '#f59e0b' },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} style={statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#5a4a3a', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                <div style={{ color, fontSize: '1.6rem', fontWeight: 800 }}>{val}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header + Add */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#8a7a6a', fontSize: '0.85rem' }}>{products.length} products</div>
        <button onClick={() => { setAdding(true); setNewData(EMPTY_PRODUCT); }} style={addBtn}>
          <Plus size={16} />Add Product
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <div style={formPanel}>
          <div style={{ color: '#d5a353', fontSize: '0.75rem', letterSpacing: '0.12em', marginBottom: 14 }}>NEW PRODUCT</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'Title', key: 'title' as const, type: 'text' },
              { label: 'Price (Rs)', key: 'price' as const, type: 'number' },
              { label: 'Original Price (optional)', key: 'originalPrice' as const, type: 'number' },
              { label: 'Stock Qty', key: 'stock' as const, type: 'number' },
              { label: 'Category', key: 'category' as const, type: 'text' },
              { label: 'Image URL', key: 'image' as const, type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  type={type}
                  style={editInput}
                  value={String((newData as Record<string, unknown>)[key] ?? '')}
                  onChange={(e) => setNewData({ ...newData, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                />
              </div>
            ))}
          </div>
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!newData.isSale} onChange={(e) => setNewData({ ...newData, isSale: e.target.checked })} />
            <span>Mark as Sale</span>
          </label>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={addProduct} style={saveBtn}><Save size={14} />Save</button>
            <button onClick={() => setAdding(false)} style={cancelBtn}><X size={14} />Cancel</button>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div style={panelStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Sale', 'Actions'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => {
                const isEdit = editing === prod.id;
                const d = isEdit ? editData : prod;
                return (
                  <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={imgBox}>
                          <img src={prod.image} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                        {isEdit ? (
                          <input style={{ ...editInput, maxWidth: 200 }} value={String(d.title ?? '')} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                        ) : (
                          <span style={{ color: '#f9f6f2', fontWeight: 600, fontSize: '0.85rem' }}>{prod.title}</span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {isEdit ? (
                        <input style={{ ...editInput, maxWidth: 100 }} value={String(d.category ?? '')} onChange={(e) => setEditData({ ...editData, category: e.target.value })} />
                      ) : (
                        <span style={{ color: '#8a7a6a', fontSize: '0.8rem' }}>{prod.category}</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {isEdit ? (
                        <input type="number" style={{ ...editInput, maxWidth: 90 }} value={String(d.price ?? 0)} onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })} />
                      ) : (
                        <span style={{ color: '#d5a353', fontWeight: 700, fontSize: '0.88rem' }}>Rs {prod.price.toLocaleString()}</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {isEdit ? (
                        <input type="number" style={{ ...editInput, maxWidth: 70 }} value={String(d.stock ?? 0)} onChange={(e) => setEditData({ ...editData, stock: Number(e.target.value) })} />
                      ) : (
                        <span style={{ color: (prod.stock ?? 0) < 5 ? '#ef4444' : '#22c55e', fontWeight: 600, fontSize: '0.88rem' }}>
                          {prod.stock}
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {isEdit ? (
                        <input type="checkbox" checked={!!d.isSale} onChange={(e) => setEditData({ ...editData, isSale: e.target.checked })} />
                      ) : (
                        prod.isSale ? (
                          <span style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>SALE</span>
                        ) : (
                          <span style={{ color: '#4a3a2a', fontSize: '0.78rem' }}>—</span>
                        )
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {isEdit ? (
                          <>
                            <button onClick={() => saveEdit(prod.id)} style={{ ...iconBtn, color: '#22c55e' }}><Save size={14} /></button>
                            <button onClick={() => setEditing(null)} style={{ ...iconBtn, color: '#8a7a6a' }}><X size={14} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(prod)} style={iconBtn}><Edit3 size={14} /></button>
                            <button onClick={() => deleteProduct(prod.id)} style={{ ...iconBtn, color: '#ef4444' }}>
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const statCard: React.CSSProperties = { background: 'linear-gradient(145deg, rgba(28,22,18,0.95), rgba(22,18,15,0.98))', border: '1px solid rgba(213,163,83,0.12)', borderRadius: '14px', padding: '18px 20px', flex: 1, minWidth: 140 };
const panelStyle: React.CSSProperties = { background: 'linear-gradient(145deg, rgba(28,22,18,0.95), rgba(22,18,15,0.98))', border: '1px solid rgba(213,163,83,0.12)', borderRadius: '16px', padding: '20px' };
const formPanel: React.CSSProperties = { background: 'rgba(213,163,83,0.05)', border: '1px solid rgba(213,163,83,0.2)', borderRadius: '14px', padding: '20px' };
const thStyle: React.CSSProperties = { color: '#5a4a3a', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid rgba(213,163,83,0.1)' };
const tdStyle: React.CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' };
const editInput: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(213,163,83,0.2)', borderRadius: '7px', color: '#f9f6f2', padding: '7px 10px', fontSize: '0.82rem', fontFamily: "'Outfit', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' };
const iconBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#8a7a6a', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const addBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, #d5a353, #c4893f)', color: '#191514', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" };
const saveBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Outfit', sans-serif" };
const cancelBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Outfit', sans-serif" };
const toastStyle: React.CSSProperties = { position: 'fixed', bottom: 28, right: 28, background: 'rgba(22,34,22,0.95)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600, backdropFilter: 'blur(10px)', zIndex: 999 };
const labelStyle: React.CSSProperties = { color: '#5a4a3a', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 5 };
const imgBox: React.CSSProperties = { width: 40, height: 40, borderRadius: '8px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };
