import React from 'react';
import { ShoppingCart, Search, Menu, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onBookClick: () => void;
  cartCount: number;
}

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
            <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5L90 25V75L50 95L10 75V25L50 5Z" stroke="#d5a353" strokeWidth="4" fill="#191514"/>
              <path d="M35 35L65 65M65 35L35 65" stroke="#d5a353" strokeWidth="6" strokeLinecap="round"/>
              <circle cx="50" cy="50" r="12" fill="#d5a353"/>
            </svg>
            <div className="logo_text">BERGER</div>
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
            <svg width="120" height="120" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" stroke="#d5a353" strokeWidth="4" strokeDasharray="8 6"/>
              <path d="M60 100C60 77.9086 77.9086 60 100 60C122.091 60 140 77.9086 140 100C140 122.091 122.091 140 100 140" stroke="#d5a353" strokeWidth="6"/>
              <path d="M70 70L130 130M130 70L70 130" stroke="#d5a353" strokeWidth="5"/>
              <text x="100" y="165" fill="#d5a353" fontSize="20" fontFamily="Teko" textAnchor="middle" letterSpacing="4">BARBERSHOP</text>
            </svg>
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
