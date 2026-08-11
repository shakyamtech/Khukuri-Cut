import React from 'react';
import { ShoppingCart, Search, Menu, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onBookClick: () => void;
  cartCount: number;
}

export const KhukuriBarberLogo: React.FC<{ size?: number }> = ({ size = 130 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Dashed Golden Circle */}
    <circle cx="100" cy="100" r="92" stroke="#d5a353" strokeWidth="3" strokeDasharray="6 4"/>
    <circle cx="100" cy="100" r="82" stroke="#d5a353" strokeWidth="1.5"/>

    {/* Barber Scissors (Kainchi) */}
    <g stroke="#d5a353" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Scissor Finger Loops */}
      <circle cx="58" cy="142" r="11" fill="none"/>
      <circle cx="142" cy="142" r="11" fill="none"/>

      {/* Scissor Blades Crossing */}
      <path d="M65 134 L96 95 L140 45 C140 45 130 65 110 85 L96 95 L65 134" fill="#d5a353" stroke="none" opacity="0.95"/>
      <path d="M135 134 L104 95 L60 45 C60 45 70 65 90 85 L104 95 L135 134" fill="#d5a353" stroke="none" opacity="0.95"/>

      {/* Screw Pivot Pin */}
      <circle cx="100" cy="95" r="4.5" fill="#191514" stroke="#d5a353" strokeWidth="2"/>
    </g>

    {/* Straight Razor (Dari Katne Razor Blade) */}
    <g transform="translate(100, 95) rotate(-35) translate(-100, -95)">
      {/* Wooden/Steel Razor Body */}
      <path d="M96 35 C96 32 104 32 104 35 L104 115 C104 118 96 118 96 115 Z" fill="#d5a353"/>
      {/* Straight Razor Blade Open */}
      <path d="M104 40 L138 25 C141 24 144 27 143 30 L133 85 C132 88 128 90 125 88 L104 80 Z" fill="#d5a353" opacity="0.85" stroke="#191514" strokeWidth="1"/>
      {/* Razor Blade Edge Detail */}
      <line x1="138" y1="25" x2="125" y2="88" stroke="#191514" strokeWidth="1.5"/>
      {/* Blade Pin */}
      <circle cx="100" cy="42" r="3" fill="#191514"/>
    </g>

    {/* Top Curved Text */}
    <path id="topArch" d="M 35 100 A 65 65 0 0 1 165 100" fill="none" />
    <text fill="#d5a353" fontSize="13" fontFamily="Teko" letterSpacing="4" textAnchor="middle">
      <textPath href="#topArch" startOffset="50%">BARBERSHOP &amp; TATTOO</textPath>
    </text>

    {/* Bottom Curved Text */}
    <path id="bottomArch" d="M 28 115 A 72 72 0 0 0 172 115" fill="none" />
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
