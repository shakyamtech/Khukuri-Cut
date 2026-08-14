import React, { useState, useEffect } from 'react';
import { Star, AtSign, Phone, Edit3, Save, X, Activity } from 'lucide-react';
import {
  getStoredStaff,
  saveStoredStaff,
  STAFF_UPDATED_EVENT,
} from '../../utils/staffStorage';
import type { StaffMember, StaffStatus } from '../../utils/staffStorage';

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
  const [staff, setStaff] = useState<StaffMember[]>(getStoredStaff);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<StaffMember>>({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setStaff(getStoredStaff());
    };
    window.addEventListener(STAFF_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(STAFF_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const startEdit = (member: StaffMember) => {
    setEditing(member.id);
    setEditData({ ...member });
  };

  const saveEdit = (id: string) => {
    const updated = staff.map((s) => (s.id === id ? ({ ...s, ...editData } as StaffMember) : s));
    setStaff(updated);
    saveStoredStaff(updated);
    setEditing(null);
    showToast('Staff info updated & synced live!');
  };

  const setBarberStatus = (id: string, status: StaffStatus) => {
    const defaultNotes: Record<StaffStatus, string> = {
      available: 'Ready for Walk-in',
      busy: 'In Session',
      off: 'On Break',
    };
    const updated = staff.map((s) =>
      s.id === id ? { ...s, status, statusNote: s.statusNote || defaultNotes[status] } : s
    );
    setStaff(updated);
    saveStoredStaff(updated);
    showToast(`Status updated to ${status.toUpperCase()} for ${staff.find((s) => s.id === id)?.name}!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && (
        <div style={toastStyle}>
          <Activity size={14} />
          {toast}
        </div>
      )}

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Staff', val: staff.length, color: '#d5a353' },
          { label: 'Available Now 🟢', val: staff.filter((s) => s.status === 'available').length, color: '#22c55e' },
          { label: 'In Session 🔴', val: staff.filter((s) => s.status === 'busy').length, color: '#ef4444' },
          { label: 'On Break 🟡', val: staff.filter((s) => s.status === 'off').length, color: '#eab308' },
        ].map(({ label, val, color }) => (
          <div key={label} style={summaryCard}>
            <div style={{ color: '#8a7a6a', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ color, fontSize: '1.8rem', fontWeight: 800 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Staff Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {staff.map((member) => {
          const isEditing = editing === member.id;
          const data = isEditing ? editData : member;

          return (
            <div key={member.id} style={staffCard}>
              {/* Avatar + name */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ ...avatar, background: `linear-gradient(135deg, ${member.color}, ${member.color}aa)` }}>
                  {member.initials || member.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <input
                      style={editInput}
                      value={data.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    <div style={{ color: '#f9f6f2', fontWeight: 700, fontSize: '1.05rem', marginBottom: 3 }}>{member.name}</div>
                  )}
                  {isEditing ? (
                    <input
                      style={{ ...editInput, marginTop: 6 }}
                      value={data.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      placeholder="Role"
                    />
                  ) : (
                    <div style={{ color: member.color, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>{member.role}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(member.id)} style={{ ...iconBtn, color: '#22c55e' }}>
                        <Save size={14} />
                      </button>
                      <button onClick={() => setEditing(null)} style={{ ...iconBtn, color: '#ef4444' }}>
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(member)} style={iconBtn}>
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <StarRating rating={member.rating || 4.9} />
                <span style={{ color: '#4a3a2a' }}>·</span>
                <span style={{ color: '#8a7a6a', fontSize: '0.78rem' }}>{(member.totalCuts || 1000).toLocaleString()} cuts</span>
                <span style={{ color: '#4a3a2a' }}>·</span>
                <span style={{ color: '#8a7a6a', fontSize: '0.78rem' }}>{member.experience}</span>
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
                <div style={{ color: '#a89a8a', fontSize: '0.82rem', marginBottom: '12px' }}>
                  🎯 {member.specialty}
                </div>
              )}

              {/* Contact */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div style={contactPill}>
                  <Phone size={11} color="#8a7a6a" />
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
                  <AtSign size={11} color="#8a7a6a" />
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

              {/* Status Note input if editing */}
              {isEditing && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.72rem', color: '#8a7a6a', display: 'block', marginBottom: '4px' }}>
                    Status Note (Optional):
                  </label>
                  <input
                    style={editInput}
                    value={data.statusNote || ''}
                    onChange={(e) => setEditData({ ...editData, statusNote: e.target.value })}
                    placeholder="e.g. Back at 3:30 PM"
                  />
                </div>
              )}

              {/* 3-Way Live Status Control */}
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.72rem', color: '#8a7a6a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
                  Live Status Control (Syncs to Home Page):
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setBarberStatus(member.id, 'available')}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: member.status === 'available' ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.08)',
                      background: member.status === 'available' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
                      color: member.status === 'available' ? '#22c55e' : '#8a7a6a',
                      transition: 'all 0.2s',
                    }}
                  >
                    🟢 Available
                  </button>
                  <button
                    onClick={() => setBarberStatus(member.id, 'busy')}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: member.status === 'busy' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                      background: member.status === 'busy' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)',
                      color: member.status === 'busy' ? '#ef4444' : '#8a7a6a',
                      transition: 'all 0.2s',
                    }}
                  >
                    🔴 In Session
                  </button>
                  <button
                    onClick={() => setBarberStatus(member.id, 'off')}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: member.status === 'off' ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.08)',
                      background: member.status === 'off' ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.03)',
                      color: member.status === 'off' ? '#eab308' : '#8a7a6a',
                      transition: 'all 0.2s',
                    }}
                  >
                    🟡 On Break
                  </button>
                </div>
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
