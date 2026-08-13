import React, { useState } from 'react';
import { Scissors, Plus, Edit3, Save, X, DollarSign } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  available: boolean;
}

const INITIAL_SERVICES: ServiceItem[] = [
  { id: 's1', title: 'HAIRCUTTING', price: 800, duration: '45 min', description: 'Precision scissor work and fade styling tailored to your scalp shape.', available: true },
  { id: 's2', title: 'HOT TOWEL SHAVING', price: 500, duration: '30 min', description: 'Traditional hot towel straight razor shave with eucalyptus oils.', available: true },
  { id: 's3', title: 'HAIRCUT + SHAVE COMBO', price: 1200, duration: '75 min', description: 'Our best value combo — premium haircut and hot towel shave.', available: true },
  { id: 's4', title: 'STYLING & POMPADOUR', price: 600, duration: '30 min', description: 'Signature blow-dry, pompadour sculpting, and texturizing.', available: true },
  { id: 's5', title: 'BEARD TRIM & SCULPT', price: 350, duration: '20 min', description: 'Expert beard shaping, mustache contouring, and neck line cleaning.', available: true },
  { id: 's6', title: 'CUSTOM TATTOO CONSULTATION', price: 2000, duration: '60 min', description: 'Sit with our tattoo artist to design your custom ink.', available: false },
];

