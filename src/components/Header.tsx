import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, ChevronDown, User } from 'lucide-react';

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
      <g stroke="#d5a353" fill="#d5a353">
        {/* Left Scissor Loop & Shank */}
        <circle cx="64" cy="132" r="10" fill="none" strokeWidth="3"/>
        <path d="M54 137 Q 48 143 44 145" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M70 122 C 73 112, 85 103, 97 93 L 138 52 C 141 49, 143 51, 139 55 L 98 95 L 74 122 Z" strokeWidth="0.5"/>

        {/* Right Scissor Loop & Shank */}
        <circle cx="136" cy="132" r="10" fill="none" strokeWidth="3"/>
        <path d="M130 122 C 127 112, 115 103, 103 93 L 62 52 C 59 49, 57 51, 61 55 L 102 95 L 126 122 Z" strokeWidth="0.5"/>

        {/* Screw Pivot */}
        <circle cx="100" cy="93" r="4.5" fill="#191514" stroke="#d5a353" strokeWidth="2"/>
      </g>

      {/* Straight Razor Blade in Center */}
      <g fill="#d5a353">
        <path d="M 95 46 L 105 46 L 105 120 L 95 120 Z" opacity="0.9"/>
        <rect x="97" y="54" width="6" height="32" rx="3" fill="#191514"/>
        <circle cx="100" cy="97" r="3" fill="#191514"/>
      </g>
    </g>

    {/* Side Stars */}
    <path d="M 32 96 L 34 91 L 39 91 L 35 87 L 37 82 L 32 85 L 27 82 L 29 87 L 25 91 L 30 91 Z" fill="#d5a353"/>
    <path d="M 168 96 L 170 91 L 175 91 L 171 87 L 173 82 L 168 85 L 163 82 L 165 87 L 161 91 L 166 91 Z" fill="#d5a353"/>

    {/* Premium Gold Ribbon Banner at Bottom for KHUKURI CUT */}
    <g transform="translate(0, 160)">
      <rect x="25" y="-13" width="150" height="26" rx="4" fill="#191514" stroke="#d5a353" strokeWidth="2"/>
      <text x="100" y="4" fill="#d5a353" fontSize="16" fontFamily="Teko" letterSpacing="4" fontWeight="bold" textAnchor="middle">
        KHUKURI CUT
      </text>
    </g>
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
    <header className="top_panel" style={{ backgroundImage: "url('/images/hero_bg.png')" }} id="home">
      <div className="top_panel_overlay"></div>
      <div className="top_panel_inner">
        {/* Navigation Top Bar */}
        <div className="header_nav_bar">
          <div className="logo_brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <KhukuriBarberLogo size={55} />
            <div className="logo_text">KHUKURI CUT</div>
          </div>

          <div className="nav_right_actions">
            <button className="nav_action_btn" onClick={() => navigate('/barber')} title="Barber & Staff Portal">
              <User size={20} />
            </button>
            <button className="nav_action_btn" onClick={onOpenSearch} title="Search">
              <Search size={20} />
            </button>
            <button className="nav_action_btn cart_btn_wrap" onClick={onOpenCart} title="View Cart" style={{ position: 'relative' }}>
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
