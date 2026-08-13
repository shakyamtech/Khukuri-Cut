import React, { useEffect, useState } from 'react';
import { Search, Filter, Trash2, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';
import type { Appointment } from './AdminDashboard';

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: 'd1', name: 'Aarav Sharma', email: 'aarav@gmail.com', phone: '9841000001', date: '2025-08-15', time: '11:00 AM', service: 'HAIRCUTTING', notes: '', status: 'confirmed', submittedAt: '2025-08-13T10:00:00Z' },
  { id: 'd2', name: 'Bishal Thapa', email: 'bishal@gmail.com', phone: '9841000002', date: '2025-08-15', time: '01:30 PM', service: 'SHAVING', notes: 'Hot towel only', status: 'pending', submittedAt: '2025-08-13T10:30:00Z' },
  { id: 'd3', name: 'Sunil Karki', email: 'sunil@gmail.com', phone: '9841000003', date: '2025-08-16', time: '03:00 PM', service: 'HAIRCUT + SHAVE', notes: '', status: 'completed', submittedAt: '2025-08-13T11:00:00Z' },
  { id: 'd4', name: 'Manish KC', email: 'manish@gmail.com', phone: '9841000004', date: '2025-08-16', time: '05:00 PM', service: 'STYLING', notes: 'Pompadour style', status: 'pending', submittedAt: '2025-08-13T11:30:00Z' },
  { id: 'd5', name: 'Ramesh Basnet', email: 'ramesh@gmail.com', phone: '9841000005', date: '2025-08-17', time: '07:00 PM', service: 'TRIMMING', notes: '', status: 'cancelled', submittedAt: '2025-08-13T12:00:00Z' },
  { id: 'd6', name: 'Dipesh Gurung', email: 'dipesh@gmail.com', phone: '9841000006', date: '2025-08-18', time: '12:00 PM', service: 'HAIRCUTTING', notes: 'Fade cut', status: 'pending', submittedAt: '2025-08-13T13:00:00Z' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
};

function loadAppointments(): Appointment[] {
  const saved = localStorage.getItem('kc_appointments');
  const real: Appointment[] = saved ? JSON.parse(saved) : [];
  return [...real, ...DEMO_APPOINTMENTS];
}

function saveRealAppointments(appointments: Appointment[]) {
  const realOnes = appointments.filter((a) => !a.id.startsWith('d'));
  localStorage.setItem('kc_appointments', JSON.stringify(realOnes));
}

