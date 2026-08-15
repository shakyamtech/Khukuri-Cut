import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, Scissors, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onBookClick: () => void;
  cartCount: number;
}

export const KhukuriBarberLogo: React.FC<{ size?: number }> = ({ size = 135 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Dashed Golden Badge Ring */}
    <circle cx="100" cy="100" r="92" stroke="#d5a353" strokeWidth="2.5" strokeDasharray="6 4"/>
    <circle cx="100" cy="100" r="82" stroke="#d5a353" strokeWidth="1.5"/>

    {/* Center Emblem: Barber Scissors & Razor Blade */}
    <g transform="translate(0, -6)">
      {/* Barber Scissors */}
      <path d="M 68 138 C 68 147 60 154 50 154 C 40 154 32 147 32 138 C 32 129 40 122 50 122 C 55 122 60 124 63 128 L 95 90 L 63 52 C 60 56 55 58 50 58 C 40 58 32 51 32 42 C 32 33 40 26 50 26 C 60 26 68 33 68 42 C 68 47 66 51 63 54 L 100 95 L 137 54 C 134 51 132 47 132 42 C 132 33 140 26 150 26 C 160 26 168 33 168 42 C 168 51 160 58 150 58 C 145 58 140 56 137 52 L 105 90 L 137 128 C 140 124 145 122 150 122 C 160 122 168 129 168 138 C 168 147 160 154 150 154 C 140 154 132 147 132 138 C 132 133 134 129 137 126 L 100 85 L 63 126 C 66 129 68 133 68 138 Z" fill="#d5a353"/>
    </g>

    {/* ESTD 2024 Arching Ribbon Text */}
    <path id="curve" d="M 45 152 A 75 75 0 0 0 155 152" fill="transparent"/>
    <text fill="#d5a353" fontSize="11" fontWeight="700" letterSpacing="3">
      <textPath href="#curve" startOffset="50%" textAnchor="middle">
        ESTD · KATHMANDU · 2024
      </textPath>
    </text>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenMenu,
  onOpenSearch,
  onBookClick,
  cartCount,
}) => {
  const navigate = useNavigate();

  return (
    <header className="site_header">
      <div className="top_panel_inner">
        {/* Navigation Top Bar */}
        <div className="header_nav_bar">
          <div className="logo_brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <KhukuriBarberLogo size={55} />
            <div className="logo_text">KHUKURI CUT</div>
          </div>

          <div className="nav_right_actions">
            <button
              className="nav_action_btn"
              onClick={() => navigate('/barber')}
              title="Barber Mobile Portal"
              style={{ borderColor: 'rgba(213,163,83,0.35)', background: 'rgba(213,163,83,0.1)' }}
            >
              <Scissors size={18} color="#d5a353" />
            </button>
            <button className="nav_action_btn" onClick={onOpenSearch} title="Search">
              <Search size={20} />
            </button>
            <button className="nav_action_btn" onClick={onOpenCart} title="View Cart">
              <ShoppingCart size={20} />
              <span className="cart_badge_count">{cartCount}</span>
            </button>
            <button className="menu_toggle_icon" onClick={onOpenMenu} title="Menu">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Hero Central Content */}
        <div className="hero_content">
          <div className="hero_badge_logo">
            <KhukuriBarberLogo size={150} />
          </div>

          <h1 className="hero_title">PREMIUM BARBERSHOP</h1>
          <p className="hero_subtitle">
            The prime spot for your hair grooming & tattoo needs in Durbar Marg, Kathmandu
          </p>

          <button className="sc_button" onClick={onBookClick}>
            <ChevronDown size={20} />
            <span>MAKE AN APPOINTMENT</span>
          </button>
        </div>

        {/* Header Info Columns */}
        <div className="content_wrap">
          <div className="header_info_bar">
            <div className="info_col">
              <h5>ADDRESS</h5>
              <p>Durbar Marg, Kathmandu, Nepal 44600</p>
            </div>
            <div className="info_col">
              <h5>CALL US</h5>
              <a href="tel:+97714220000">+977 1-4220000 / 9851000000</a>
              <p style={{ fontSize: '0.85rem', color: '#d5a353' }}>FOR BOOKINGS</p>
            </div>
            <div className="info_col">
              <h5>HOURS</h5>
              <p>Mon - Sat: 11:00 AM – 9:00 PM</p>
              <p>Sunday: 11:00 AM – 7:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
