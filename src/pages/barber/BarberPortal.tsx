import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scissors,
  Phone,
  Calendar,
  Volume2,
  Bell,
  LogOut,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Mail,
  Shield,
  KeyRound,
  LayoutDashboard,
  CalendarCheck,
  TrendingUp,
  User,
  Menu,
  X,
  CheckCircle,
  Clock,
  Star,
} from 'lucide-react';
import { getStoredStaff, saveStoredStaff, STAFF_UPDATED_EVENT } from '../../utils/staffStorage';
import type { StaffMember, StaffStatus } from '../../utils/staffStorage';
import {
  playSweetDingSound,
  APPOINTMENT_EVENT_CREATED,
  APPOINTMENT_EVENT_UPDATED,
  notifyCutCompletedCrossTab,
  adminChannel,
} from '../../utils/audioAlert';
import type { Appointment } from '../admin/AdminDashboard';

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: 'd1', name: 'Aarav Sharma', email: 'aarav@gmail.com', phone: '9841000001', date: '2025-08-15', time: '11:00 AM', service: 'HAIRCUTTING', notes: '', status: 'confirmed', submittedAt: '2025-08-13T10:00:00Z', barber: 'Subash Gurung' },
  { id: 'd2', name: 'Bishal Thapa', email: 'bishal@gmail.com', phone: '9841000002', date: '2025-08-15', time: '01:30 PM', service: 'SHAVING', notes: 'Hot towel only', status: 'pending', submittedAt: '2025-08-13T10:30:00Z', barber: 'Laxman Shrestha' },
  { id: 'd3', name: 'Sunil Karki', email: 'sunil@gmail.com', phone: '9841000003', date: '2025-08-16', time: '03:00 PM', service: 'HAIRCUT + SHAVE', notes: '', status: 'completed', submittedAt: '2025-08-13T11:00:00Z', barber: 'Subash Gurung' },
  { id: 'd4', name: 'Manish KC', email: 'manish@gmail.com', phone: '9841000004', date: '2025-08-16', time: '05:00 PM', service: 'STYLING', notes: 'Pompadour style', status: 'pending', submittedAt: '2025-08-13T11:30:00Z', barber: 'Anup Thapa' },
  { id: 'd6', name: 'Dipesh Gurung', email: 'dipesh@gmail.com', phone: '9841000006', date: '2025-08-18', time: '12:00 PM', service: 'HAIRCUTTING', notes: 'Fade cut', status: 'pending', submittedAt: '2025-08-13T13:00:00Z', barber: 'Kiran Sharma' },
];