export const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setAppointments(loadAppointments());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const updateStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, status } : a));
      saveRealAppointments(updated);
      return updated;
    });
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
    showToast(`Status updated to "${status}"`);
  };

  const deleteAppt = (id: string) => {
    setAppointments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveRealAppointments(updated);
      return updated;
    });
    setSelected(null);
    showToast('Appointment deleted.');
  };

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast */}
      {toast && (
        <div style={toastStyle}>
          <CheckCircle size={16} color="#22c55e" />
          {toast}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={inputWrap}>
          <Search size={16} color="#6a5a4a" style={{ flexShrink: 0 }} />
          <input
            style={searchInput}
            placeholder="Search by name, phone, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ ...inputWrap, gap: '8px', minWidth: 160 }}>
          <Filter size={14} color="#6a5a4a" />
          <select
            style={{ ...searchInput, paddingLeft: 0 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', color: '#6a5a4a', fontSize: '0.8rem' }}>
          {filtered.length} appointments
        </div>
      </div>

      {/* Table */}
      <div style={panelStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
            <thead>
              <tr>
                {['Client', 'Service', 'Date & Time', 'Notes', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#4a3a2a' }}>
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => {
                  const StatusIcon = STATUS_ICONS[appt.status];
                  return (
                    <tr
                      key={appt.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s',
                        cursor: 'pointer',
                        background: selected?.id === appt.id ? 'rgba(213,163,83,0.05)' : 'transparent',
                      }}
                      onClick={() => setSelected(selected?.id === appt.id ? null : appt)}
                    >
                      <td style={tdStyle}>
                        <div style={{ color: '#f9f6f2', fontWeight: 600, fontSize: '0.88rem' }}>{appt.name}</div>
                        <div style={{ color: '#6a5a4a', fontSize: '0.75rem' }}>{appt.phone}</div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: '#d5a353', fontSize: '0.82rem', fontWeight: 600 }}>{appt.service}</span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ color: '#d8cfc4', fontSize: '0.85rem' }}>{appt.date}</div>
                        <div style={{ color: '#6a5a4a', fontSize: '0.75rem' }}>{appt.time}</div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: '#8a7a6a', fontSize: '0.78rem' }}>
                          {appt.notes || '—'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={statusBadge(appt.status)}>
                          <StatusIcon size={12} />
                          {appt.status}
                        </div>
                      </td>
                      <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <StatusDropdown
                            current={appt.status}
                            onChange={(s) => updateStatus(appt.id, s)}
                          />
                          {!appt.id.startsWith('d') && (
                            <button
                              onClick={() => deleteAppt(appt.id)}
                              style={deleteBtn}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={detailPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#d5a353', fontSize: '0.72rem', letterSpacing: '0.15em', marginBottom: '4px' }}>APPOINTMENT DETAIL</div>
              <div style={{ color: '#f9f6f2', fontSize: '1.2rem', fontWeight: 700 }}>{selected.name}</div>
            </div>
            <div style={statusBadge(selected.status)}>
              {selected.status}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
            {[
              { label: 'Phone', val: selected.phone },
              { label: 'Email', val: selected.email || '—' },
              { label: 'Service', val: selected.service },
              { label: 'Date', val: selected.date },
              { label: 'Time', val: selected.time },
              { label: 'Notes', val: selected.notes || '—' },
            ].map(({ label, val }) => (
              <div key={label}>
                <div style={{ color: '#5a4a3a', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                <div style={{ color: '#d8cfc4', fontSize: '0.88rem' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatusDropdown: React.FC<{ current: Appointment['status']; onChange: (s: Appointment['status']) => void }> = ({ current, onChange }) => (
  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
    <select
      value={current}
      onChange={(e) => onChange(e.target.value as Appointment['status'])}
      style={{
        background: `${STATUS_COLORS[current]}15`,
        border: `1px solid ${STATUS_COLORS[current]}30`,
        color: STATUS_COLORS[current],
        borderRadius: '7px',
        padding: '5px 28px 5px 10px',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        appearance: 'none',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
    <ChevronDown size={12} color={STATUS_COLORS[current]} style={{ position: 'absolute', right: 8, pointerEvents: 'none' }} />
  </div>
);

const statusBadge = (status: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '0.72rem',
  fontWeight: 600,
  textTransform: 'capitalize',
  background: `${STATUS_COLORS[status]}15`,
  color: STATUS_COLORS[status],
  border: `1px solid ${STATUS_COLORS[status]}30`,
});

const panelStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(28,22,18,0.95), rgba(22,18,15,0.98))',
  border: '1px solid rgba(213,163,83,0.12)',
  borderRadius: '16px',
  padding: '20px',
};

const detailPanel: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(30,24,18,0.98), rgba(22,18,14,1))',
  border: '1px solid rgba(213,163,83,0.2)',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 8px 32px rgba(213,163,83,0.08)',
};

const thStyle: React.CSSProperties = {
  color: '#5a4a3a',
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '10px 14px',
  textAlign: 'left',
  borderBottom: '1px solid rgba(213,163,83,0.1)',
};

const tdStyle: React.CSSProperties = {
  padding: '14px',
  verticalAlign: 'middle',
};

const inputWrap: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'rgba(28,22,18,0.95)',
  border: '1px solid rgba(213,163,83,0.15)',
  borderRadius: '10px',
  padding: '10px 14px',
  flex: 1,
  minWidth: 200,
};

const searchInput: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#d8cfc4',
  fontSize: '0.88rem',
  outline: 'none',
  width: '100%',
  fontFamily: "'Outfit', sans-serif",
};

const deleteBtn: React.CSSProperties = {
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.2)',
  color: '#ef4444',
  borderRadius: '7px',
  padding: '5px 8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 28,
  right: 28,
  background: 'rgba(22,34,22,0.95)',
  border: '1px solid rgba(34,197,94,0.3)',
  color: '#22c55e',
  padding: '12px 20px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.88rem',
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  zIndex: 999,
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
};
