import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Scissors,
  Users,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Bell,
  Volume2,
} from 'lucide-react';
import {
  playSweetDingSound,
  playCashRegisterSound,
  APPOINTMENT_EVENT_CREATED,
  APPOINTMENT_EVENT_UPDATED,
  APPOINTMENT_EVENT_CUT_COMPLETED,
  adminChannel,
} from '../../utils/audioAlert';
import type { Appointment } from './AdminDashboard';

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: 'd1', name: 'Aarav Sharma', email: 'aarav@gmail.com', phone: '9841000001', date: '2025-08-15', time: '11:00 AM', service: 'HAIRCUTTING', notes: '', status: 'confirmed', submittedAt: '2025-08-13T10:00:00Z' },
  { id: 'd2', name: 'Bishal Thapa', email: 'bishal@gmail.com', phone: '9841000002', date: '2025-08-15', time: '01:30 PM', service: 'SHAVING', notes: 'Hot towel only', status: 'pending', submittedAt: '2025-08-13T10:30:00Z' },
  { id: 'd3', name: 'Sunil Karki', email: 'sunil@gmail.com', phone: '9841000003', date: '2025-08-16', time: '03:00 PM', service: 'HAIRCUT + SHAVE', notes: '', status: 'completed', submittedAt: '2025-08-13T11:00:00Z' },
  { id: 'd4', name: 'Manish KC', email: 'manish@gmail.com', phone: '9841000004', date: '2025-08-16', time: '05:00 PM', service: 'STYLING', notes: 'Pompadour style', status: 'pending', submittedAt: '2025-08-13T11:30:00Z' },
  { id: 'd5', name: 'Ramesh Basnet', email: 'ramesh@gmail.com', phone: '9841000005', date: '2025-08-17', time: '07:00 PM', service: 'TRIMMING', notes: '', status: 'cancelled', submittedAt: '2025-08-13T12:00:00Z' },
  { id: 'd6', name: 'Dipesh Gurung', email: 'dipesh@gmail.com', phone: '9841000006', date: '2025-08-18', time: '12:00 PM', service: 'HAIRCUTTING', notes: 'Fade cut', status: 'pending', submittedAt: '2025-08-13T13:00:00Z' },
];

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/appointments', label: 'Appointments', icon: CalendarCheck },
  { path: '/admin/services', label: 'Services', icon: Scissors },
  { path: '/admin/staff', label: 'Staff', icon: Users },
  { path: '/admin/products', label: 'Products', icon: ShoppingBag },
];

interface AppointmentToast {
  name: string;
  service: string;
}

interface PaymentToast {
  name: string;
  service: string;
  barber?: string;
}

