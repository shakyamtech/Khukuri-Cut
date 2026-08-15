import React, { useEffect, useState } from 'react';
import { getStoredStaff } from '../../utils/staffStorage';
import {
  CalendarCheck,
  TrendingUp,
  Users,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  Scissors,
} from 'lucide-react';

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
  const real: Appointment[] = saved ? JSON.parse(saved) : [];
  // Merge demo + real, real ones first
  return [...real, ...DEMO_APPOINTMENTS];
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  color: string;
  glow: string;
}> = ({ label, value, sub, icon: Icon, color, glow }) => (
  <div style={{ ...cardStyles.card, boxShadow: `0 8px 32px ${glow}` }}>
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

  const recentAppts = appointments.slice(0, 5);

  // Simple bar chart data (last 7 services booked by type)
  const serviceCount: Record<string, number> = {};
  appointments.forEach((a) => {
    serviceCount[a.service] = (serviceCount[a.service] || 0) + 1;
  });
  const topServices = Object.entries(serviceCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = Math.max(...topServices.map((s) => s[1]), 1);

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
          <div style={panelHeader}>
            <Scissors size={16} color="#d5a353" />
            <span style={panelTitle}>Top Services Booked</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {topServices.map(([service, count]) => (
              <div key={service}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#d8cfc4', fontSize: '0.82rem' }}>{service}</span>
                  <span style={{ color: '#d5a353', fontSize: '0.82rem', fontWeight: 700 }}>{count}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(count / maxCount) * 100}%`,
                      background: 'linear-gradient(90deg, #d5a353, #c4893f)',
                      borderRadius: 3,
                      transition: 'width 0.8s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div style={panelStyle}>
          <div style={panelHeader}>
            <AlertCircle size={16} color="#d5a353" />
            <span style={panelTitle}>Status Breakdown</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => {
              const count = appointments.filter((a) => a.status === status).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[status], flexShrink: 0 }} />
                  <span style={{ color: '#a89070', fontSize: '0.82rem', textTransform: 'capitalize', flex: 1 }}>{status}</span>
                  <span style={{ color: STATUS_COLORS[status], fontWeight: 700, fontSize: '0.9rem' }}>{count}</span>
                  <span style={{ color: '#5a4a3a', fontSize: '0.75rem', width: 36, textAlign: 'right' }}>{pct}%</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} color="#6a5a4a" />
              <span style={{ color: '#6a5a4a', fontSize: '0.75rem' }}>Total Clients: {total}</span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShoppingBag size={14} color="#6a5a4a" />
              <span style={{ color: '#6a5a4a', fontSize: '0.75rem' }}>Services: {Object.keys(serviceCount).length}</span>
            </div>
          </div>
        </div>

        {/* Live Staff Availability Panel */}
        <div style={panelStyle}>
          <div style={panelHeader}>
            <Users size={16} color="#d5a353" />
            <span style={panelTitle}>Live Staff Status</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {getStoredStaff().map((staff) => (
              <div
                key={staff.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div>
                  <div style={{ color: '#f9f6f2', fontSize: '0.88rem', fontWeight: 600 }}>{staff.name}</div>
                  <div style={{ color: '#8a7a6a', fontSize: '0.72rem' }}>{staff.role}</div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    color: staff.status === 'available' ? '#22c55e' : staff.status === 'busy' ? '#ef4444' : '#eab308',
                    background:
                      staff.status === 'available'
                        ? 'rgba(34,197,94,0.12)'
                        : staff.status === 'busy'
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(234,179,8,0.12)',
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
        <div style={{ ...panelHeader, marginBottom: '16px' }}>
          <CalendarCheck size={16} color="#d5a353" />
          <span style={panelTitle}>Recent Appointments</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle.table}>
            <thead>
              <tr>
                {['Client', 'Service', 'Date', 'Time', 'Status'].map((h) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
