import React, { useState } from 'react';
import { Star, AtSign, Phone, Edit3, Save, X } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialty: string;
  phone: string;
  instagram: string;
  rating: number;
  totalCuts: number;
  available: boolean;
  initials: string;
  color: string;
}

const STAFF_DATA: StaffMember[] = [
  { id: 'st1', name: 'Rajan Tamang', role: 'Head Barber', experience: '12 years', specialty: 'Classic Fades & Pompadour', phone: '9841111001', instagram: '@rajan_cuts', rating: 4.9, totalCuts: 3200, available: true, initials: 'RT', color: '#d5a353' },
  { id: 'st2', name: 'Bikash Gurung', role: 'Senior Barber', experience: '8 years', specialty: 'Hot Towel Shaving', phone: '9841111002', instagram: '@bikash_barber', rating: 4.8, totalCuts: 2100, available: true, initials: 'BG', color: '#3b82f6' },
  { id: 'st3', name: 'Dipak Magar', role: 'Barber & Tattoo Artist', experience: '6 years', specialty: 'Custom Tattoo & Styling', phone: '9841111003', instagram: '@dipak_ink', rating: 4.9, totalCuts: 1500, available: true, initials: 'DM', color: '#a855f7' },
  { id: 'st4', name: 'Sushil Rai', role: 'Junior Barber', experience: '3 years', specialty: 'Beard Sculpting', phone: '9841111004', instagram: '@sushil_barber', rating: 4.7, totalCuts: 850, available: false, initials: 'SR', color: '#22c55e' },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={12}
        fill={i <= Math.round(rating) ? '#d5a353' : 'transparent'}
        color={i <= Math.round(rating) ? '#d5a353' : '#4a3a2a'}
      />
    ))}
    <span style={{ color: '#d5a353', fontSize: '0.78rem', fontWeight: 700, marginLeft: 4 }}>{rating}</span>
  </div>
);

export const AdminStaff: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>(STAFF_DATA);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<StaffMember>>({});
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const startEdit = (member: StaffMember) => {
    setEditing(member.id);
    setEditData({ ...member });
  };

  const saveEdit = (id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...editData } : s)));
    setEditing(null);
    showToast('Staff info updated!');
  };

  const toggleAvail = (id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, available: !s.available } : s)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && <div style={toastStyle}><Save size={14} />{toast}</div>}

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Staff', val: staff.length, color: '#d5a353' },
          { label: 'Available Today', val: staff.filter((s) => s.available).length, color: '#22c55e' },
          { label: 'On Leave', val: staff.filter((s) => !s.available).length, color: '#ef4444' },
          { label: 'Total Cuts Done', val: staff.reduce((sum, s) => sum + s.totalCuts, 0).toLocaleString(), color: '#3b82f6' },
        ].map(({ label, val, color }) => (
          <div key={label} style={summaryCard}>
            <div style={{ color: '#5a4a3a', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
            <div style={{ color, fontSize: '1.8rem', fontWeight: 800 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Staff Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {staff.map((member) => {
          const isEditing = editing === member.id;
          const data = isEditing ? editData : member;

          return (
            <div key={member.id} style={{ ...staffCard, opacity: member.available ? 1 : 0.65 }}>
              {/* Avatar + name */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ ...avatar, background: `linear-gradient(135deg, ${member.color}, ${member.color}aa)` }}>
                  {member.initials}
                </div>
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <input
                      style={editInput}
                      value={data.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    <div style={{ color: '#f9f6f2', fontWeight: 700, fontSize: '1rem', marginBottom: 3 }}>{member.name}</div>
                  )}
                  {isEditing ? (
                    <input
                      style={{ ...editInput, marginTop: 6 }}
                      value={data.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      placeholder="Role"
                    />
                  ) : (
                    <div style={{ color: member.color, fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.05em' }}>{member.role}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(member.id)} style={{ ...iconBtn, color: '#22c55e' }}><Save size={14} /></button>
                      <button onClick={() => setEditing(null)} style={{ ...iconBtn, color: '#ef4444' }}><X size={14} /></button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(member)} style={iconBtn}><Edit3 size={14} /></button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <StarRating rating={member.rating} />
                <span style={{ color: '#4a3a2a' }}>·</span>
                <span style={{ color: '#6a5a4a', fontSize: '0.78rem' }}>{member.totalCuts.toLocaleString()} cuts</span>
                <span style={{ color: '#4a3a2a' }}>·</span>
                <span style={{ color: '#6a5a4a', fontSize: '0.78rem' }}>{member.experience}</span>
              </div>

              {/* Specialty */}
              {isEditing ? (
                <input
                  style={{ ...editInput, marginBottom: 10 }}
                  value={data.specialty}
                  onChange={(e) => setEditData({ ...editData, specialty: e.target.value })}
                  placeholder="Specialty"
                />
              ) : (
                <div style={{ color: '#8a7a6a', fontSize: '0.8rem', marginBottom: '12px' }}>
                  🎯 {member.specialty}
                </div>
              )}

              {/* Contact */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div style={contactPill}>
                  <Phone size={11} color="#6a5a4a" />
                  {isEditing ? (
                    <input
                      style={{ ...editInput, padding: '2px 4px', width: 100, fontSize: '0.72rem' }}
                      value={data.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  ) : (
                    <span>{member.phone}</span>
                  )}
                </div>
                <div style={contactPill}>
                  <AtSign size={11} color="#6a5a4a" />
                  {isEditing ? (
                    <input
                      style={{ ...editInput, padding: '2px 4px', width: 90, fontSize: '0.72rem' }}
                      value={data.instagram}
                      onChange={(e) => setEditData({ ...editData, instagram: e.target.value })}
                    />
                  ) : (
                    <span>{member.instagram}</span>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: member.available ? '#22c55e' : '#ef4444',
                }}>
                  {member.available ? '● Available Today' : '○ On Leave'}
                </span>
                <button
                  onClick={() => toggleAvail(member.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${member.available ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                    background: `${member.available ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)'}`,
                    color: member.available ? '#ef4444' : '#22c55e',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {member.available ? 'Mark Leave' : 'Mark Available'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const staffCard: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(28,22,18,0.95), rgba(22,18,15,0.98))',
  border: '1px solid rgba(213,163,83,0.12)',
  borderRadius: '16px',
  padding: '22px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'opacity 0.2s',
};

const avatar: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 800,
  fontSize: '1rem',
  flexShrink: 0,
  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
};

const summaryCard: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(28,22,18,0.95), rgba(22,18,15,0.98))',
  border: '1px solid rgba(213,163,83,0.12)',
  borderRadius: '14px',
  padding: '18px 22px',
  flex: 1,
  minWidth: 130,
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

const contactPill: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '4px 10px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '20px',
  color: '#6a5a4a',
  fontSize: '0.72rem',
};

const editInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(213,163,83,0.2)',
  borderRadius: '7px',
  color: '#f9f6f2',
  padding: '6px 10px',
  fontSize: '0.82rem',
  fontFamily: "'Outfit', sans-serif",
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const toastStyle: React.CSSProperties = {
  position: 'fixed', bottom: 28, right: 28,
  background: 'rgba(22,34,22,0.95)', border: '1px solid rgba(34,197,94,0.3)',
  color: '#22c55e', padding: '12px 20px', borderRadius: '12px',
  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem',
  fontWeight: 600, backdropFilter: 'blur(10px)', zIndex: 999,
};
