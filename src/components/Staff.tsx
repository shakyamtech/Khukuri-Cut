import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ExternalLink, X, Calendar, Clock, Scissors, CheckCircle2, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { notifyNewBookingCrossTab } from '../utils/audioAlert';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -360, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({ left: 360, behavior: 'smooth' });
  };

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

    // Broadcast booking across tabs (triggers chime sound in Admin panel tab!)
    notifyNewBookingCrossTab(newAppt);

    // Dispatch event for Admin notification & audio ding
    window.dispatchEvent(new CustomEvent('kc_appointment_created', { detail: newAppt }));
    window.dispatchEvent(new Event('kc_appointment_updated'));

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

  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide carousel every 4 seconds
  useEffect(() => {
    if (modalOpen || isHovered || staffMembers.length <= 1) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 25) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [modalOpen, isHovered, staffMembers.length]);

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

        {/* Staff Cards Carousel Slider */}
        <div style={{ position: 'relative', margin: '0 auto', maxWidth: '1200px' }}>
          {/* Left Arrow Button */}
          {staffMembers.length > 3 && (
            <button
              onClick={handleScrollLeft}
              aria-label="Previous Barber"
              className="carousel_arrow_btn left"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Carousel Scroll Container */}
          <div
            ref={scrollRef}
            className="staff_carousel_container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
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

          {/* Right Arrow Button */}
          {staffMembers.length > 3 && (
            <button
              onClick={handleScrollRight}
              aria-label="Next Barber"
              className="carousel_arrow_btn right"
            >
              <ChevronRight size={24} />
            </button>
          )}
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.88)', backdropFilter: 'blur(8px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}
        >
          <div
            className="modal_content"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'linear-gradient(145deg, #1c1612, #161210)', border: '1px solid rgba(213,163,83,0.35)', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.9)', animation: 'fadeSlideUp 0.3s ease', padding: 0 }}
          >
            {/* Top Gold Accent Strip */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #d5a353, #c4893f, #d5a353)', width: '100%' }} />

            <div style={{ padding: '32px 30px 28px' }}>
              {/* Close Button */}
              <button
                onClick={closeModal}
                style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(213,163,83,0.1)', border: '1px solid rgba(213,163,83,0.25)', borderRadius: '50%', color: '#d5a353', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s ease' }}
                title="Close"
              >
                <X size={18} />
              </button>

              {!isSubmitted ? (
                <>
                  {/* Barber Header Info - Centered Portrait Layout */}
                  <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    {currentBarber ? (
                      <>
                        <div style={{ width: '74px', height: '74px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', border: '3px solid #d5a353', boxShadow: '0 0 22px rgba(213,163,83,0.35)' }}>
                          <img src={currentBarber.image} alt={currentBarber.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                        </div>
                        <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2.1rem', color: '#d5a353', marginBottom: '1px', letterSpacing: '1px', lineHeight: 1 }}>{currentBarber.name}</h3>
                        <p style={{ fontFamily: "'Merriweather', serif", fontStyle: 'italic', fontSize: '0.82rem', color: '#a89a8a', marginBottom: '6px' }}>{currentBarber.role}</p>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                          {renderStatusBadge(currentBarber.status, currentBarber.statusNote)}
                        </div>

                        {/* Bio / Specialty Box */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(213,163,83,0.18)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', marginBottom: '12px', fontSize: '0.82rem' }}>
                          <p style={{ color: '#d5a353', marginBottom: '2px', fontWeight: 600 }}>Specialty: {currentBarber.specialty}</p>
                          <p style={{ color: '#d8cfc4', fontSize: '0.8rem', lineHeight: '1.35' }}>{currentBarber.bio}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'linear-gradient(135deg, #d5a353, #b8863b)', color: '#191514', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '1.8rem', boxShadow: '0 0 24px rgba(213,163,83,0.4)' }}>✂️</div>
                        <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2rem', color: '#d5a353', marginBottom: '2px', letterSpacing: '1px' }}>ANY MASTER BARBER</h3>
                        <p style={{ fontFamily: "'Merriweather', serif", fontStyle: 'italic', fontSize: '0.82rem', color: '#a89a8a', marginBottom: '12px' }}>First available barber will be assigned upon arrival.</p>
                      </>
                    )}
                  </div>

                  {/* Only show Barber Switcher if "Any Barber" option was selected */}
                  {selectedBarberId === 'any' && (
                    <div style={{ marginBottom: '10px' }}>
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
                        style={{ fontSize: '0.82rem', padding: '7px 10px' }}
                      >
                        <option value="any">✂️ Any Available Master Barber</option>
                        {staffMembers.map((b) => (
                          <option key={b.id} value={b.id}>
                            👤 {b.name} ({b.status === 'available' ? '🟢 Available' : b.status === 'busy' ? '🔴 In Session' : '🟡 On Break'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Compact Booking Form */}
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        className="form_input"
                        placeholder="Full Name *"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                      <input
                        type="email"
                        className="form_input"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="tel"
                        className="form_input"
                        placeholder="Phone Number *"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                      <input
                        type="date"
                        className="form_input"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ position: 'relative' }}>
                        <Scissors size={13} color="#d5a353" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <select
                          className="form_select"
                          style={{ paddingLeft: '32px', padding: '8px 12px 8px 32px', fontSize: '0.82rem' }}
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
                        <Clock size={13} color="#d5a353" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <select
                          className="form_select"
                          style={{ paddingLeft: '32px', padding: '8px 12px 8px 32px', fontSize: '0.82rem' }}
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
                      rows={1}
                      style={{ marginBottom: '10px', padding: '8px 12px', fontSize: '0.82rem', height: '38px', resize: 'none' }}
                      placeholder="Special instructions or hair style preferences (Optional)..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <div className="checkbox_row" style={{ marginBottom: '12px' }}>
                      <input
                        type="checkbox"
                        id="modal_agree_terms"
                        required
                        checked={formData.accepted}
                        onChange={(e) => setFormData({ ...formData, accepted: e.target.checked })}
                      />
                      <label htmlFor="modal_agree_terms" style={{ fontSize: '0.75rem', color: '#a89a8a' }}>
                        I agree that my booking data is collected and stored for appointment processing.
                      </label>
                    </div>
                    <button type="submit" className="sc_button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px 20px', fontSize: '1.05rem' }}>
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
