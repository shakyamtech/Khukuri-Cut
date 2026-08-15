import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Calendar,
  Volume2,
  Bell,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  KeyRound,
  CheckCircle,
} from 'lucide-react';
import { getStoredStaff, saveStoredStaff, STAFF_UPDATED_EVENT } from '../../utils/staffStorage';
import type { StaffMember, StaffStatus } from '../../utils/staffStorage';
import {
  playSweetDingSound,
  APPOINTMENT_EVENT_CREATED,
  APPOINTMENT_EVENT_UPDATED,
  adminChannel,
} from '../../utils/audioAlert';
import type { Appointment } from '../admin/AdminDashboard';

const DEFAULT_PINS: Record<string, string> = {
  subash: '1001',
  laxman: '1002',
  anup: '1003',
  kiran: '1004',
};

const MASTER_PIN = '7777';

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: 'd1', name: 'Aarav Sharma', email: 'aarav@gmail.com', phone: '9841000001', date: '2025-08-15', time: '11:00 AM', service: 'HAIRCUTTING', notes: '', status: 'confirmed', submittedAt: '2025-08-13T10:00:00Z', barber: 'Subash Gurung' },
  { id: 'd2', name: 'Bishal Thapa', email: 'bishal@gmail.com', phone: '9841000002', date: '2025-08-15', time: '01:30 PM', service: 'SHAVING', notes: 'Hot towel only', status: 'pending', submittedAt: '2025-08-13T10:30:00Z', barber: 'Laxman Shrestha' },
  { id: 'd3', name: 'Sunil Karki', email: 'sunil@gmail.com', phone: '9841000003', date: '2025-08-16', time: '03:00 PM', service: 'HAIRCUT + SHAVE', notes: '', status: 'completed', submittedAt: '2025-08-13T11:00:00Z', barber: 'Subash Gurung' },
  { id: 'd4', name: 'Manish KC', email: 'manish@gmail.com', phone: '9841000004', date: '2025-08-16', time: '05:00 PM', service: 'STYLING', notes: 'Pompadour style', status: 'pending', submittedAt: '2025-08-13T11:30:00Z', barber: 'Anup Thapa' },
  { id: 'd6', name: 'Dipesh Gurung', email: 'dipesh@gmail.com', phone: '9841000006', date: '2025-08-18', time: '12:00 PM', service: 'HAIRCUTTING', notes: 'Fade cut', status: 'pending', submittedAt: '2025-08-13T13:00:00Z', barber: 'Kiran Sharma' },
];

