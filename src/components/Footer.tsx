import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="site_footer">
      <div className="content_wrap">
        <div style={{ marginBottom: '25px' }}>
          <div style={{ fontFamily: 'Teko', fontSize: '2.5rem', color: '#d5a353', letterSpacing: '2px' }}>
            KHUKURI CUT BARBERSHOP & TATTOO
          </div>
          <p style={{ fontFamily: 'Merriweather', fontStyle: 'italic', color: '#88827b', fontSize: '0.95rem' }}>
            Durbar Marg, Kathmandu, Nepal • Phone: +977 1-4220000
          </p>
        </div>

        <div className="footer_socials">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social_icon_btn" title="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social_icon_btn" title="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social_icon_btn" title="Twitter/X">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
          </a>
        </div>

        <div className="footer_text">
          <p>
            © {new Date().getFullYear()} Khukuri Cut Nepal. All Rights Reserved. Crafted with pride.
          </p>
          <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#66605a' }}>
            <a href="#home" style={{ margin: '0 10px' }}>Terms of Use</a> | 
            <a href="#home" style={{ margin: '0 10px' }}>Privacy Policy</a> | 
            <a href="#home" style={{ margin: '0 10px' }}>Kathmandu Salon</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