function getPendingCount(): number {
  try {
    const saved = localStorage.getItem('kc_appointments');
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((a: Appointment) => a.status === 'pending').length;
      }
    }
    return DEMO_APPOINTMENTS.filter((a) => a.status === 'pending').length;
  } catch (e) {
    console.error('Error parsing appointments count', e);
    return 0;
  }
}

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState<number>(getPendingCount);
  const [toastAlert, setToastAlert] = useState<AppointmentToast | null>(null);
  const [paymentAlert, setPaymentAlert] = useState<PaymentToast | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('kc_admin_auth');
    if (!auth) {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getPendingCount());
    };

    const triggerAlert = (name: string, service: string) => {
      updateCount();
      playSweetDingSound();
      setToastAlert({ name, service });
      setTimeout(() => setToastAlert(null), 4500);
    };

    const triggerPaymentAlert = (name: string, service: string, barber?: string) => {
      updateCount();
      playCashRegisterSound();
      setPaymentAlert({ name, service, barber });
      setTimeout(() => setPaymentAlert(null), 7000);
    };

    const handleNewAppointment = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      triggerAlert(detail?.name || 'New Client', detail?.service || 'Appointment');
    };

    const handleCutCompleted = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      triggerPaymentAlert(detail?.name || 'Client', detail?.service || 'Haircut', detail?.barber);
    };

    // Listen to Cross-Tab BroadcastChannel messages (from Barber portal & Customer booking tab)
    if (adminChannel) {
      adminChannel.onmessage = (evt) => {
        if (evt.data?.type === 'NEW_BOOKING') {
          const appt = evt.data.appointment;
          triggerAlert(appt?.name || 'New Client', appt?.service || 'Appointment');
        } else if (evt.data?.type === 'CUT_COMPLETED') {
          const appt = evt.data.appointment;
          triggerPaymentAlert(appt?.name || 'Client', appt?.service || 'Haircut', appt?.barber);
        }
      };
    }

    window.addEventListener(APPOINTMENT_EVENT_CREATED, handleNewAppointment);
    window.addEventListener(APPOINTMENT_EVENT_CUT_COMPLETED, handleCutCompleted);
    window.addEventListener(APPOINTMENT_EVENT_UPDATED, updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      if (adminChannel) {
        adminChannel.onmessage = null;
      }
      window.removeEventListener(APPOINTMENT_EVENT_CREATED, handleNewAppointment);
      window.removeEventListener(APPOINTMENT_EVENT_CUT_COMPLETED, handleCutCompleted);
      window.removeEventListener(APPOINTMENT_EVENT_UPDATED, updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('kc_admin_auth');
    navigate('/admin');
  };

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarOpen ? 260 : 70,
          minWidth: sidebarOpen ? 260 : 70,
        }}
      >
        {/* Sidebar Header */}
        <div style={styles.sidebarHeader}>
          <div
            onClick={() => navigate('/')}
            style={{ ...styles.logoWrap, cursor: 'pointer', flex: 1 }}
            title="Go to Main Salon Homepage"
          >
            <div style={styles.logoIcon}>
              <Scissors size={18} color="#191514" />
            </div>
            {sidebarOpen && (
              <div>
                <div style={styles.logoTitle}>KHUKURI CUT</div>
                <div style={styles.logoSub}>Admin Panel · 🏠 Home</div>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.toggleBtn}
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {sidebarOpen ? <X size={18} color="#d5a353" /> : <Menu size={18} color="#d5a353" />}
          </button>
        </div>

        <div style={styles.divider} />

        {/* Nav Items */}
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const isAppointments = item.path === '/admin/appointments';

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={!sidebarOpen ? item.label : undefined}
                style={{
                  ...styles.navItem,
                  background: active ? 'rgba(213,163,83,0.15)' : 'transparent',
                  borderLeft: active ? '3px solid #d5a353' : '3px solid transparent',
                  color: active ? '#d5a353' : '#8a7a6a',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <item.icon size={20} />
                  {isAppointments && pendingCount > 0 && !sidebarOpen && (
                    <span style={collapsedBadgeStyle}>{pendingCount}</span>
                  )}
                </div>

                {sidebarOpen && (
                  <>
                    <span style={styles.navLabel}>{item.label}</span>
                    {isAppointments && pendingCount > 0 && (
                      <span style={expandedBadgeStyle}>
                        {pendingCount}
                      </span>
                    )}
                    {active && !isAppointments && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Sound Test / Manual Chime Trigger */}
        {sidebarOpen && (
          <div style={{ padding: '0 16px 10px' }}>
            <button
              onClick={() => playSweetDingSound()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(213,163,83,0.08)',
                border: '1px solid rgba(213,163,83,0.2)',
                borderRadius: '8px',
                color: '#d5a353',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              title="Test Sound Alert"
            >
              <Volume2 size={14} />
              <span>Test Bell Chime Sound</span>
            </button>
          </div>
        )}

        {/* Logout */}
        <div style={{ padding: '16px' }}>
          <button
            onClick={handleLogout}
            style={{
              ...styles.logoutBtn,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div>
            <div style={styles.topBarTitle}>
              {navItems.find((n) => n.path === location.pathname)?.label ?? 'Admin'}
            </div>
            <div style={styles.topBarSub}>Khukuri Cut · Durbar Marg, Kathmandu</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Quick Pending Alert Badge in Top Bar */}
            {pendingCount > 0 && (
              <div
                onClick={() => navigate('/admin/appointments')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  animation: 'pulseGlow 2s infinite',
                }}
              >
                <Bell size={15} color="#f59e0b" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>
                  {pendingCount} Pending Bookings
                </span>
              </div>
            )}

            <div style={styles.adminBadge}>
              <div style={styles.adminAvatar}>A</div>
              <div>
                <div style={{ color: '#f9f6f2', fontSize: '0.85rem', fontWeight: 600 }}>Admin</div>
                <div style={{ color: '#8a7a6a', fontSize: '0.72rem' }}>Super User</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>

      {/* Toast Notification Popup when New Appointment Arrives */}
      {toastAlert && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
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
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d5a353, #b8863b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(213,163,83,0.5)',
            }}
          >
            <Bell size={22} color="#191514" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d5a353', letterSpacing: '1px', textTransform: 'uppercase' }}>
              🔔 NEW BOOKING RECEIVED!
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f9f6f2', marginTop: '2px' }}>
              {toastAlert.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a89a8a' }}>
              Booked: <span style={{ color: '#d5a353', fontWeight: 600 }}>{toastAlert.service}</span>
            </div>
          </div>
        </div>
      )}

      {/* Cash Register Payment Alert Popup when Barber Marks Cut Completed */}
      {paymentAlert && (
        <div
          onClick={() => navigate('/admin/appointments')}
          style={{
            position: 'fixed',
            top: '84px',
            right: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #1c2b18, #111e0e)',
            border: '2px solid #22c55e',
            boxShadow: '0 12px 40px rgba(0,0,0,0.9), 0 0 30px rgba(34,197,94,0.4)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            animation: 'fadeSlideUp 0.35s ease',
            maxWidth: '420px',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(34,197,94,0.6)',
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>💰</span>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#22c55e', letterSpacing: '1px', textTransform: 'uppercase' }}>
              💰 GUEST READY FOR PAYMENT AT COUNTER!
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              {paymentAlert.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a89a8a' }}>
              Barber: <strong style={{ color: '#d5a353' }}>{paymentAlert.barber || 'Master Barber'}</strong> · Service: <strong style={{ color: '#22c55e' }}>{paymentAlert.service}</strong>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0b0a; }
        ::-webkit-scrollbar-thumb { background: rgba(213,163,83,0.3); border-radius: 3px; }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

/* Styles */
const expandedBadgeStyle: React.CSSProperties = {
  marginLeft: 'auto',
  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
  color: '#191514',
  fontSize: '0.72rem',
  fontWeight: 800,
  padding: '2px 8px',
  borderRadius: '12px',
  boxShadow: '0 0 10px rgba(245,158,11,0.4)',
  lineHeight: 1.3,
};

const collapsedBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-6px',
  right: '-8px',
  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
  color: '#191514',
  fontSize: '0.65rem',
  fontWeight: 800,
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 8px rgba(245,158,11,0.5)',
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f0d0c',
    fontFamily: "'Outfit', sans-serif",
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, #1a1410 0%, #15120f 100%)',
    borderRight: '1px solid rgba(213,163,83,0.12)',
    transition: 'width 0.3s ease, min-width 0.3s ease',
    overflow: 'hidden',
    position: 'sticky',
    top: 0,
    height: '100vh',
    flexShrink: 0,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 16px',
    minHeight: 70,
    gap: 10,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflow: 'hidden',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d5a353, #c4893f)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 0 15px rgba(213,163,83,0.3)',
  },
  logoTitle: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: '#d5a353',
    letterSpacing: '0.12em',
    whiteSpace: 'nowrap',
  },
  logoSub: {
    fontSize: '0.65rem',
    color: '#6a5a4a',
    letterSpacing: '0.15em',
    whiteSpace: 'nowrap',
  },
  toggleBtn: {
    background: 'rgba(213,163,83,0.08)',
    border: '1px solid rgba(213,163,83,0.15)',
    borderRadius: '8px',
    width: 34,
    height: 34,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  divider: {
    height: '1px',
    background: 'rgba(213,163,83,0.1)',
    margin: '0 16px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 8px',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.88rem',
    fontWeight: 500,
    transition: 'all 0.2s',
    width: '100%',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  navLabel: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    background: 'rgba(255,80,80,0.08)',
    border: '1px solid rgba(255,80,80,0.15)',
    borderRadius: '10px',
    color: '#ff6b6b',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 500,
    width: '100%',
    justifyContent: 'flex-start',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 28px',
    background: 'rgba(20,16,14,0.9)',
    borderBottom: '1px solid rgba(213,163,83,0.1)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  topBarTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#f9f6f2',
    letterSpacing: '0.05em',
  },
  topBarSub: {
    fontSize: '0.72rem',
    color: '#6a5a4a',
    marginTop: '2px',
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  adminAvatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d5a353, #c4893f)',
    color: '#191514',
    fontWeight: 800,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(213,163,83,0.3)',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '28px',
  },
};
