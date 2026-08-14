import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Calendar } from 'lucide-react';
import { getStoredStaff, STAFF_UPDATED_EVENT } from '../utils/staffStorage';
import type { StaffMember, StaffStatus } from '../utils/staffStorage';

export const Staff: React.FC = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(getStoredStaff);
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setStaffMembers(getStoredStaff());
    };

    window.addEventListener(STAFF_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(STAFF_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const renderStatusBadge = (status: StaffStatus, statusNote?: string) => {
    switch (status) {
      case 'available':
        return (
          <div className="status_pill available">
            <span className="status_dot"></span>
            <span>AVAILABLE NOW</span>
          </div>
        );
      case 'busy':
        return (
          <div className="status_pill busy">
            <span className="status_dot"></span>
            <span>IN SESSION {statusNote ? `· ${statusNote}` : ''}</span>
          </div>
        );
      case 'off':
      default:
        return (
          <div className="status_pill off">
            <span className="status_dot"></span>
            <span>ON BREAK {statusNote ? `· ${statusNote}` : ''}</span>
          </div>
        );
    }
  };

  const handleBookStaff = (_staffName: string) => {
    setActiveStaff(null);
    const appointmentSection = document.getElementById('appointment');
    if (appointmentSection) {
      appointmentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="staff_section" id="staff">
      <div className="content_wrap">
        <div className="section_title_wrap">
          <h2 className="section_title dark_theme">OUR STAFF</h2>
          <p className="section_subtitle" style={{ color: '#d8cfc4' }}>
            Meet our team of passionate Nepali master barbers and artists. Check their live availability below!
          </p>
          <div className="separator_line"></div>
        </div>

        <div className="staff_grid">
          {staffMembers.map((barber) => (
            <div className="staff_card" key={barber.id}>
              <div className="staff_avatar_wrap">
                <img src={barber.image} alt={barber.name} />
              </div>
              <div className="staff_info">
                <h3>{barber.name}</h3>
                <div className="role">{barber.role}</div>
                {renderStatusBadge(barber.status, barber.statusNote)}
                <div style={{ marginTop: '5px' }}>
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
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setActiveStaff(barber)}
                  >
                    <span>VIEW PROFILE</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
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
            <h3 style={{ fontSize: '2.5rem', color: '#d5a353', marginBottom: '2px' }}>{activeStaff.name}</h3>
            <p style={{ fontFamily: 'Merriweather', fontStyle: 'italic', color: '#f9f6f2', marginBottom: '10px' }}>{activeStaff.role}</p>

            <div style={{ marginBottom: '15px' }}>
              {renderStatusBadge(activeStaff.status, activeStaff.statusNote)}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '4px', marginBottom: '20px', textAlign: 'left' }}>
              <p style={{ color: '#d5a353', fontSize: '0.95rem', marginBottom: '6px' }}><strong>Experience:</strong> {activeStaff.experience}</p>
              <p style={{ color: '#d5a353', fontSize: '0.95rem', marginBottom: '10px' }}><strong>Specialty:</strong> {activeStaff.specialty}</p>
              <p style={{ color: '#d8cfc4', fontSize: '0.95rem', lineHeight: '1.6' }}>{activeStaff.bio}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {activeStaff.status === 'available' && (
                <button
                  className="sc_button"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleBookStaff(activeStaff.name)}
                >
                  <Calendar size={16} />
                  <span>BOOK WITH {activeStaff.name.split(' ')[0].toUpperCase()}</span>
                </button>
              )}
              <button
                style={{
                  background: 'transparent',
                  border: '1px solid #7c756e',
                  color: '#f9f6f2',
                  padding: '10px 20px',
                  fontFamily: 'Teko',
                  fontSize: '1.1rem',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveStaff(null)}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
