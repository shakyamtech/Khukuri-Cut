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
    <circle cx="100" cy="100" r="82" stroke="#d5a353" strokeWidth="1.5"/>

    {/* Barber Scissors (Real Kainchi with connected Finger Rings & Blades) */}
    <g fill="#d5a353" stroke="#d5a353">
      {/* Left Scissor Finger Loop & Shank */}
      <circle cx="58" cy="145" r="12" fill="none" strokeWidth="3.5"/>
      <path d="M47 151 Q 42 158 38 160" fill="none" strokeWidth="3" strokeLinecap="round"/>
      <path d="M62 134 C 65 122, 78 112, 95 98 L 142 50 C 145 47, 147 49, 143 54 L 98 101 C 83 113, 72 122, 69 134 Z" strokeWidth="0.5"/>

      {/* Right Scissor Finger Loop & Shank */}
      <circle cx="142" cy="145" r="12" fill="none" strokeWidth="3.5"/>
      <path d="M138 134 C 135 122, 122 112, 105 98 L 58 50 C 55 47, 53 49, 57 54 L 102 101 C 117 113, 128 122, 131 134 Z" strokeWidth="0.5"/>

      {/* Center Pivot Screw */}
      <circle cx="100" cy="97" r="5" fill="#191514" stroke="#d5a353" strokeWidth="2"/>
    </g>

    {/* Straight Razor Blade (Barber Razor Blade in Center) */}
    <g fill="#d5a353">
      {/* Outer Razor Body */}
      <path d="M 94 40 L 106 40 L 106 130 L 94 130 Z" opacity="0.9"/>
      {/* Razor Blade Slot & Cutout */}
      <rect x="97" y="52" width="6" height="38" rx="3" fill="#191514"/>
      <circle cx="100" cy="102" r="3.5" fill="#191514"/>
    </g>

    {/* Decorative Stars */}
    <path d="M 40 98 L 42 92 L 48 92 L 43 88 L 45 82 L 40 85 L 35 82 L 37 88 L 32 92 L 38 92 Z" fill="#d5a353"/>
    <path d="M 160 98 L 162 92 L 168 92 L 163 88 L 165 82 L 160 85 L 155 82 L 157 88 L 152 92 L 158 92 Z" fill="#d5a353"/>

    {/* Top Text Arch */}
    <path id="topArch" d="M 38 98 A 64 64 0 0 1 162 98" fill="none" />
    <text fill="#d5a353" fontSize="13" fontFamily="Teko" letterSpacing="4" textAnchor="middle">
      <textPath href="#topArch" startOffset="50%">BARBERSHOP &amp; TATTOO</textPath>
    </text>

    {/* Bottom Text Arch (Moved inward so text never touches circle lines) */}
    <path id="bottomArch" d="M 42 102 A 60 60 0 0 0 158 102" fill="none" />
    <text fill="#d5a353" fontSize="15" fontFamily="Teko" letterSpacing="3" fontWeight="bold" textAnchor="middle">
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
