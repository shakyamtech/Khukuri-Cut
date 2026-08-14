import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ExternalLink, X, Calendar, Clock, Scissors, CheckCircle2, UserCheck } from 'lucide-react';
import { getStoredStaff, STAFF_UPDATED_EVENT } from '../utils/staffStorage';
import type { StaffMember, StaffStatus } from '../utils/staffStorage';

interface StaffProps {
  initialService?: string;
}

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '12:00 PM',
  service: 'HAIRCUTTING',
  notes: '',
  accepted: false,
};

export const Staff: React.FC<StaffProps> = ({ initialService = '' }) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(getStoredStaff);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null); // null = "Any Barber"
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('any');

  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    service: initialService || 'HAIRCUTTING',
  });

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

  useEffect(() => {
    if (initialService) {
      setFormData((prev) => ({ ...prev, service: initialService }));
    }
  }, [initialService]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const openBookingModal = (barber: StaffMember | null) => {
    setSelectedStaff(barber);
    setSelectedBarberId(barber ? barber.id : 'any');
    setIsSubmitted(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setIsSubmitted(false), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.date) {
      alert('Please fill out Name, Phone number, and Date.');
      return;
    }

    const chosenBarberName =
      selectedBarberId === 'any'
        ? 'Any Master Barber'
        : staffMembers.find((s) => s.id === selectedBarberId)?.name || 'Any Master Barber';

    const newAppt = {
      id: `real-${Date.now()}`,
      ...formData,
      barber: chosenBarberName,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('kc_appointments') || '[]');
    localStorage.setItem('kc_appointments', JSON.stringify([newAppt, ...existing]));

    setIsSubmitted(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  };

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

  const currentBarber = staffMembers.find((s) => s.id === selectedBarberId) || selectedStaff;

  return (
    <section className="staff_section" id="staff">
      <div id="appointment" style={{ position: 'relative', top: '-100px', visibility: 'hidden' }} />
      <div className="content_wrap">
        <div className="section_title_wrap">
          <h2 className="section_title dark_theme">OUR MASTER BARBERS</h2>
          <p className="section_subtitle" style={{ color: '#d8cfc4' }}>
            Meet Kathmandu's finest grooming craftsmen. Check live status and click to book your appointment!
          </p>
          <div className="separator_line"></div>
        </div>

        {/* Staff Grid */}
        <div className="staff_grid">
          {staffMembers.map((barber) => (
            <div className="staff_card" key={barber.id} onClick={() => openBookingModal(barber)} style={{ cursor: 'pointer' }}>
              <div className="staff_avatar_wrap">
                <img src={barber.image} alt={barber.name} />
              </div>
              <div className="staff_info">
                <h3>{barber.name}</h3>
                <div className="role">{barber.role}</div>
                {renderStatusBadge(barber.status, barber.statusNote)}
                <div style={{ marginTop: '12px' }}>
                  <button
                    style={{
                      background: 'linear-gradient(135deg, rgba(213,163,83,0.15), rgba(213,163,83,0.05))',
                      border: '1px solid #d5a353',
                      color: '#d5a353',
                      padding: '8px 20px',
                      fontFamily: 'Teko',
                      fontSize: '1.2rem',
                      letterSpacing: '1px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'all 0.25s ease',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <Calendar size={16} />
                    <span>BOOK APPOINTMENT</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Any Barber Quick Booking Bar */}
        <div style={{ marginTop: '35px', textAlign: 'center' }}>
          <button
            className="sc_button"
            onClick={() => openBookingModal(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 32px' }}
          >
            <UserCheck size={20} />
            <span>BOOK WITH ANY AVAILABLE BARBER</span>
          </button>
        </div>
      </div>

      {/* ====== UNIFIED BOOKING & PROFILE MODAL ====== */}
      {modalOpen && (
        <div
          className="modal_overlay"
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.88)', backdropFilter: 'blur(8px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}
        >
          <div
            className="modal_content"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'linear-gradient(145deg, #1c1612, #161210)', border: '1px solid rgba(213,163,83,0.3)', borderRadius: '20px', width: '100%', maxWidth: '580px', position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.8)', animation: 'fadeSlideUp 0.3s ease', overflow: 'hidden', padding: 0 }}
          >
            {/* Top Gold Accent Strip */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #d5a353, #c4893f, #d5a353)', width: '100%' }} />

            <div style={{ padding: '28px 32px 32px' }}>
              {/* Close Button */}
              <button
                onClick={closeModal}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#8a7a6a', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
              >
                <X size={18} />
              </button>

              {!isSubmitted ? (
                <>
                  {/* Barber Header Info */}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {currentBarber ? (
                      <>
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px', border: '3px solid #d5a353', boxShadow: '0 0 24px rgba(213,163,83,0.35)' }}>
                          <img src={currentBarber.image} alt={currentBarber.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                        </div>
                        <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2.2rem', color: '#d5a353', marginBottom: '2px', letterSpacing: '1px', lineHeight: 1 }}>{currentBarber.name}</h3>
                        <p style={{ fontFamily: "'Merriweather', serif", fontStyle: 'italic', fontSize: '0.85rem', color: '#a89a8a', marginBottom: '8px' }}>{currentBarber.role}</p>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                          {renderStatusBadge(currentBarber.status, currentBarber.statusNote)}
                        </div>

                        {/* Bio / Specialty Box */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(213,163,83,0.15)', padding: '12px 16px', borderRadius: '10px', textAlign: 'left', marginBottom: '18px', fontSize: '0.85rem' }}>
                          <p style={{ color: '#d5a353', marginBottom: '4px' }}><strong>Specialty:</strong> {currentBarber.specialty}</p>
                          <p style={{ color: '#d8cfc4', fontSize: '0.82rem', lineHeight: '1.4' }}>{currentBarber.bio}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #d5a353, #b8863b)', color: '#191514', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '2.2rem', boxShadow: '0 0 28px rgba(213,163,83,0.4)' }}>✂️</div>
                        <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2.2rem', color: '#d5a353', marginBottom: '2px', letterSpacing: '1px' }}>ANY MASTER BARBER</h3>
                        <p style={{ fontFamily: "'Merriweather', serif", fontStyle: 'italic', fontSize: '0.85rem', color: '#a89a8a', marginBottom: '16px' }}>We will assign the first available master barber upon arrival.</p>
                      </>
                    )}
                  </div>

                  {/* Preferred Barber Switcher */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#d5a353', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                      Change Preferred Barber:
                    </label>
                    <select
                      className="form_select"
                      value={selectedBarberId}
                      onChange={(e) => {
                        setSelectedBarberId(e.target.value);
                        if (e.target.value === 'any') {
                          setSelectedStaff(null);
                        } else {
                          const b = staffMembers.find((s) => s.id === e.target.value);
                          if (b) setSelectedStaff(b);
                        }
                      }}
                      style={{ fontSize: '0.9rem', padding: '10px 14px' }}
                    >
                      <option value="any">✂️ Any Available Master Barber</option>
                      {staffMembers.map((b) => (
                        <option key={b.id} value={b.id}>
                          👤 {b.name} ({b.status === 'available' ? '🟢 Available' : b.status === 'busy' ? '🔴 In Session' : '🟡 On Break'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(213,163,83,0.15)', marginBottom: '18px' }} />

                  {/* Booking Form */}
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        className="form_input"
                        placeholder="Full Name *"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <input
                        type="email"
                        className="form_input"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <input
                        type="tel"
                        className="form_input"
                        placeholder="Phone Number *"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      <input
                        type="date"
                        className="form_input"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <Scissors size={14} color="#d5a353" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <select
                          className="form_select"
                          style={{ paddingLeft: '34px' }}
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        >
                          <option value="HAIRCUTTING">Haircutting (Rs 800)</option>
                          <option value="SHAVING">Hot Towel Shaving (Rs 500)</option>
                          <option value="HAIRCUT + SHAVE">Haircut + Shave Combo (Rs 1,200)</option>
                          <option value="STYLING">Styling & Pompadour (Rs 600)</option>
                          <option value="TRIMMING">Beard Trim & Sculpt (Rs 350)</option>
                          <option value="TATTOO">Custom Tattoo Consultation</option>
                        </select>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <Clock size={14} color="#d5a353" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <select
                          className="form_select"
                          style={{ paddingLeft: '34px' }}
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        >
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="01:30 PM">01:30 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="05:00 PM">05:00 PM</option>
                          <option value="07:00 PM">07:00 PM</option>
                        </select>
                      </div>
                    </div>
                    <textarea
                      className="form_textarea"
                      rows={2}
                      style={{ marginBottom: '14px' }}
                      placeholder="Special instructions or hair style preferences (Optional)..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <div className="checkbox_row" style={{ marginBottom: '18px' }}>
                      <input
                        type="checkbox"
                        id="modal_agree_terms"
                        required
                        checked={formData.accepted}
                        onChange={(e) => setFormData({ ...formData, accepted: e.target.checked })}
                      />
                      <label htmlFor="modal_agree_terms" style={{ fontSize: '0.8rem' }}>
                        I agree that my booking data is collected and stored for appointment processing.
                      </label>
                    </div>
                    <button type="submit" className="sc_button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      CONFIRM APPOINTMENT BOOKING
                    </button>
                  </form>
                </>
              ) : (
                /* Success Confirmation State */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle2 size={72} color="#d5a353" style={{ margin: '0 auto 20px', display: 'block' }} />
                  <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2.8rem', color: '#d5a353', marginBottom: '8px', letterSpacing: '1px' }}>BOOKING CONFIRMED!</h3>
                  <p style={{ color: '#f9f6f2', fontSize: '1.05rem', marginBottom: '8px' }}>
                    Thank you, <strong>{formData.name}</strong>! 🎉
                  </p>
                  <p style={{ color: '#a89a8a', fontSize: '0.92rem', marginBottom: '10px' }}>
                    <strong style={{ color: '#d5a353' }}>{formData.service}</strong> on <strong style={{ color: '#d5a353' }}>{formData.date}</strong> at <strong style={{ color: '#d5a353' }}>{formData.time}</strong>
                  </p>
                  <p style={{ color: '#a89a8a', fontSize: '0.9rem', marginBottom: '24px' }}>
                    Assigned Barber: <strong style={{ color: '#f9f6f2' }}>{selectedBarberId === 'any' ? 'Any Available Barber' : currentBarber?.name}</strong>
                  </p>
                  <p style={{ color: '#6a5a4a', fontSize: '0.82rem', marginBottom: '28px' }}>
                    Our salon manager will contact you at <strong style={{ color: '#d8cfc4' }}>{formData.phone}</strong> shortly.
                  </p>
                  <button
                    className="sc_button"
                    onClick={() => {
                      closeModal();
                      setFormData({ ...EMPTY_FORM, service: initialService || 'HAIRCUTTING' });
                    }}
                  >
                    DONE
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