function getBarberAppointments(barberName: string): Appointment[] {
  try {
    const saved = localStorage.getItem('kc_appointments');
    const real: Appointment[] = saved ? JSON.parse(saved) : [];
    const all = [...real, ...DEMO_APPOINTMENTS];
    return all.filter((a) => {
      if (!a.barber) return true;
      return (
        a.barber.toLowerCase().includes(barberName.toLowerCase()) ||
        barberName.toLowerCase().includes(a.barber.toLowerCase()) ||
        a.barber.includes('Any')
      );
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export const BarberPortal: React.FC = () => {
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(getStoredStaff);
  const [selectedBarber, setSelectedBarber] = useState<StaffMember | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [activeTabBarber, setActiveTabBarber] = useState<StaffMember | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [toastAlert, setToastAlert] = useState<{ name: string; service: string } | null>(null);

  // Check saved session on mount
  useEffect(() => {
    try {
      const savedAuthId = localStorage.getItem('kc_authenticated_barber_id');
      if (savedAuthId) {
        const found = staffMembers.find((s) => s.id === savedAuthId);
        if (found) setActiveTabBarber(found);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync staff members from localStorage
  useEffect(() => {
    const handleUpdate = () => {
      const latest = getStoredStaff();
      setStaffMembers(latest);
      if (activeTabBarber) {
        const found = latest.find((s) => s.id === activeTabBarber.id);
        if (found) setActiveTabBarber(found);
      }
    };
    window.addEventListener(STAFF_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(STAFF_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [activeTabBarber]);

  // Load appointments for selected barber
  useEffect(() => {
    if (activeTabBarber) {
      setAppointments(getBarberAppointments(activeTabBarber.name));
    }
  }, [activeTabBarber]);

  // Listen for real-time customer bookings (Chime + Alert)
  useEffect(() => {
    const triggerBookingAlert = (clientName: string, serviceName: string, barberName?: string) => {
      if (
        !barberName ||
        !activeTabBarber ||
        barberName.includes('Any') ||
        barberName.toLowerCase().includes(activeTabBarber.name.toLowerCase()) ||
        activeTabBarber.name.toLowerCase().includes(barberName.toLowerCase())
      ) {
        playSweetDingSound();
        setToastAlert({ name: clientName, service: serviceName });
        setTimeout(() => setToastAlert(null), 5000);
        if (activeTabBarber) {
          setAppointments(getBarberAppointments(activeTabBarber.name));
        }
      }
    };

    const handleCreated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      triggerBookingAlert(
        detail?.name || 'New Guest',
        detail?.service || 'Appointment',
        detail?.barber
      );
    };

    if (adminChannel) {
      adminChannel.onmessage = (evt) => {
        if (evt.data?.type === 'NEW_BOOKING') {
          const appt = evt.data.appointment;
          triggerBookingAlert(
            appt?.name || 'New Guest',
            appt?.service || 'Appointment',
            appt?.barber
          );
        }
      };
    }

    window.addEventListener(APPOINTMENT_EVENT_CREATED, handleCreated);
    window.addEventListener(APPOINTMENT_EVENT_UPDATED, () => {
      if (activeTabBarber) setAppointments(getBarberAppointments(activeTabBarber.name));
    });

    return () => {
      if (adminChannel) adminChannel.onmessage = null;
      window.removeEventListener(APPOINTMENT_EVENT_CREATED, handleCreated);
    };
  }, [activeTabBarber]);

  const handleSelectBarberCard = (barber: StaffMember) => {
    setSelectedBarber(barber);
    setPinInput('');
    setPinError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarber) {
      setPinError('Please tap your barber profile photo first!');
      return;
    }

    const expectedPin = selectedBarber.pin || DEFAULT_PINS[selectedBarber.id] || '1001';

    if (pinInput === expectedPin || pinInput === MASTER_PIN) {
      setActiveTabBarber(selectedBarber);
      localStorage.setItem('kc_authenticated_barber_id', selectedBarber.id);
      setPinError('');
    } else {
      setPinError(`⛔ Invalid PIN! Expected PIN for ${selectedBarber.name} or Master PIN.`);
    }
  };

  const handleLogout = () => {
    setActiveTabBarber(null);
    setSelectedBarber(null);
    setPinInput('');
    setPinError('');
    localStorage.removeItem('kc_authenticated_barber_id');
  };

  const handleStatusChange = (status: StaffStatus) => {
    if (!activeTabBarber) return;
    const defaultNotes: Record<StaffStatus, string> = {
      available: 'Ready for Walk-in',
      busy: 'In Session',
      off: 'On Break',
    };
    const updated = staffMembers.map((s) =>
      s.id === activeTabBarber.id ? { ...s, status, statusNote: defaultNotes[status] } : s
    );
    setStaffMembers(updated);
    saveStoredStaff(updated);
    setActiveTabBarber({ ...activeTabBarber, status });
  };

  const handleAppointmentStatus = (id: string, newStatus: Appointment['status']) => {
    try {
      const saved = localStorage.getItem('kc_appointments');
      const real: Appointment[] = saved ? JSON.parse(saved) : [];
      const updated = real.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
      localStorage.setItem('kc_appointments', JSON.stringify(updated));
      if (activeTabBarber) {
        setAppointments(getBarberAppointments(activeTabBarber.name));
      }
      window.dispatchEvent(new Event(APPOINTMENT_EVENT_UPDATED));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={rootStyle}>
      {/* Top Header */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate('/')} style={backBtnStyle} title="Back to Main Site">
            <ArrowLeft size={18} color="#d5a353" />
          </button>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d5a353', letterSpacing: '1px' }}>
              KHUKURI CUT
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8a7a6a' }}>Barber Security Portal</div>
          </div>
        </div>

        {activeTabBarber && (
          <button onClick={handleLogout} style={logoutBtnStyle}>
            <LogOut size={15} />
            <span>Lock Shift</span>
          </button>
        )}
      </header>

      {/* Main Body */}
      <main style={{ padding: '20px 16px', maxWidth: '540px', margin: '0 auto' }}>
        {/* ====== STEP 1: BARBER SECURE AUTHENTICATION SCREEN ====== */}
        {!activeTabBarber ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #d5a353, #b8863b)', color: '#191514', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 0 25px rgba(213,163,83,0.35)' }}>
                <Lock size={28} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d5a353', letterSpacing: '1px' }}>
                BARBER AUTHENTICATION
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#a89a8a', marginTop: '4px' }}>
                Tap your profile & enter your 4-Digit Security Passcode PIN to access your mobile portal.
              </p>
            </div>

            {/* Barber Cards Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {staffMembers.map((barber) => {
                const isSelected = selectedBarber?.id === barber.id;
                return (
                  <div
                    key={barber.id}
                    onClick={() => handleSelectBarberCard(barber)}
                    style={{
                      background: isSelected ? 'linear-gradient(145deg, #2b2118, #1e1711)' : 'linear-gradient(145deg, #1a1410, #15110e)',
                      border: isSelected ? '2px solid #d5a353' : '1px solid rgba(213,163,83,0.18)',
                      borderRadius: '16px',
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      boxShadow: isSelected ? '0 0 20px rgba(213,163,83,0.3)' : '0 8px 24px rgba(0,0,0,0.4)',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                      <img
                        src={barber.image}
                        alt={barber.name}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: isSelected ? '2.5px solid #d5a353' : '2px solid rgba(213,163,83,0.4)' }}
                      />
                      <span
                        style={{
                          position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%',
                          background: barber.status === 'available' ? '#22c55e' : barber.status === 'busy' ? '#ef4444' : '#eab308',
                          border: '2px solid #161210',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: isSelected ? '#d5a353' : '#f9f6f2', fontWeight: 700, fontSize: '1rem' }}>{barber.name}</div>
                      <div style={{ color: '#a89a8a', fontSize: '0.75rem' }}>{barber.role}</div>
                      <div style={{ fontSize: '0.72rem', color: barber.status === 'available' ? '#22c55e' : barber.status === 'busy' ? '#ef4444' : '#eab308', marginTop: 2, fontWeight: 600 }}>
                        {barber.status === 'available' ? '🟢 Available' : barber.status === 'busy' ? '🔴 In Session' : '🟡 On Break'}
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle size={20} color="#d5a353" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* SECURE PIN INPUT FORM */}
            {selectedBarber && (
              <form onSubmit={handleLoginSubmit} style={{ background: 'linear-gradient(145deg, #241c16, #18130f)', border: '1.5px solid #d5a353', borderRadius: '16px', padding: '20px', animation: 'fadeSlideUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderBottom: '1px solid rgba(213,163,83,0.2)', paddingBottom: '10px' }}>
                  <KeyRound size={20} color="#d5a353" />
                  <div>
                    <div style={{ color: '#d5a353', fontSize: '0.95rem', fontWeight: 800 }}>ENTER PASSCODE FOR {selectedBarber.name.toUpperCase()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#a89a8a' }}>Default PINs: Subash (1001), Laxman (1002), Anup (1003), Kiran (1004)</div>
                  </div>
                </div>

                <div style={{ position: 'relative', marginBottom: '14px' }}>
                  <input
                    type={showPin ? 'text' : 'password'}
                    placeholder="Enter 4-Digit Security PIN *"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(213,163,83,0.3)',
                      color: '#ffffff',
                      fontSize: '1.2rem',
                      letterSpacing: '4px',
                      textAlign: 'center',
                      fontWeight: 700,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#d5a353', cursor: 'pointer' }}
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {pinError && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <AlertTriangle size={16} />
                    <span>{pinError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #d5a353, #b8863b)',
                    color: '#191514',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    fontFamily: "'Teko', sans-serif",
                    letterSpacing: '1.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(213,163,83,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Lock size={16} />
                  <span>AUTHENTICATE & ENTER PORTAL</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ====== STEP 2: AUTHENTICATED BARBER MOBILE DASHBOARD ====== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Active Authenticated Profile Banner */}
            <div style={{ background: 'linear-gradient(145deg, #241c16, #18130f)', border: '1.5px solid #d5a353', borderRadius: '18px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
              <img
                src={activeTabBarber.image}
                alt={activeTabBarber.name}
                style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: '3px solid #d5a353', boxShadow: '0 0 16px rgba(213,163,83,0.4)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#22c55e" />
                  <span style={{ color: '#22c55e', fontSize: '0.72rem', letterSpacing: '1px', fontWeight: 800 }}>AUTHENTICATED SESSION</span>
                </div>
                <div style={{ color: '#f9f6f2', fontSize: '1.3rem', fontWeight: 800 }}>
                  {activeTabBarber.name}
                </div>
                <div style={{ color: '#a89a8a', fontSize: '0.78rem' }}>{activeTabBarber.role}</div>
              </div>
              <button
                onClick={() => playSweetDingSound()}
                style={{ background: 'rgba(213,163,83,0.12)', border: '1px solid rgba(213,163,83,0.25)', borderRadius: '10px', color: '#d5a353', padding: '8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.65rem' }}
                title="Test Bell Sound"
              >
                <Volume2 size={18} />
                <span>Test Sound</span>
              </button>
            </div>

            {/* STATUS CONTROL PANEL */}
            <div style={{ background: 'rgba(28,22,18,0.95)', border: '1px solid rgba(213,163,83,0.18)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ color: '#d5a353', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} />
                <span>1-TAP LIVE AVAILABILITY CONTROL:</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => handleStatusChange('available')}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1.5px solid #22c55e',
                    background: activeTabBarber.status === 'available' ? '#22c55e' : 'rgba(34,197,94,0.08)',
                    color: activeTabBarber.status === 'available' ? '#120e0d' : '#22c55e',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTabBarber.status === 'available' ? '0 0 20px rgba(34,197,94,0.4)' : 'none',
                  }}
                >
                  <span>🟢 AVAILABLE</span>
                </button>

                <button
                  onClick={() => handleStatusChange('busy')}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1.5px solid #ef4444',
                    background: activeTabBarber.status === 'busy' ? '#ef4444' : 'rgba(239,68,68,0.08)',
                    color: activeTabBarber.status === 'busy' ? '#ffffff' : '#ef4444',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTabBarber.status === 'busy' ? '0 0 20px rgba(239,68,68,0.4)' : 'none',
                  }}
                >
                  <span>🔴 IN SESSION</span>
                </button>

                <button
                  onClick={() => handleStatusChange('off')}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1.5px solid #eab308',
                    background: activeTabBarber.status === 'off' ? '#eab308' : 'rgba(234,179,8,0.08)',
                    color: activeTabBarber.status === 'off' ? '#120e0d' : '#eab308',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTabBarber.status === 'off' ? '0 0 20px rgba(234,179,8,0.4)' : 'none',
                  }}
                >
                  <span>🟡 ON BREAK</span>
                </button>

                <button
                  onClick={() => handleStatusChange('off')}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1.5px solid #6a5a4a',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#a89a8a',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🚫 OFF DUTY</span>
                </button>
              </div>
            </div>

            {/* TODAY'S APPOINTMENTS / QUEUE LIST FOR THIS BARBER */}
            <div style={{ background: 'rgba(28,22,18,0.95)', border: '1px solid rgba(213,163,83,0.18)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ color: '#d5a353', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} />
                  <span>YOUR CLIENT QUEUE ({appointments.length})</span>
                </div>
              </div>

              {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6a5a4a', fontSize: '0.88rem' }}>
                  No bookings assigned yet today.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(213,163,83,0.15)',
                        borderRadius: '12px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div style={{ color: '#f9f6f2', fontWeight: 700, fontSize: '1rem' }}>{appt.name}</div>
                        <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px', background: appt.status === 'pending' ? 'rgba(245,158,11,0.15)' : appt.status === 'confirmed' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)', color: appt.status === 'pending' ? '#f59e0b' : appt.status === 'confirmed' ? '#3b82f6' : '#22c55e', border: '1px solid currentColor', fontWeight: 700 }}>
                          {appt.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ color: '#d5a353', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        ✂️ {appt.service}
                      </div>

                      <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: '#a89a8a', marginBottom: '10px' }}>
                        <span>📅 {appt.date}</span>
                        <span>⏰ {appt.time}</span>
                      </div>

                      {/* Phone call & Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <a
                          href={`tel:${appt.phone}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#22c55e', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          <Phone size={14} />
                          <span>Call {appt.phone}</span>
                        </a>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleAppointmentStatus(appt.id, 'completed')}
                            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Mark Done ✅
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* TOAST ALERT WHEN NEW BOOKING ARRIVES ON PHONE */}
      {toastAlert && (
        <div style={toastPopupStyle}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #d5a353, #b8863b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(213,163,83,0.5)' }}>
            <Bell size={20} color="#191514" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d5a353', letterSpacing: '0.8px' }}>
              🔔 NEW BOOKING RECEIVED!
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f9f6f2', marginTop: '2px' }}>
              {toastAlert.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#a89a8a' }}>
              Booked: <span style={{ color: '#d5a353' }}>{toastAlert.service}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Mobile Styles */
const rootStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0f0d0c',
  color: '#f9f6f2',
  fontFamily: "'Outfit', sans-serif",
  paddingBottom: '40px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 20px',
  background: 'rgba(20,16,14,0.95)',
  borderBottom: '1px solid rgba(213,163,83,0.15)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backdropFilter: 'blur(10px)',
};

const backBtnStyle: React.CSSProperties = {
  background: 'rgba(213,163,83,0.08)',
  border: '1px solid rgba(213,163,83,0.2)',
  borderRadius: '8px',
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const logoutBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(239,68,68,0.12)',
  border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: '8px',
  color: '#ef4444',
  padding: '6px 12px',
  fontSize: '0.78rem',
  fontWeight: 700,
  cursor: 'pointer',
};

const toastPopupStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  right: '16px',
  left: '16px',
  zIndex: 99999,
  background: 'linear-gradient(135deg, #2b2118, #18130f)',
  border: '1.5px solid #d5a353',
  boxShadow: '0 12px 40px rgba(0,0,0,0.9), 0 0 24px rgba(213,163,83,0.4)',
  borderRadius: '16px',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  animation: 'fadeSlideUp 0.35s ease',
  maxWidth: '450px',
  margin: '0 auto',
};
