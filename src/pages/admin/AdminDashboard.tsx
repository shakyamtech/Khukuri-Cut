import React, { useEffect, useState } from 'react';
import { getStoredStaff } from '../../utils/staffStorage';
import {
  CalendarCheck,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Scissors,
  Trash2,
} from 'lucide-react';
import { APPOINTMENT_EVENT_UPDATED } from '../../utils/audioAlert';

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  submittedAt: string;
  barber?: string;
}

// Demo / seed appointments shown until real ones exist
const DEMO_APPOINTMENTS: Appointment[] = [
  { id: 'd1', name: 'Aarav Sharma', email: 'aarav@gmail.com', phone: '9841000001', date: '2025-08-15', time: '11:00 AM', service: 'HAIRCUTTING', notes: '', status: 'confirmed', submittedAt: '2025-08-13T10:00:00Z' },
  { id: 'd2', name: 'Bishal Thapa', email: 'bishal@gmail.com', phone: '9841000002', date: '2025-08-15', time: '01:30 PM', service: 'SHAVING', notes: 'Hot towel only', status: 'pending', submittedAt: '2025-08-13T10:30:00Z' },
  { id: 'd3', name: 'Sunil Karki', email: 'sunil@gmail.com', phone: '9841000003', date: '2025-08-16', time: '03:00 PM', service: 'HAIRCUT + SHAVE', notes: '', status: 'completed', submittedAt: '2025-08-13T11:00:00Z' },
  { id: 'd4', name: 'Manish KC', email: 'manish@gmail.com', phone: '9841000004', date: '2025-08-16', time: '05:00 PM', service: 'STYLING', notes: 'Pompadour style', status: 'pending', submittedAt: '2025-08-13T11:30:00Z' },
  { id: 'd5', name: 'Ramesh Basnet', email: 'ramesh@gmail.com', phone: '9841000005', date: '2025-08-17', time: '07:00 PM', service: 'TRIMMING', notes: '', status: 'cancelled', submittedAt: '2025-08-13T12:00:00Z' },
];

const SERVICE_PRICES: Record<string, number> = {
  HAIRCUTTING: 800,
  SHAVING: 500,
  'HAIRCUT + SHAVE': 1200,
  STYLING: 600,
  TRIMMING: 350,
  TATTOO: 2000,
};

