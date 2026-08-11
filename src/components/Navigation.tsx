import React, { useState } from 'react';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';

interface NavigationProps {
  isMenuOpen: boolean;
  isSearchOpen: boolean;
  onCloseMenu: () => void;
  onCloseSearch: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isMenuOpen,
  isSearchOpen,
  onCloseMenu,
  onCloseSearch,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleLinkClick = (id: string) => {
    onCloseMenu();
    onNavigate(id);
  };

  return (
    <>
      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <>
          <div className="drawer_overlay" onClick={onCloseMenu}></div>
          <div className="side_drawer">
            <div className="drawer_header">
              <h3>BERGER SALON</h3>
              <button className="close_btn" onClick={onCloseMenu} title="Close Menu">
                <X size={24} />
              </button>
            </div>

            <ul className="nav_menu_links">
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}>
                  <span>HOME</span> <ArrowRight size={18} />
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); handleLinkClick('about'); }}>
                  <span>ABOUT US</span> <ArrowRight size={18} />
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => { e.preventDefault(); handleLinkClick('services'); }}>
                  <span>OUR SERVICES</span> <ArrowRight size={18} />
                </a>
              </li>
              <li>
                <a href="#staff" onClick={(e) => { e.preventDefault(); handleLinkClick('staff'); }}>
                  <span>BARBERS TEAM</span> <ArrowRight size={18} />
                </a>
              </li>
              <li>
                <a href="#prices" onClick={(e) => { e.preventDefault(); handleLinkClick('prices'); }}>
                  <span>PRICE LIST</span> <ArrowRight size={18} />
                </a>
              </li>
              <li>
                <a href="#shop" onClick={(e) => { e.preventDefault(); handleLinkClick('shop'); }}>
                  <span>GROOMING SHOP</span> <ArrowRight size={18} />
                </a>
              </li>
              <li>
                <a href="#appointment" onClick={(e) => { e.preventDefault(); handleLinkClick('appointment'); }}>
                  <span>APPOINTMENT</span> <ArrowRight size={18} />
                </a>
              </li>
            </ul>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: '#7c756e', marginBottom: '8px' }}>
                LOCATION
              </p>
              <p style={{ color: '#f9f6f2', fontSize: '0.95rem' }}>
                Durbar Marg, Kathmandu, Nepal
              </p>
              <p style={{ color: '#d5a353', fontSize: '0.95rem', marginTop: '4px' }}>
                +977 1-4220000
              </p>
            </div>
          </div>
        </>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="search_overlay">
          <button
            className="close_btn"
            style={{ position: 'absolute', top: '40px', right: '40px' }}
            onClick={onCloseSearch}
          >
            <X size={36} />
          </button>
          <div className="search_input_box">
            <input
              type="text"
              placeholder="Search services, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <SearchIcon
              size={32}
              style={{ position: 'absolute', right: '10px', top: '25px', color: '#d5a353' }}
            />
          </div>
        </div>
      )}
    </>
  );
};
