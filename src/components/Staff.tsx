import React, { useState } from 'react';
import { ExternalLink, X } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  image: string;
  experience: string;
  specialty: string;
  bio: string;
}

const STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'subash',
    name: 'Subash Gurung',
    role: 'Senior Master Barber',
    image: '/images/barber_1.png',
    experience: '12+ Years Experience',
    specialty: 'Classic Scissor Cuts & Fade Mastery',
    bio: 'Subash trained in London and Mumbai before leading the master team at Berger. He specializes in bespoke hair consultations and traditional razor styling.',
  },
  {
    id: 'laxman',
    name: 'Laxman Shrestha',
    role: 'Master Barber & Stylist',
    image: '/images/barber_2.png',
    image2: '/images/barber_2.png',
    experience: '8 Years Experience',
    specialty: 'Hot Towel Shaving & Beard Sculpting',
    bio: 'Laxman is renowned for his precise straight razor work and custom beard shaping. He ensures every client walks out looking ultra sharp.',
  },
  {
    id: 'anup',
    name: 'Anup Thapa',
    role: 'Barber & Tattoo Artist',
    image: '/images/barber_3.png',
    experience: '10 Years Experience',
    specialty: 'Modern Texturized Cuts & Custom Sleeve Tattoos',
    bio: 'Anup bridges the world of modern hair fades and fine-line Nepalese tattoo artistry. Known for creative flair and meticulous hygiene standard.',
  },
] as (StaffMember & { image2?: string })[];

export const Staff: React.FC = () => {
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null);

  return (
    <section className="staff_section" id="staff">
      <div className="content_wrap">
        <div className="section_title_wrap">
          <h2 className="section_title dark_theme">OUR STAFF</h2>
          <p className="section_subtitle" style={{ color: '#d8cfc4' }}>
            Meet our team of passionate Nepali master barbers and artists dedicated to crafting your ultimate look.
          </p>
          <div className="separator_line"></div>
        </div>

        <div className="staff_grid">
          {STAFF_MEMBERS.map((barber) => (
            <div className="staff_card" key={barber.id}>
              <div className="staff_avatar_wrap">
                <img src={barber.image} alt={barber.name} />
              </div>
              <div className="staff_info">
                <h3>{barber.name}</h3>
                <div className="role">{barber.role}</div>
                <button
                  style={{
                    background: 'transparent',
                    border: '1px solid #d5a353',
                    color: '#d5a353',
                    padding: '8px 20px',
                    fontFamily: 'Teko',
                    fontSize: '1.1rem',
                    letterSpacing: '1px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setActiveStaff(barber)}
                >
                  <span>VIEW PROFILE</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Profile Modal */}
      {activeStaff && (
        <div className="modal_overlay" onClick={() => setActiveStaff(null)}>
          <div className="modal_content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close_btn"
              style={{ position: 'absolute', top: '15px', right: '15px' }}
              onClick={() => setActiveStaff(null)}
            >
              <X size={24} />
            </button>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 15px', border: '2px solid #d5a353' }}>
              <img src={activeStaff.image} alt={activeStaff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '2.5rem', color: '#d5a353', marginBottom: '5px' }}>{activeStaff.name}</h3>
            <p style={{ fontFamily: 'Merriweather', fontStyle: 'italic', color: '#f9f6f2', marginBottom: '15px' }}>{activeStaff.role}</p>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '4px', marginBottom: '20px', textAlign: 'left' }}>
              <p style={{ color: '#d5a353', fontSize: '0.95rem', marginBottom: '6px' }}><strong>Experience:</strong> {activeStaff.experience}</p>
              <p style={{ color: '#d5a353', fontSize: '0.95rem', marginBottom: '10px' }}><strong>Specialty:</strong> {activeStaff.specialty}</p>
              <p style={{ color: '#d8cfc4', fontSize: '0.95rem', lineHeight: '1.6' }}>{activeStaff.bio}</p>
            </div>
            <button className="sc_button" onClick={() => setActiveStaff(null)}>
              CLOSE PROFILE
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
