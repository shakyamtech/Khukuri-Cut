import React from 'react';
import { ShoppingCart, Search, Menu, ChevronDown } from 'lucide-react';

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
    <circle cx="100" cy="100" r="92" stroke="#d5a353" strokeWidth="3" strokeDasharray="6 4"/>
    <circle cx="100" cy="100" r="81" stroke="#d5a353" strokeWidth="1.5"/>

    {/* Barber Scissors (Positioned centrally with clean clearance for text above & below) */}
    <g fill="#d5a353" stroke="#d5a353">
      {/* Left Scissor Finger Loop & Shank */}
      <circle cx="68" cy="126" r="10" fill="none" strokeWidth="3"/>
      <path d="M58 131 Q 53 137 49 139" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M72 117 C 75 107, 85 98, 97 88 L 138 46 C 141 43, 143 45, 139 49 L 98 90 C 86 100, 78 107, 76 117 Z" strokeWidth="0.5"/>

      {/* Right Scissor Finger Loop & Shank */}
      <circle cx="132" cy="126" r="10" fill="none" strokeWidth="3"/>
      <path d="M128 117 C 125 107, 115 98, 103 88 L 62 46 C 59 43, 57 45, 61 49 L 102 90 C 114 100, 122 107, 124 117 Z" strokeWidth="0.5"/>

      {/* Center Pivot Screw Pin */}
      <circle cx="100" cy="88" r="4.5" fill="#191514" stroke="#d5a353" strokeWidth="2"/>
    </g>

    {/* Straight Razor Blade (Barber Razor Blade in Center) */}
    <g fill="#d5a353">
      {/* Outer Razor Body */}
      <path d="M 95 42 L 105 42 L 105 118 L 95 118 Z" opacity="0.9"/>
      {/* Razor Blade Slot & Cutout */}
      <rect x="97" y="50" width="6" height="32" rx="3" fill="#191514"/>
      <circle cx="100" cy="92" r="3" fill="#191514"/>
    </g>

    {/* Decorative Stars */}
    <path d="M 38 90 L 40 85 L 45 85 L 41 81 L 43 76 L 38 79 L 33 76 L 35 81 L 31 85 L 36 85 Z" fill="#d5a353"/>
    <path d="M 162 90 L 164 85 L 169 85 L 165 81 L 167 76 L 162 79 L 157 76 L 159 81 L 155 85 L 160 85 Z" fill="#d5a353"/>

    {/* Top Text Arch (Cleanly spaced above scissor tips) */}
    <path id="topArch" d="M 38 92 A 64 64 0 0 1 162 92" fill="none" />
    <text fill="#d5a353" fontSize="13" fontFamily="Teko" letterSpacing="3.5" textAnchor="middle">
      <textPath href="#topArch" startOffset="50%">BARBERSHOP &amp; TATTOO</textPath>
    </text>

    {/* Bottom Text Arch (Cleanly spaced below scissor handles, 0% overlap) */}
    <path id="bottomArch" d="M 32 138 A 66 66 0 0 0 168 138" fill="none" />
    <text fill="#d5a353" fontSize="16" fontFamily="Teko" letterSpacing="3" fontWeight="bold" textAnchor="middle">
      <textPath href="#bottomArch" startOffset="50%">KHUKURI CUT</textPath>
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
  return (
    <header className="top_panel" style={{ backgroundImage: "url('/images/hero_bg.png')" }} id="home">
      <div className="top_panel_overlay"></div>
      <div className="top_panel_inner">
        {/* Navigation Top Bar */}
        <div className="header_nav_bar">
          <div className="logo_brand">
            <KhukuriBarberLogo size={55} />
            <div className="logo_text">KHUKURI CUT</div>
          </div>

          <div className="nav_right_actions">
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
