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
} from 'lucide-react';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/appointments', label: 'Appointments', icon: CalendarCheck },
  { path: '/admin/services', label: 'Services', icon: Scissors },
  { path: '/admin/staff', label: 'Staff', icon: Users },
  { path: '/admin/products', label: 'Products', icon: ShoppingBag },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem('kc_admin_auth');
    if (!auth) {
      navigate('/admin');
    }
  }, [navigate]);

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
          {sidebarOpen && (
            <div style={styles.logoWrap}>
              <div style={styles.logoIcon}>
                <Scissors size={18} color="#191514" />
              </div>
              <div>
                <div style={styles.logoTitle}>KHUKURI CUT</div>
                <div style={styles.logoSub}>Admin Panel</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.toggleBtn}
          >
            {sidebarOpen ? <X size={18} color="#d5a353" /> : <Menu size={18} color="#d5a353" />}
          </button>
        </div>

        <div style={styles.divider} />

        {/* Nav Items */}
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
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
                }}
              >
                <item.icon size={20} />
                {sidebarOpen && (
                  <>
                    <span style={styles.navLabel}>{item.label}</span>
                    {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

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
          <div style={styles.adminBadge}>
            <div style={styles.adminAvatar}>A</div>
            <div>
              <div style={{ color: '#f9f6f2', fontSize: '0.85rem', fontWeight: 600 }}>Admin</div>
              <div style={{ color: '#8a7a6a', fontSize: '0.72rem' }}>Super User</div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0b0a; }
        ::-webkit-scrollbar-thumb { background: rgba(213,163,83,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
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