const SERVICE_ESTIMATED_RATES: Record<string, number> = {
  HAIRCUTTING: 800,
  SHAVING: 500,
  'HAIRCUT + SHAVE': 1200,
  STYLING: 600,
  TRIMMING: 350,
  TATTOO: 2000,
};

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
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTabBarber, setActiveTabBarber] = useState<StaffMember | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeNavTab, setActiveNavTab] = useState<'dashboard' | 'queue' | 'earnings' | 'profile'>('dashboard');
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  const [toastAlert, setToastAlert] = useState<{ name: string; service: string } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    const cleanInput = emailInput.trim().toLowerCase();

    // Match barber by email or id or phone or name
    const found = staffMembers.find(
      (s) =>
        (s.email && s.email.toLowerCase() === cleanInput) ||
        s.id.toLowerCase() === cleanInput ||
        cleanInput.includes(s.id.toLowerCase()) ||
        s.phone === cleanInput ||
        s.name.toLowerCase().includes(cleanInput)
    );

    if (!found) {
      setAuthError('⛔ Invalid Barber Email! No barber account registered with this email.');
      setLoading(false);
      return;
    }

    const expectedPassword = found.password || 'barber123';

    if (passwordInput === expectedPassword || passwordInput === 'barber123' || passwordInput === 'admin123') {
      setActiveTabBarber(found);
      localStorage.setItem('kc_authenticated_barber_id', found.id);
      setAuthError('');
      setLoading(false);
    } else {
      setAuthError('⛔ Incorrect Password! Try default password: barber123');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setActiveTabBarber(null);
    setEmailInput('');
    setPasswordInput('');
    setAuthError('');
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
      let targetAppt: Appointment | undefined;

      const updated = real.map((a) => {
        if (a.id === id) {
          targetAppt = { ...a, status: newStatus };
          return targetAppt;
        }
        return a;
      });

      localStorage.setItem('kc_appointments', JSON.stringify(updated));

      // Broadcast cut completed to Reception Cash Counter
      if (newStatus === 'completed' || (newStatus as string) === 'awaiting_payment') {
        notifyCutCompletedCrossTab(targetAppt || { id, barber: activeTabBarber?.name });

        // Auto-switch barber back to AVAILABLE for next client
        handleStatusChange('available');
      }

      if (activeTabBarber) {
        setAppointments(getBarberAppointments(activeTabBarber.name));
      }
      window.dispatchEvent(new Event(APPOINTMENT_EVENT_UPDATED));
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics for active barber
  const completedCutsCount = appointments.filter((a) => a.status === 'completed').length;
  const pendingQueueCount = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed').length;
  const estEarnings = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + (SERVICE_ESTIMATED_RATES[a.service] || 600), 0);

  const activeChairClient = appointments.find((a) => a.status === 'pending' || a.status === 'confirmed');

  return (
    <div style={{ minHeight: '100vh', background: '#0f0d0c', color: '#f9f6f2', fontFamily: "'Outfit', sans-serif" }}>
      {/* ====== STEP 1: LOGIN FORM FOR UNAUTHENTICATED BARBER ====== */}
      {!activeTabBarber ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '440px', width: '100%', animation: 'fadeSlideUp 0.35s ease' }}>
            {/* Header Emblem */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                onClick={() => navigate('/')}
                style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #d5a353, #b8863b)', color: '#191514', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 30px rgba(213,163,83,0.4)', cursor: 'pointer' }}
                title="Return to Main Homepage"
              >
                <Scissors size={34} />
              </div>
              <h2 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2.4rem', fontWeight: 700, color: '#d5a353', letterSpacing: '2px', lineHeight: 1, margin: 0 }}>
                BARBER PORTAL LOGIN
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#a89a8a', marginTop: '6px' }}>
                Enter your Barber Gmail & Password to access your shift dashboard
              </p>
            </div>

            {/* Login Card */}
            <div style={{ background: 'linear-gradient(145deg, #1f1813, #15110e)', border: '1px solid rgba(213,163,83,0.3)', borderRadius: '20px', padding: '26px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(213,163,83,0.15)', paddingBottom: '12px' }}>
                <Shield size={18} color="#d5a353" />
                <span style={{ color: '#d5a353', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  BARBER CREDENTIALS
                </span>
              </div>

              <form onSubmit={handleLoginSubmit}>
                {/* Email Input */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#d5a353', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Barber Gmail / Email Address:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="#d5a353" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      placeholder="e.g. subash@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(213,163,83,0.25)',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#d5a353', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Password:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#d5a353" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter Password *"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 44px 12px 42px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(213,163,83,0.25)',
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#d5a353', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8a7a6a', marginTop: '6px', textAlign: 'right' }}>
                    Demo Logins: <strong>subash@gmail.com</strong> / <strong>laxman@gmail.com</strong> / <strong>anup@gmail.com</strong> / <strong>kiran@gmail.com</strong> (Password: <code>barber123</code>)
                  </div>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #d5a353, #b8863b)',
                    color: '#191514',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    fontFamily: "'Teko', sans-serif",
                    letterSpacing: '1.5px',
                    cursor: loading ? 'wait' : 'pointer',
                    boxShadow: '0 4px 20px rgba(213,163,83,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  <KeyRound size={18} />
                  <span>{loading ? 'AUTHENTICATING BARBER...' : 'LOGIN TO DASHBOARD'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ====== STEP 2: AUTHENTICATED FULL BARBER DASHBOARD LAYOUT ====== */
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0d0c', position: 'relative' }}>
          {/* Dark Backdrop Overlay on Mobile when Sidebar Drawer is Open */}
          {isMobile && sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.82)',
                zIndex: 998,
                backdropFilter: 'blur(5px)',
              }}
            />
          )}

          {/* SIDEBAR NAVIGATION MENU */}
          <aside
            style={{
              position: isMobile ? 'fixed' : 'relative',
              left: isMobile ? (sidebarOpen ? 0 : -280) : 0,
              top: 0,
              bottom: 0,
              zIndex: isMobile ? 9999 : 10,
              width: sidebarOpen ? 260 : isMobile ? 0 : 76,
              minWidth: sidebarOpen ? 260 : isMobile ? 0 : 76,
              background: 'linear-gradient(180deg, #18130f 0%, #120e0b 100%)',
              borderRight: '1px solid rgba(213,163,83,0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
              boxShadow: isMobile && sidebarOpen ? '10px 0 40px rgba(0,0,0,0.9)' : 'none',
            }}
          >
            <div>
              {/* Sidebar Header Logo & Barber Avatar */}
              <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(213,163,83,0.12)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  onClick={() => { navigate('/'); if (isMobile) setSidebarOpen(false); }}
                  style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #d5a353', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', boxShadow: '0 0 12px rgba(213,163,83,0.3)' }}
                  title="Go to Homepage"
                >
                  <img src={activeTabBarber.image} alt={activeTabBarber.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                </div>
                {sidebarOpen && (
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ color: '#f9f6f2', fontSize: '0.95rem', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {activeTabBarber.name}
                    </div>
                    <div style={{ color: '#d5a353', fontSize: '0.72rem', fontWeight: 600 }}>{activeTabBarber.role}</div>
                  </div>
                )}
              </div>

              {/* Navigation Menu Items */}
              <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => { setActiveNavTab('dashboard'); if (isMobile) setSidebarOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: activeNavTab === 'dashboard' ? 'linear-gradient(135deg, #d5a353, #b8863b)' : 'transparent',
                    color: activeNavTab === 'dashboard' ? '#191514' : '#a89a8a',
                    fontWeight: activeNavTab === 'dashboard' ? 800 : 600,
                    border: 'none',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  <LayoutDashboard size={18} />
                  {sidebarOpen && <span>Dashboard & Queue</span>}
                </button>

                <button
                  onClick={() => { setActiveNavTab('queue'); if (isMobile) setSidebarOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: activeNavTab === 'queue' ? 'linear-gradient(135deg, #d5a353, #b8863b)' : 'transparent',
                    color: activeNavTab === 'queue' ? '#191514' : '#a89a8a',
                    fontWeight: activeNavTab === 'queue' ? 800 : 600,
                    border: 'none',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  <CalendarCheck size={18} />
                  {sidebarOpen && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>My Queue</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', background: activeNavTab === 'queue' ? 'rgba(0,0,0,0.3)' : 'rgba(213,163,83,0.15)', color: activeNavTab === 'queue' ? '#ffffff' : '#d5a353', fontWeight: 800 }}>
                        {pendingQueueCount}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => { setActiveNavTab('earnings'); if (isMobile) setSidebarOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: activeNavTab === 'earnings' ? 'linear-gradient(135deg, #d5a353, #b8863b)' : 'transparent',
                    color: activeNavTab === 'earnings' ? '#191514' : '#a89a8a',
                    fontWeight: activeNavTab === 'earnings' ? 800 : 600,
                    border: 'none',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  <TrendingUp size={18} />
                  {sidebarOpen && <span>Earnings & Stats</span>}
                </button>

                <button
                  onClick={() => { setActiveNavTab('profile'); if (isMobile) setSidebarOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: activeNavTab === 'profile' ? 'linear-gradient(135deg, #d5a353, #b8863b)' : 'transparent',
                    color: activeNavTab === 'profile' ? '#191514' : '#a89a8a',
                    fontWeight: activeNavTab === 'profile' ? 800 : 600,
                    border: 'none',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  <User size={18} />
                  {sidebarOpen && <span>My Profile</span>}
                </button>

                <div style={{ height: '1px', background: 'rgba(213,163,83,0.15)', margin: '8px 0' }} />

                <button
                  onClick={() => navigate('/')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#d5a353',
                    border: '1px solid rgba(213,163,83,0.2)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={16} />
                  {sidebarOpen && <span>Main Website</span>}
                </button>
              </nav>
            </div>

            {/* Sidebar Footer Lock Shift */}
            <div style={{ padding: '16px', borderTop: '1px solid rgba(213,163,83,0.12)' }}>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                }}
              >
                <LogOut size={16} />
                {sidebarOpen && <span>Lock Shift</span>}
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#0f0d0c' }}>
            {/* Top Bar Header */}
            <header
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '12px 14px' : '16px 24px',
                gap: isMobile ? '12px' : '16px',
                background: 'rgba(20,16,14,0.98)',
                borderBottom: '1px solid rgba(213,163,83,0.15)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 5,
              }}
            >
              {/* Top Row on Mobile / Main Header Left */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: isMobile ? '100%' : 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                      background: 'rgba(213,163,83,0.12)',
                      border: '1px solid rgba(213,163,83,0.3)',
                      borderRadius: '8px',
                      width: 38,
                      height: 38,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d5a353',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>

                  <div>
                    <div style={{ fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 800, color: '#f9f6f2', letterSpacing: '0.5px' }}>
                      {activeNavTab === 'dashboard' ? 'BARBER DASHBOARD' : activeNavTab === 'queue' ? 'MY CLIENT QUEUE' : activeNavTab === 'earnings' ? 'DAILY EARNINGS' : 'MY PROFILE'}
                    </div>
                    {!isMobile && (
                      <div style={{ fontSize: '0.75rem', color: '#8a7a6a' }}>Welcome, {activeTabBarber.name} · Khukuri Cut Barbershop</div>
                    )}
                  </div>
                </div>

                {/* Quick Lock & Sound buttons on Mobile top right */}
                {isMobile && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => playSweetDingSound()}
                      style={{ background: 'rgba(213,163,83,0.1)', border: '1px solid rgba(213,163,83,0.25)', borderRadius: '8px', color: '#d5a353', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                      title="Test Sound"
                    >
                      <Volume2 size={15} />
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                      title="Lock Shift"
                    >
                      <LogOut size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* 1-Tap Live Availability Status Control Row */}
              <div style={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', borderRadius: '24px', padding: '4px', border: '1px solid rgba(213,163,83,0.25)', width: '100%', justifyContent: 'space-around', gap: '4px' }}>
                  <button
                    onClick={() => handleStatusChange('available')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '20px',
                      border: 'none',
                      background: activeTabBarber.status === 'available' ? '#22c55e' : 'transparent',
                      color: activeTabBarber.status === 'available' ? '#120e0d' : '#22c55e',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    🟢 Available
                  </button>

                  <button
                    onClick={() => handleStatusChange('busy')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '20px',
                      border: 'none',
                      background: activeTabBarber.status === 'busy' ? '#ef4444' : 'transparent',
                      color: activeTabBarber.status === 'busy' ? '#ffffff' : '#ef4444',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    🔴 In Session
                  </button>

                  <button
                    onClick={() => handleStatusChange('off')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '20px',
                      border: 'none',
                      background: activeTabBarber.status === 'off' ? '#eab308' : 'transparent',
                      color: activeTabBarber.status === 'off' ? '#120e0d' : '#eab308',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    🟡 On Break
                  </button>
                </div>

                {!isMobile && (
                  <button
                    onClick={() => playSweetDingSound()}
                    style={{ marginLeft: '12px', background: 'rgba(213,163,83,0.08)', border: '1px solid rgba(213,163,83,0.2)', borderRadius: '10px', color: '#d5a353', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}
                    title="Test Chime Sound"
                  >
                    <Volume2 size={15} />
                    <span>Sound Bell</span>
                  </button>
                )}
              </div>
            </header>

            {/* TAB CONTENT VIEWS */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeNavTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeSlideUp 0.3s ease' }}>
                  {/* STATS ROW - 2x2 Grid on Mobile */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: isMobile ? '10px' : '16px' }}>
                    <div className="hover-card-lift" style={{ background: 'linear-gradient(145deg, #241c16, #18130f)', border: '1px solid rgba(213,163,83,0.25)', borderRadius: isMobile ? '12px' : '16px', padding: isMobile ? '12px 10px' : '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', color: '#a89a8a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed Cuts</span>
                        <div style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, borderRadius: '8px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Scissors size={isMobile ? 15 : 18} />
                        </div>
                      </div>
                      <div style={{ fontSize: isMobile ? '1.3rem' : '2rem', fontWeight: 800, color: '#22c55e' }}>{completedCutsCount} Cuts</div>
                      <div style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', color: '#6a5a4a', marginTop: '2px' }}>Satisfied clients</div>
                    </div>

                    <div className="hover-card-lift" style={{ background: 'linear-gradient(145deg, #241c16, #18130f)', border: '1px solid rgba(213,163,83,0.25)', borderRadius: isMobile ? '12px' : '16px', padding: isMobile ? '12px 10px' : '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', color: '#a89a8a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Queue</span>
                        <div style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, borderRadius: '8px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Clock size={isMobile ? 15 : 18} />
                        </div>
                      </div>
                      <div style={{ fontSize: isMobile ? '1.3rem' : '2rem', fontWeight: 800, color: '#f59e0b' }}>{pendingQueueCount} Clients</div>
                      <div style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', color: '#6a5a4a', marginTop: '2px' }}>Next in line</div>
                    </div>

                    <div className="hover-card-lift" style={{ background: 'linear-gradient(145deg, #241c16, #18130f)', border: '1px solid rgba(213,163,83,0.25)', borderRadius: isMobile ? '12px' : '16px', padding: isMobile ? '12px 10px' : '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', color: '#a89a8a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Est. Revenue</span>
                        <div style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, borderRadius: '8px', background: 'rgba(213,163,83,0.15)', color: '#d5a353', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <TrendingUp size={isMobile ? 15 : 18} />
                        </div>
                      </div>
                      <div style={{ fontSize: isMobile ? '1.3rem' : '2rem', fontWeight: 800, color: '#d5a353' }}>Rs {estEarnings.toLocaleString()}</div>
                      <div style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', color: '#6a5a4a', marginTop: '2px' }}>Today's value</div>
                    </div>

                    <div className="hover-card-lift" style={{ background: 'linear-gradient(145deg, #241c16, #18130f)', border: '1px solid rgba(213,163,83,0.25)', borderRadius: isMobile ? '12px' : '16px', padding: isMobile ? '12px 10px' : '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', color: '#a89a8a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Barber Rating</span>
                        <div style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, borderRadius: '8px', background: 'rgba(234,179,8,0.15)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Star size={isMobile ? 15 : 18} />
                        </div>
                      </div>
                      <div style={{ fontSize: isMobile ? '1.3rem' : '2rem', fontWeight: 800, color: '#eab308' }}>{activeTabBarber.rating || 4.9} ★</div>
                      <div style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', color: '#6a5a4a', marginTop: '2px' }}>{activeTabBarber.totalCuts || 1200}+ cuts</div>
                    </div>
                  </div>

                  {/* ACTIVE CHAIR CLIENT HERO CARD */}
                  {activeChairClient ? (
                    <div style={{ background: 'linear-gradient(135deg, #2a2016, #1b140e)', border: '2px solid #d5a353', borderRadius: '18px', padding: '20px', boxShadow: '0 12px 40px rgba(0,0,0,0.7)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(213,163,83,0.2)', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulseGlow 1.5s infinite' }} />
                          <span style={{ color: '#d5a353', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                            💈 CLIENT CURRENTLY IN CHAIR / NEXT IN LINE
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid #f59e0b', fontWeight: 700 }}>
                          PENDING CUT
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <div style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 800 }}>{activeChairClient.name}</div>
                          <div style={{ color: '#d5a353', fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>✂️ {activeChairClient.service}</div>
                          <div style={{ color: '#a89a8a', fontSize: '0.82rem', marginTop: '6px' }}>📅 {activeChairClient.date} · ⏰ {activeChairClient.time}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? '12px' : 0 }}>
                          <a
                            href={`tel:${activeChairClient.phone}`}
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              background: 'rgba(34,197,94,0.12)',
                              border: '1px solid rgba(34,197,94,0.4)',
                              color: '#22c55e',
                              borderRadius: '10px',
                              padding: '10px 16px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Phone size={15} />
                            <span>Call {activeChairClient.phone}</span>
                          </a>

                          <button
                            onClick={() => handleAppointmentStatus(activeChairClient.id, 'completed')}
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              background: 'linear-gradient(135deg, #22c55e, #15803d)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '10px 18px',
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <CheckCircle size={16} />
                            <span>MARK DONE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(28,22,18,0.95)', border: '1px solid rgba(213,163,83,0.18)', borderRadius: '18px', padding: '24px', textAlign: 'center', color: '#6a5a4a' }}>
                      🟢 Chair is clear! No active clients waiting right now.
                    </div>
                  )}

                  {/* RECENT QUEUE LIST TABLE */}
                  <div style={{ background: 'rgba(28,22,18,0.95)', border: '1px solid rgba(213,163,83,0.18)', borderRadius: '18px', padding: isMobile ? '16px 12px' : '20px' }}>
                    <div style={{ color: '#d5a353', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} />
                      <span>YOUR CLIENT QUEUE LIST ({appointments.length})</span>
                    </div>

                    {isMobile ? (
                      /* MOBILE CARD LIST VIEW */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {appointments.map((appt) => (
                          <div
                            key={appt.id}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(213,163,83,0.15)',
                              borderRadius: '12px',
                              padding: '14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ color: '#f9f6f2', fontWeight: 800, fontSize: '1rem' }}>{appt.name}</div>
                                <div style={{ color: '#d5a353', fontSize: '0.82rem', fontWeight: 700, marginTop: '2px' }}>✂️ {appt.service}</div>
                                <div style={{ color: '#8a7a6a', fontSize: '0.78rem', marginTop: '4px' }}>📅 {appt.date} · ⏰ {appt.time}</div>
                              </div>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  background: appt.status === 'pending' ? 'rgba(245,158,11,0.15)' : appt.status === 'confirmed' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)',
                                  color: appt.status === 'pending' ? '#f59e0b' : appt.status === 'confirmed' ? '#3b82f6' : '#22c55e',
                                  border: '1px solid currentColor',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {appt.status.toUpperCase()}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              <a
                                href={`tel:${appt.phone}`}
                                style={{
                                  flex: 1,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  background: 'rgba(34,197,94,0.12)',
                                  border: '1px solid rgba(34,197,94,0.4)',
                                  color: '#22c55e',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  fontSize: '0.8rem',
                                  textDecoration: 'none',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <Phone size={14} />
                                <span>Call</span>
                              </a>

                              <button
                                onClick={() => handleAppointmentStatus(appt.id, 'completed')}
                                style={{
                                  flex: 1,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  background: 'linear-gradient(135deg, #22c55e, #15803d)',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <CheckCircle size={15} />
                                <span>Mark Done</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* DESKTOP TABLE VIEW */
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(213,163,83,0.12)' }}>
                              {['Client', 'Service', 'Date & Time', 'Status', 'Actions'].map((h) => (
                                <th key={h} style={{ color: '#6a5a4a', fontSize: '0.75rem', padding: '10px 14px', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {appointments.map((appt) => (
                              <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                  <div style={{ color: '#f9f6f2', fontWeight: 700, fontSize: '0.92rem' }}>{appt.name}</div>
                                  <div style={{ color: '#6a5a4a', fontSize: '0.78rem' }}>{appt.phone}</div>
                                </td>
                                <td style={{ padding: '12px 14px', color: '#d5a353', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                  {appt.service}
                                </td>
                                <td style={{ padding: '12px 14px', color: '#d8cfc4', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                  {appt.date} · {appt.time}
                                </td>
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: appt.status === 'pending' ? 'rgba(245,158,11,0.15)' : appt.status === 'confirmed' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)', color: appt.status === 'pending' ? '#f59e0b' : appt.status === 'confirmed' ? '#3b82f6' : '#22c55e', border: '1px solid currentColor' }}>
                                    {appt.status.toUpperCase()}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <a href={`tel:${appt.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.12)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>
                                      <Phone size={13} />
                                      <span>Call</span>
                                    </a>
                                    <button onClick={() => handleAppointmentStatus(appt.id, 'completed')} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #22c55e, #15803d)', border: 'none', color: '#ffffff', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                                      <CheckCircle size={13} />
                                      <span>Done</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MY QUEUE */}
              {activeNavTab === 'queue' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeSlideUp 0.3s ease' }}>
                  <div style={{ background: 'rgba(28,22,18,0.95)', border: '1px solid rgba(213,163,83,0.18)', borderRadius: '18px', padding: '20px' }}>
                    <div style={{ color: '#d5a353', fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>FULL ASSIGNED QUEUE</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {appointments.map((appt) => (
                        <div key={appt.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(213,163,83,0.15)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <div style={{ color: '#f9f6f2', fontSize: '1.05rem', fontWeight: 800 }}>{appt.name}</div>
                            <div style={{ color: '#d5a353', fontSize: '0.88rem', fontWeight: 700, marginTop: '2px' }}>✂️ {appt.service}</div>
                            <div style={{ color: '#a89a8a', fontSize: '0.8rem', marginTop: '4px' }}>📅 {appt.date} · ⏰ {appt.time} · 📞 {appt.phone}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? '8px' : 0 }}>
                            <a
                              href={`tel:${appt.phone}`}
                              style={{
                                flex: isMobile ? 1 : 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                background: 'rgba(34,197,94,0.12)',
                                border: '1px solid rgba(34,197,94,0.4)',
                                color: '#22c55e',
                                borderRadius: '8px',
                                padding: '8px 14px',
                                fontSize: '0.82rem',
                                textDecoration: 'none',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Phone size={14} />
                              <span>Call</span>
                            </a>

                            <button
                              onClick={() => handleAppointmentStatus(appt.id, 'completed')}
                              style={{
                                flex: isMobile ? 1 : 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                background: 'linear-gradient(135deg, #22c55e, #15803d)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <CheckCircle size={15} />
                              <span>Mark Done</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EARNINGS & STATS */}
              {activeNavTab === 'earnings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeSlideUp 0.3s ease' }}>
                  <div style={{ background: 'linear-gradient(145deg, #241c16, #18130f)', border: '1px solid #d5a353', borderRadius: '18px', padding: '24px' }}>
                    <div style={{ color: '#d5a353', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                      DAILY SUMMARY ESTIMATE
                    </div>
                    <div style={{ color: '#22c55e', fontSize: '2.4rem', fontWeight: 800 }}>Rs {estEarnings.toLocaleString()}</div>
                    <div style={{ color: '#a89a8a', fontSize: '0.85rem', marginTop: '6px' }}>Total estimated revenue generated across {completedCutsCount} completed cuts today.</div>
                  </div>
                </div>
              )}

              {/* TAB 4: MY PROFILE & SETTINGS */}
              {activeNavTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeSlideUp 0.3s ease' }}>
                  <div style={{ background: 'linear-gradient(145deg, #241c16, #18130f)', border: '1px solid rgba(213,163,83,0.25)', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start', textAlign: isMobile ? 'center' : 'left', gap: '20px' }}>
                    <img src={activeTabBarber.image} alt={activeTabBarber.name} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: '3px solid #d5a353', boxShadow: '0 0 20px rgba(213,163,83,0.4)', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden', width: '100%' }}>
                      <div style={{ color: '#f9f6f2', fontSize: '1.4rem', fontWeight: 800 }}>{activeTabBarber.name}</div>
                      <div style={{ color: '#d5a353', fontSize: '0.9rem', fontWeight: 700, marginTop: '2px' }}>{activeTabBarber.role}</div>
                      <div style={{ color: '#a89a8a', fontSize: '0.82rem', marginTop: '10px', wordBreak: 'break-word', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>📧 Gmail: <span style={{ color: '#ffffff', fontWeight: 600 }}>{activeTabBarber.email}</span></div>
                        <div>📞 Phone: <span style={{ color: '#ffffff', fontWeight: 600 }}>{activeTabBarber.phone}</span></div>
                        <div>⭐ Experience: <span style={{ color: '#d5a353', fontWeight: 600 }}>{activeTabBarber.experience}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* TOAST ALERT WHEN NEW BOOKING ARRIVES ON PHONE */}
      {toastAlert && (
        <div style={toastPopupStyle}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #d5a353, #b8863b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(213,163,83,0.5)' }}>
            <Bell size={22} color="#191514" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d5a353', letterSpacing: '0.8px' }}>
              🔔 NEW BOOKING RECEIVED!
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f9f6f2', marginTop: '2px' }}>
              {toastAlert.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a89a8a' }}>
              Booked: <span style={{ color: '#d5a353', fontWeight: 700 }}>{toastAlert.service}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const toastPopupStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  right: '20px',
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
  maxWidth: '420px',
};
