import React, { useState, useEffect } from 'react';
import { Star, AtSign, Phone, Edit3, Save, X, Activity, UserPlus, Trash2 } from 'lucide-react';
import {
  getStoredStaff,
  saveStoredStaff,
  STAFF_UPDATED_EVENT,
} from '../../utils/staffStorage';
import type { StaffMember, StaffStatus } from '../../utils/staffStorage';

const PRESET_AVATARS = [
  '/images/barber_1.png',
  '/images/barber_2.png',
  '/images/barber_3.png',
  '/images/about_promo.png',
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

const DEFAULT_NEW_BARBER: Partial<StaffMember> = {
  name: '',
  role: 'Master Barber & Stylist',
  image: '/images/barber_1.png',
  experience: '5+ Years Experience',
  specialty: 'Precision Fades & Scissor Styling',
  bio: 'Experienced Nepali master barber passionate about delivering luxury grooming services.',
  status: 'available',
  statusNote: 'Ready for Walk-in',
  phone: '9841111000',
  instagram: '@barber_cuts',
  rating: 4.9,
  totalCuts: 100,
  color: '#d5a353',
};

export const AdminStaff: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>(getStoredStaff);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<StaffMember>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState<Partial<StaffMember>>(DEFAULT_NEW_BARBER);
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

  const handleDeleteStaff = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from staff list?`)) {
      const updated = staff.filter((s) => s.id !== id);
      setStaff(updated);
      saveStoredStaff(updated);
      showToast(`${name} removed from staff list.`);
    }
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) {
      alert('Please fill out Name and Role.');
      return;
    }

    const id = `barber-${Date.now()}`;
    const initials = newMember.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const created: StaffMember = {
      id,
      name: newMember.name,
      role: newMember.role || 'Master Barber',
      image: newMember.image || '/images/barber_1.png',
      experience: newMember.experience || '5 Years Experience',
      specialty: newMember.specialty || 'Scissor Cuts & Styling',
      bio: newMember.bio || 'Master barber at Khukuri Cut Kathmandu.',
      status: (newMember.status as StaffStatus) || 'available',
      statusNote: newMember.statusNote || 'Ready for Walk-in',
      phone: newMember.phone || '9841000000',
      instagram: newMember.instagram || '@barber',
      rating: newMember.rating || 4.9,
      totalCuts: newMember.totalCuts || 100,
      color: newMember.color || '#d5a353',
      initials,
    };

    const updated = [...staff, created];
    setStaff(updated);
    saveStoredStaff(updated);
    setShowAddModal(false);
    setNewMember(DEFAULT_NEW_BARBER);
    showToast(`New Barber ${created.name} added successfully! 🎉`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && (
        <div style={toastStyle}>
          <Activity size={14} />
          {toast}
        </div>
      )}

      {/* Header Bar with Summary & Add Staff Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', flex: 1 }}>
          {[
            { label: 'Total Staff', val: staff.length, color: '#d5a353' },
            { label: 'Available Now 🟢', val: staff.filter((s) => s.status === 'available').length, color: '#22c55e' },
            { label: 'In Session 🔴', val: staff.filter((s) => s.status === 'busy').length, color: '#ef4444' },
            { label: 'On Break 🟡', val: staff.filter((s) => s.status === 'off').length, color: '#eab308' },
          ].map(({ label, val, color }) => (
            <div key={label} style={summaryCard}>
              <div style={{ color: '#8a7a6a', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ color, fontSize: '1.6rem', fontWeight: 800 }}>{val}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={addBtnStyle}
        >
          <UserPlus size={18} />
          <span>+ ADD NEW BARBER</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {staff.map((member) => {
          const isEditing = editing === member.id;
          const data = isEditing ? editData : member;

          return (
            <div key={member.id} style={staffCard}>
              {/* Avatar + name */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                  <img
                    src={member.image}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: '2px solid #d5a353' }}
                  />
                  <span
                    style={{
                      position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%',
                      background: member.status === 'available' ? '#22c55e' : member.status === 'busy' ? '#ef4444' : '#eab308',
                      border: '2px solid #161210',
                    }}
                  />
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
                    <div style={{ color: '#d5a353', fontSize: '0.8rem', fontWeight: 500 }}>{member.role}</div>
                  )}
                  <div style={{ marginTop: 6 }}>
                    <StarRating rating={member.rating} />
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {isEditing ? (
                    <>
                      <button style={{ ...iconBtn, background: '#d5a353', color: '#191514' }} onClick={() => saveEdit(member.id)}>
                        <Save size={14} />
                      </button>
                      <button style={iconBtn} onClick={() => setEditing(null)}>
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button style={iconBtn} onClick={() => startEdit(member)} title="Edit Barber Details">
                        <Edit3 size={14} />
                      </button>
                      <button style={{ ...iconBtn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => handleDeleteStaff(member.id, member.name)} title="Remove Staff">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Experience & Specialty */}
              <div style={{ fontSize: '0.78rem', color: '#6a5a4a', marginBottom: '10px' }}>
                <span style={{ color: '#a89a8a', fontWeight: 600 }}>{member.experience}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#d8cfc4', marginBottom: '14px', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                📍 {member.specialty}
              </div>

              {/* Contact info */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={contactPill}>
                  <Phone size={11} color="#d5a353" />
                  <span>{member.phone}</span>
                </div>
                <div style={contactPill}>
                  <AtSign size={11} color="#d5a353" />
                  <span>{member.instagram}</span>
                </div>
              </div>

              {/* Live Status Controls */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#6a5a4a', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                  Live Status Control (Syncs to Home Page):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() => setBarberStatus(member.id, 'available')}
                    style={{
                      ...statusBtn,
                      background: member.status === 'available' ? '#22c55e' : 'rgba(34,197,94,0.08)',
                      color: member.status === 'available' ? '#120e0d' : '#22c55e',
                      border: '1px solid #22c55e',
                      fontWeight: member.status === 'available' ? 800 : 600,
                    }}
                  >
                    🟢 Available
                  </button>
                  <button
                    onClick={() => setBarberStatus(member.id, 'busy')}
                    style={{
                      ...statusBtn,
                      background: member.status === 'busy' ? '#ef4444' : 'rgba(239,68,68,0.08)',
                      color: member.status === 'busy' ? '#ffffff' : '#ef4444',
                      border: '1px solid #ef4444',
                      fontWeight: member.status === 'busy' ? 800 : 600,
                    }}
                  >
                    🔴 In Session
                  </button>
                  <button
                    onClick={() => setBarberStatus(member.id, 'off')}
                    style={{
                      ...statusBtn,
                      background: member.status === 'off' ? '#eab308' : 'rgba(234,179,8,0.08)',
                      color: member.status === 'off' ? '#120e0d' : '#eab308',
                      border: '1px solid #eab308',
                      fontWeight: member.status === 'off' ? 800 : 600,
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

      {/* ====== ADD NEW BARBER MODAL ====== */}
      {showAddModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.85)', backdropFilter: 'blur(8px)', zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{ background: 'linear-gradient(145deg, #1c1612, #161210)', border: '1.5px solid #d5a353', borderRadius: '18px', width: '100%', maxWidth: '540px', position: 'relative', boxShadow: '0 25px 70px rgba(0,0,0,0.8)', overflow: 'hidden', animation: 'fadeSlideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #d5a353, #c4893f, #d5a353)' }} />
            
            <div style={{ padding: '24px 28px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserPlus size={20} color="#d5a353" />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d5a353', letterSpacing: '0.05em' }}>ADD NEW MASTER BARBER</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#8a7a6a', borderRadius: '6px', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Barber Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kiran Thapa"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      style={formInputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Role Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master Stylist & Fade Specialist"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      style={formInputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Years of Experience</label>
                    <input
                      type="text"
                      placeholder="e.g. 6+ Years Experience"
                      value={newMember.experience}
                      onChange={(e) => setNewMember({ ...newMember, experience: e.target.value })}
                      style={formInputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Specialty</label>
                    <input
                      type="text"
                      placeholder="e.g. Razor Shaving & Pompadours"
                      value={newMember.specialty}
                      onChange={(e) => setNewMember({ ...newMember, specialty: e.target.value })}
                      style={formInputStyle}
                    />
                  </div>
                </div>

                {/* Profile Photo Image Selector */}
                <div>
                  <label style={labelStyle}>Profile Photo Image URL</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. /images/barber_1.png or custom image URL"
                      value={newMember.image}
                      onChange={(e) => setNewMember({ ...newMember, image: e.target.value })}
                      style={formInputStyle}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8a7a6a', marginBottom: '6px' }}>Or pick a preset photo:</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {PRESET_AVATARS.map((url) => (
                      <div
                        key={url}
                        onClick={() => setNewMember({ ...newMember, image: url })}
                        style={{
                          width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer',
                          border: newMember.image === url ? '2px solid #d5a353' : '1px solid rgba(255,255,255,0.1)',
                          boxShadow: newMember.image === url ? '0 0 10px rgba(213,163,83,0.4)' : 'none',
                        }}
                      >
                        <img src={url} alt="Preset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9841111004"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                      style={formInputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Instagram Handle</label>
                    <input
                      type="text"
                      placeholder="e.g. @kiran_cuts"
                      value={newMember.instagram}
                      onChange={(e) => setNewMember({ ...newMember, instagram: e.target.value })}
                      style={formInputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Short Bio / Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description about the barber..."
                    value={newMember.bio}
                    onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                    style={{ ...formInputStyle, resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="submit" style={{ ...addBtnStyle, width: '100%', justifyContent: 'center' }}>
                    <UserPlus size={16} />
                    <span>SAVE & ADD BARBER</span>
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: '1px solid #6a5a4a', color: '#a89a8a', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Styles */
const addBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'linear-gradient(135deg, #d5a353, #b8863b)',
  color: '#191514',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 22px',
  fontWeight: 800,
  fontSize: '0.88rem',
  letterSpacing: '0.5px',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(213,163,83,0.35)',
  transition: 'all 0.25s ease',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#d5a353',
  marginBottom: '4px',
};

const formInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(213,163,83,0.25)',
  borderRadius: '8px',
  color: '#f9f6f2',
  padding: '10px 12px',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'Outfit', sans-serif",
};

const summaryCard: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(28,22,18,0.95), rgba(22,18,15,0.98))',
  border: '1px solid rgba(213,163,83,0.12)',
  borderRadius: '14px',
  padding: '16px 20px',
  flex: 1,
  minWidth: 120,
};

const staffCard: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(28,22,18,0.95), rgba(22,18,15,0.98))',
  border: '1px solid rgba(213,163,83,0.15)',
  borderRadius: '16px',
  padding: '20px',
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
  color: '#a89a8a',
  fontSize: '0.72rem',
};

const statusBtn: React.CSSProperties = {
  padding: '6px 4px',
  borderRadius: '6px',
  fontSize: '0.72rem',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
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
  fontWeight: 600, backdropFilter: 'blur(10px)', zIndex: 9999,
};