function getAppointments(): Appointment[] {
  const saved = localStorage.getItem('kc_appointments');
  if (saved !== null) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem('kc_appointments', JSON.stringify(DEMO_APPOINTMENTS));
  return DEMO_APPOINTMENTS;
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  color: string;
  glow: string;
}> = ({ label, value, sub, icon: Icon, color, glow }) => (
  <div className="hover-card-lift" style={{ ...cardStyles.card, boxShadow: `0 8px 32px ${glow}`, cursor: 'pointer' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={cardStyles.label}>{label}</div>
        <div style={{ ...cardStyles.value, color }}>{value}</div>
        <div style={cardStyles.sub}>{sub}</div>
      </div>
      <div style={{ ...cardStyles.iconWrap, background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={22} color={color} />
      </div>
    </div>
  </div>
);

const cardStyles: Record<string, React.CSSProperties> = {
  card: {
    background: 'linear-gradient(145deg, rgba(28,22,18,0.95), rgba(22,18,15,0.98))',
    border: '1px solid rgba(213,163,83,0.12)',
    borderRadius: '16px',
    padding: '24px',
    flex: 1,
    minWidth: 180,
  },
  label: { fontSize: '0.72rem', color: '#6a5a4a', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: '10px' },
  value: { fontSize: '2.2rem', fontWeight: 800, lineHeight: 1, marginBottom: '6px' },
  sub: { fontSize: '0.78rem', color: '#8a7a6a' },
  iconWrap: { width: 46, height: 46, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

export const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    setAppointments(getAppointments());
  }, []);

  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;

  const revenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + (SERVICE_PRICES[a.service] || 0), 0);

  const filteredAppts = appointments.filter((a) => {
    if (dateFilter === 'all') return true;
    return a.date === dateFilter;
  });

  const recentAppts = filteredAppts.slice(0, 10);

  // Simple bar chart data (last 7 services booked by type)
  const serviceCount: Record<string, number> = {};
  appointments.forEach((a) => {
    serviceCount[a.service] = (serviceCount[a.service] || 0) + 1;
  });
  const topServices = Object.entries(serviceCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = Math.max(...topServices.map((s) => s[1]), 1);

  const handleDeleteAppointment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment record?')) {
      const updated = appointments.filter((a) => a.id !== id);
      setAppointments(updated);
      localStorage.setItem('kc_appointments', JSON.stringify(updated));
      window.dispatchEvent(new Event(APPOINTMENT_EVENT_UPDATED));
    }
  };

  const handleClearAllAppointments = () => {
    if (window.confirm('Are you sure you want to CLEAR ALL appointment records? This will reset all recent history!')) {
      setAppointments([]);
      localStorage.setItem('kc_appointments', JSON.stringify([]));
      window.dispatchEvent(new Event(APPOINTMENT_EVENT_UPDATED));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Greeting */}
      <div>
        <h2 style={{ color: '#f9f6f2', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          Namaste, Admin! 🪒
        </h2>
        <p style={{ color: '#6a5a4a', margin: '4px 0 0', fontSize: '0.88rem' }}>
          Here's what's happening at Khukuri Cut today.
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <StatCard label="Total Bookings" value={total} sub="All time" icon={CalendarCheck} color="#d5a353" glow="rgba(213,163,83,0.12)" />
        <StatCard label="Pending" value={pending} sub="Awaiting confirmation" icon={Clock} color="#f59e0b" glow="rgba(245,158,11,0.1)" />
        <StatCard label="Confirmed" value={confirmed} sub="Upcoming sessions" icon={CheckCircle} color="#3b82f6" glow="rgba(59,130,246,0.1)" />
        <StatCard label="Revenue (Completed)" value={`Rs ${revenue.toLocaleString()}`} sub={`${completed} sessions done`} icon={TrendingUp} color="#22c55e" glow="rgba(34,197,94,0.1)" />
      </div>

      {/* Charts + Recent */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Services Chart */}
        <div style={panelStyle}>
          <div style={{ ...panelHeader, marginBottom: '16px' }}>
            <Scissors size={16} color="#d5a353" />
            <span style={panelTitle}>Top Services Booked</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topServices.map(([srv, count]) => (
              <div key={srv}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#d8cfc4', marginBottom: 4 }}>
                  <span>{srv}</span>
                  <span style={{ color: '#d5a353', fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${(count / maxCount) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #d5a353, #c4893f)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div style={panelStyle}>
          <div style={{ ...panelHeader, marginBottom: '16px' }}>
            <AlertCircle size={16} color="#d5a353" />
            <span style={panelTitle}>Status Breakdown</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Pending', count: pending, color: '#f59e0b' },
              { label: 'Confirmed', count: confirmed, color: '#3b82f6' },
              { label: 'Completed', count: completed, color: '#22c55e' },
              { label: 'Cancelled', count: appointments.filter((a) => a.status === 'cancelled').length, color: '#ef4444' },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ color: '#a89a8a' }}>{label}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#f9f6f2', fontWeight: 700 }}>{count}</span>
                  <span style={{ color: '#6a5a4a', width: '35px', textAlign: 'right' }}>
                    {total ? `${Math.round((count / total) * 100)}%` : '0%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6a5a4a' }}>
            <span>Total Clients: {total}</span>
            <span>Services: {Object.keys(serviceCount).length}</span>
          </div>
        </div>

        {/* Live Staff Availability Panel */}
        <div style={panelStyle}>
          <div style={{ ...panelHeader, marginBottom: '16px' }}>
            <Users size={16} color="#d5a353" />
            <span style={panelTitle}>Live Staff Status</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {getStoredStaff().map((staff) => (
              <div key={staff.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px' }}>
                <div>
                  <div style={{ color: '#f9f6f2', fontSize: '0.85rem', fontWeight: 600 }}>{staff.name}</div>
                  <div style={{ color: '#8a7a6a', fontSize: '0.72rem' }}>{staff.role}</div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontWeight: 600,
                    background: staff.status === 'available' ? 'rgba(34,197,94,0.15)' : staff.status === 'busy' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                    color: staff.status === 'available' ? '#22c55e' : staff.status === 'busy' ? '#ef4444' : '#eab308',
                    border: `1px solid ${
                      staff.status === 'available'
                        ? 'rgba(34,197,94,0.3)'
                        : staff.status === 'busy'
                        ? 'rgba(239,68,68,0.3)'
                        : 'rgba(234,179,8,0.3)'
                    }`,
                  }}
                >
                  {staff.status === 'available' ? '🟢 Available' : staff.status === 'busy' ? '🔴 In Session' : '🟡 On Break'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid rgba(213,163,83,0.12)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={panelHeader}>
              <CalendarCheck size={16} color="#d5a353" />
              <span style={panelTitle}>Recent Appointments ({filteredAppts.length})</span>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginLeft: '8px' }}>
              <button
                onClick={() => setDateFilter('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: dateFilter === 'all' ? 800 : 600,
                  background: dateFilter === 'all' ? 'linear-gradient(135deg, #d5a353, #b8863b)' : 'rgba(255,255,255,0.05)',
                  color: dateFilter === 'all' ? '#191514' : '#a89a8a',
                  border: '1px solid rgba(213,163,83,0.25)',
                  cursor: 'pointer',
                }}
              >
                All Dates
              </button>

              <button
                onClick={() => setDateFilter('2025-08-15')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: dateFilter === '2025-08-15' ? 800 : 600,
                  background: dateFilter === '2025-08-15' ? 'linear-gradient(135deg, #d5a353, #b8863b)' : 'rgba(255,255,255,0.05)',
                  color: dateFilter === '2025-08-15' ? '#191514' : '#a89a8a',
                  border: '1px solid rgba(213,163,83,0.25)',
                  cursor: 'pointer',
                }}
              >
                📅 Today (Aug 15)
              </button>

              <button
                onClick={() => setDateFilter('2025-08-16')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: dateFilter === '2025-08-16' ? 800 : 600,
                  background: dateFilter === '2025-08-16' ? 'linear-gradient(135deg, #d5a353, #b8863b)' : 'rgba(255,255,255,0.05)',
                  color: dateFilter === '2025-08-16' ? '#191514' : '#a89a8a',
                  border: '1px solid rgba(213,163,83,0.25)',
                  cursor: 'pointer',
                }}
              >
                ⏩ Tomorrow (Aug 16)
              </button>

              <input
                type="date"
                value={dateFilter !== 'all' && dateFilter !== '2025-08-15' && dateFilter !== '2025-08-16' ? dateFilter : ''}
                onChange={(e) => setDateFilter(e.target.value || 'all')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(213,163,83,0.35)',
                  color: '#d5a353',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {appointments.length > 0 && (
            <button
              onClick={handleClearAllAppointments}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.28)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.75rem',
                padding: '6px 12px',
                cursor: 'pointer',
                fontWeight: 700,
                transition: 'all 0.2s ease',
              }}
              title="Clear All Recent Appointments History"
            >
              <Trash2 size={13} />
              <span>CLEAR ALL HISTORY</span>
            </button>
          )}
        </div>

        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#6a5a4a', fontSize: '0.88rem' }}>
            <p style={{ margin: '0 0 12px' }}>No recent appointments. All clear!</p>
            <button
              onClick={() => {
                setAppointments(DEMO_APPOINTMENTS);
                localStorage.setItem('kc_appointments', JSON.stringify(DEMO_APPOINTMENTS));
                window.dispatchEvent(new Event(APPOINTMENT_EVENT_UPDATED));
              }}
              style={{
                background: 'rgba(213,163,83,0.1)',
                border: '1px solid rgba(213,163,83,0.3)',
                borderRadius: '8px',
                color: '#d5a353',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 Restore Demo Samples
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle.table}>
              <thead>
                <tr>
                  {['Client', 'Service', 'Date', 'Time', 'Status', 'Action'].map((h) => (
                    <th key={h} style={tableStyle.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAppts.map((appt) => (
                  <tr key={appt.id} style={tableStyle.tr}>
                    <td style={tableStyle.td}>
                      <div style={{ color: '#f9f6f2', fontWeight: 600, fontSize: '0.88rem' }}>{appt.name}</div>
                      <div style={{ color: '#6a5a4a', fontSize: '0.75rem' }}>{appt.phone}</div>
                    </td>
                    <td style={tableStyle.td}>
                      <span style={{ color: '#d5a353', fontSize: '0.82rem' }}>{appt.service}</span>
                    </td>
                    <td style={tableStyle.td}>
                      <span style={{ color: '#d8cfc4', fontSize: '0.85rem' }}>{appt.date}</span>
                    </td>
                    <td style={tableStyle.td}>
                      <span style={{ color: '#d8cfc4', fontSize: '0.85rem' }}>{appt.time}</span>
                    </td>
                    <td style={tableStyle.td}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: `${STATUS_COLORS[appt.status]}18`,
                        color: STATUS_COLORS[appt.status],
                        border: `1px solid ${STATUS_COLORS[appt.status]}35`,
                      }}>
                        {appt.status}
                      </span>
                    </td>
                    <td style={tableStyle.td}>
                      <button
                        onClick={() => handleDeleteAppointment(appt.id)}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: '6px',
                          color: '#ef4444',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}
                        title="Delete Appointment Record"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const panelStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(28,22,18,0.95), rgba(22,18,15,0.98))',
  border: '1px solid rgba(213,163,83,0.12)',
  borderRadius: '16px',
  padding: '24px',
  flex: 1,
  minWidth: 280,
};
const panelHeader: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px' };
const panelTitle: React.CSSProperties = { color: '#d8cfc4', fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.05em' };
const tableStyle = {
  table: { width: '100%', borderCollapse: 'collapse' as const, minWidth: 500 },
  th: { color: '#6a5a4a', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '8px 14px', textAlign: 'left' as const, borderBottom: '1px solid rgba(213,163,83,0.1)' },
  td: { padding: '13px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' as const },
  tr: {} as React.CSSProperties,
};