const EMPTY_SERVICE: Omit<ServiceItem, 'id'> = { title: '', price: 0, duration: '', description: '', available: true };

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<ServiceItem, 'id'>>(EMPTY_SERVICE);
  const [adding, setAdding] = useState(false);
  const [newData, setNewData] = useState<Omit<ServiceItem, 'id'>>(EMPTY_SERVICE);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const startEdit = (svc: ServiceItem) => {
    setEditing(svc.id);
    setEditData({ title: svc.title, price: svc.price, duration: svc.duration, description: svc.description, available: svc.available });
  };

  const saveEdit = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...editData } : s)));
    setEditing(null);
    showToast('Service updated!');
  };

  const addService = () => {
    if (!newData.title) return;
    const newSvc: ServiceItem = { ...newData, id: `s${Date.now()}` };
    setServices((prev) => [...prev, newSvc]);
    setAdding(false);
    setNewData(EMPTY_SERVICE);
    showToast('New service added!');
  };

  const toggleAvailability = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, available: !s.available } : s)));
  };

  const totalRevenuePotential = services.filter((s) => s.available).reduce((sum, s) => sum + s.price, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && <div style={toastStyle}><Save size={14} />{toast}</div>}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ color: '#f9f6f2', fontSize: '1rem', fontWeight: 600 }}>Manage Services</div>
          <div style={{ color: '#6a5a4a', fontSize: '0.8rem', marginTop: 4 }}>
            {services.filter((s) => s.available).length} active services · Max revenue per client: Rs {totalRevenuePotential.toLocaleString()}
          </div>
        </div>
        <button onClick={() => { setAdding(true); setNewData(EMPTY_SERVICE); }} style={addBtn}>
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {/* Add Service Form */}
      {adding && (
        <div style={formPanel}>
          <div style={{ color: '#d5a353', fontSize: '0.78rem', letterSpacing: '0.12em', marginBottom: 16 }}>NEW SERVICE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            <InputField label="Title" value={newData.title} onChange={(v) => setNewData({ ...newData, title: v })} />
            <InputField label="Price (Rs)" type="number" value={String(newData.price)} onChange={(v) => setNewData({ ...newData, price: Number(v) })} />
            <InputField label="Duration" value={newData.duration} onChange={(v) => setNewData({ ...newData, duration: v })} placeholder="e.g. 30 min" />
            <InputField label="Description" value={newData.description} onChange={(v) => setNewData({ ...newData, description: v })} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={addService} style={saveBtn}><Save size={14} />Save</button>
            <button onClick={() => setAdding(false)} style={cancelBtn}><X size={14} />Cancel</button>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {services.map((svc) => {
          const isEditing = editing === svc.id;
          return (
            <div key={svc.id} style={{ ...serviceCard, opacity: svc.available ? 1 : 0.55 }}>
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={iconBadge}>
                    <Scissors size={14} color="#191514" />
                  </div>
                  {isEditing ? (
                    <input
                      style={editInput}
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    />
                  ) : (
                    <span style={{ color: '#d5a353', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.08em' }}>{svc.title}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(svc.id)} style={{ ...iconBtn, color: '#22c55e' }}><Save size={14} /></button>
                      <button onClick={() => setEditing(null)} style={{ ...iconBtn, color: '#ef4444' }}><X size={14} /></button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(svc)} style={iconBtn}><Edit3 size={14} /></button>
                  )}
                </div>
              </div>

              {/* Price & Duration */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <DollarSign size={13} color="#d5a353" />
                  {isEditing ? (
                    <input
                      type="number"
                      style={{ ...editInput, width: 80 }}
                      value={editData.price}
                      onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                    />
                  ) : (
                    <span style={{ color: '#d5a353', fontWeight: 700 }}>Rs {svc.price.toLocaleString()}</span>
                  )}
                </div>
                <span style={{ color: '#4a3a2a' }}>·</span>
                {isEditing ? (
                  <input
                    style={{ ...editInput, width: 80 }}
                    value={editData.duration}
                    onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                    placeholder="e.g. 30 min"
                  />
                ) : (
                  <span style={{ color: '#6a5a4a', fontSize: '0.8rem' }}>{svc.duration}</span>
                )}
              </div>

              {/* Description */}
              {isEditing ? (
                <textarea
                  style={{ ...editInput, width: '100%', height: 60, resize: 'vertical' as const }}
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              ) : (
                <p style={{ color: '#8a7a6a', fontSize: '0.8rem', lineHeight: 1.6, margin: '0 0 14px' }}>{svc.description}</p>
              )}

              {/* Availability toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ color: svc.available ? '#22c55e' : '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                  {svc.available ? '● Active' : '○ Inactive'}
                </span>
                <button
                  onClick={() => toggleAvailability(svc.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${svc.available ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                    background: `${svc.available ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)'}`,
                    color: svc.available ? '#ef4444' : '#22c55e',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {svc.available ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label style={{ color: '#5a4a3a', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={editInput}
    />
  </div>
);

const serviceCard: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(28,22,18,0.95), rgba(22,18,15,0.98))',
  border: '1px solid rgba(213,163,83,0.12)',
  borderRadius: '14px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'border-color 0.2s',
};

const iconBadge: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #d5a353, #c4893f)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '7px',
  color: '#8a7a6a',
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const editInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(213,163,83,0.2)',
  borderRadius: '8px',
  color: '#f9f6f2',
  padding: '8px 12px',
  fontSize: '0.85rem',
  fontFamily: "'Outfit', sans-serif",
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const addBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 18px',
  background: 'linear-gradient(135deg, #d5a353, #c4893f)',
  color: '#191514',
  border: 'none',
  borderRadius: '10px',
  fontSize: '0.85rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
  boxShadow: '0 4px 16px rgba(213,163,83,0.25)',
};

const formPanel: React.CSSProperties = {
  background: 'rgba(213,163,83,0.05)',
  border: '1px solid rgba(213,163,83,0.2)',
  borderRadius: '14px',
  padding: '20px',
};

const saveBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
  color: '#22c55e', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem',
  fontWeight: 600, fontFamily: "'Outfit', sans-serif",
};

const cancelBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
  color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem',
  fontWeight: 600, fontFamily: "'Outfit', sans-serif",
};

const toastStyle: React.CSSProperties = {
  position: 'fixed', bottom: 28, right: 28,
  background: 'rgba(22,34,22,0.95)', border: '1px solid rgba(34,197,94,0.3)',
  color: '#22c55e', padding: '12px 20px', borderRadius: '12px',
  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem',
  fontWeight: 600, backdropFilter: 'blur(10px)', zIndex: 999,
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
};
