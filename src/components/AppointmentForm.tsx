import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, X, Calendar, Clock, Scissors } from 'lucide-react';
import { getStoredStaff, STAFF_UPDATED_EVENT } from '../utils/staffStorage';
import type { StaffMember } from '../utils/staffStorage';

interface AppointmentFormProps {
  initialService?: string;
}

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '12:00 PM',
  barber: 'Any Master Barber',
  service: 'HAIRCUTTING',
  notes: '',
  accepted: false,
};

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ initialService = '' }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(getStoredStaff);
  const [selectedBarber, setSelectedBarber] = useState<StaffMember | null>(null); // null = "Any"
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    service: initialService || 'HAIRCUTTING',
  });

  useEffect(() => {
    const handleUpdate = () => setStaffList(getStoredStaff());
    window.addEventListener(STAFF_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(STAFF_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (initialService) setFormData((prev) => ({ ...prev, service: initialService }));
  }, [initialService]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const openModal = (barber: StaffMember | null) => {
    setSelectedBarber(barber);
    setFormData((prev) => ({ ...prev, barber: barber ? barber.name : 'Any Master Barber' }));
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
    const newAppt = {
      id: `real-${Date.now()}`,
      ...formData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('kc_appointments') || '[]');
    localStorage.setItem('kc_appointments', JSON.stringify([newAppt, ...existing]));
    setIsSubmitted(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  };

  const statusColor = (barber: StaffMember) =>
    barber.status === 'available' ? '#22c55e' : barber.status === 'busy' ? '#eab308' : '#ef4444';

  const statusText = (barber: StaffMember) =>
    barber.status === 'available' ? 'AVAILABLE' : barber.status === 'busy' ? 'IN SESSION' : 'ON LEAVE';

  return (
    <section className="appointment_section" id="appointment">
      <div className="content_wrap">
        <div className="section_title_wrap">
          <h2 className="section_title dark_theme">MAKE AN APPOINTMENT</h2>
          <p className="section_subtitle" style={{ color: '#d8cfc4' }}>
            Pick your favourite master barber below and book your session!
          </p>
          <div className="separator_line"></div>
        </div>

        {/* Barber Cards Grid — click to open modal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', maxWidth: '1050px', margin: '0 auto' }}>

          {/* Any Barber Card */}
          <div onClick={() => openModal(null)} style={anyCardStyle} className="barber_portrait_card">
            <div style={{ position: 'relative', width: '100%', height: '240px', background: 'linear-gradient(135deg, #2b2118, #1a140e)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg, #d5a353, #b8863b)', color: '#191514', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', boxShadow: '0 0 30px rgba(213,163,83,0.4)', marginBottom: '10px' }}>✂️</div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', color: '#d5a353', background: 'rgba(10,8,6,0.75)', border: '1px solid rgba(213,163,83,0.4)', backdropFilter: 'blur(4px)', letterSpacing: '0.8px' }}>
                🟢 AVAILABLE
              </span>
            </div>
            <div style={{ padding: '18px 16px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Teko', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: '#d5a353', letterSpacing: '1px', lineHeight: 1.1 }}>ANY BARBER</div>
              <div style={{ fontSize: '0.8rem', color: '#8a7a6a', fontStyle: 'italic', marginTop: '4px', marginBottom: '14px' }}>First available master barber</div>
              <div style={bookBtnStyle}>BOOK ANY BARBER →</div>
            </div>
          </div>

          {/* Individual Barber Cards */}
          {staffList.map((barber) => {
            const col = statusColor(barber);
            const st = statusText(barber);
            return (
              <div key={barber.id} onClick={() => openModal(barber)} style={{ ...barberCardStyle, borderColor: `${col}66` }} className="barber_portrait_card">
                {/* Large Portrait Image Header */}
                <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden', background: '#120e0c' }}>
                  <img
                    src={barber.image}
                    alt={barber.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transition: 'transform 0.5s ease' }}
                  />
                  {/* Subtle Gradient Overlay at bottom of photo for text contrast */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18,14,12,0.85) 0%, rgba(18,14,12,0) 40%)' }} />
                  
                  {/* Floating Status Pill on Top-Right */}
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    fontSize: '0.68rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px',
                    color: col, background: 'rgba(10,8,6,0.82)', border: `1.5px solid ${col}`,
                    backdropFilter: 'blur(6px)', boxShadow: `0 0 14px ${col}44`, letterSpacing: '0.8px',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: col, boxShadow: `0 0 8px ${col}` }} />
                    {st}
                  </span>
                </div>

                {/* Barber Info Body */}
                <div style={{ padding: '18px 16px 20px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Teko', sans-serif", fontSize: '1.65rem', fontWeight: 700, color: '#f9f6f2', letterSpacing: '1px', lineHeight: 1.1 }}>{barber.name.toUpperCase()}</div>
                  <div style={{ fontSize: '0.8rem', color: '#a89a8a', fontStyle: 'italic', marginTop: '3px', marginBottom: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{barber.role}</div>
                  <div style={{ ...bookBtnStyle, borderColor: `${col}55`, color: col }}>
                    BOOK SESSION →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====== BOOKING MODAL ====== */}
      {modalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.88)', backdropFilter: 'blur(8px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}
          onClick={closeModal}
        >
          <div
            style={{ background: 'linear-gradient(145deg, #1c1612, #161210)', border: '1px solid rgba(213,163,83,0.25)', borderRadius: '20px', width: '100%', maxWidth: '520px', position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', animation: 'fadeSlideUp 0.3s ease', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gold accent top bar */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #d5a353, #c4893f, #d5a353)', width: '100%' }} />

            <div style={{ padding: '28px 32px 32px' }}>
              {/* Close button */}
              <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#8a7a6a', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>

              {!isSubmitted ? (
                <>
                  {/* Barber Profile Header */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    {selectedBarber ? (
                      <>
                        <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 12px' }}>
                          <img
                            src={selectedBarber.image}
                            alt={selectedBarber.name}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: `3px solid ${statusColor(selectedBarber)}`, boxShadow: `0 0 24px ${statusColor(selectedBarber)}55` }}
                          />
                          <span style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: statusColor(selectedBarber), border: '2.5px solid #161210' }} />
                        </div>
                        <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2.1rem', color: '#d5a353', marginBottom: '2px', letterSpacing: '1px' }}>{selectedBarber.name}</h3>
                        <p style={{ fontFamily: "'Merriweather', serif", fontStyle: 'italic', fontSize: '0.85rem', color: '#a89a8a', marginBottom: '8px' }}>{selectedBarber.role}</p>
                        <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: '20px', color: statusColor(selectedBarber), background: `${statusColor(selectedBarber)}18`, border: `1px solid ${statusColor(selectedBarber)}40`, letterSpacing: '0.5px' }}>
                          {statusText(selectedBarber)}
                        </span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #d5a353, #b8863b)', color: '#191514', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.8rem', boxShadow: '0 0 24px rgba(213,163,83,0.4)' }}>✂️</div>
                        <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2.1rem', color: '#d5a353', marginBottom: '2px', letterSpacing: '1px' }}>Any Master Barber</h3>
                        <p style={{ fontFamily: "'Merriweather', serif", fontStyle: 'italic', fontSize: '0.85rem', color: '#a89a8a' }}>We'll assign the best available barber for you</p>
                      </>
                    )}
                  </div>

                  <div style={{ height: '1px', background: 'rgba(213,163,83,0.15)', marginBottom: '22px' }} />

                  {/* Form */}
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
                      style={{ marginBottom: '16px' }}
                      placeholder="Special instructions or style preferences (Optional)..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <div className="checkbox_row" style={{ marginBottom: '20px' }}>
                      <input
                        type="checkbox"
                        id="modal_agree_terms"
                        required
                        checked={formData.accepted}
                        onChange={(e) => setFormData({ ...formData, accepted: e.target.checked })}
                      />
                      <label htmlFor="modal_agree_terms">
                        I agree that my booking data is collected and stored for appointment processing.
                      </label>
                    </div>
                    <button type="submit" className="sc_button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      CONFIRM BOOKING
                    </button>
                  </form>
                </>
              ) : (
                /* Success State */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle2 size={72} color="#d5a353" style={{ margin: '0 auto 20px', display: 'block' }} />
                  <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2.8rem', color: '#d5a353', marginBottom: '10px', letterSpacing: '1px' }}>BOOKING CONFIRMED!</h3>
                  <p style={{ color: '#f9f6f2', fontSize: '1rem', marginBottom: '8px' }}>
                    Thank you, <strong>{formData.name}</strong>! 🎉
                  </p>
                  <p style={{ color: '#a89a8a', fontSize: '0.9rem', marginBottom: '10px' }}>
                    <strong style={{ color: '#d5a353' }}>{formData.service}</strong> on <strong style={{ color: '#d5a353' }}>{formData.date}</strong> at <strong style={{ color: '#d5a353' }}>{formData.time}</strong>
                  </p>
                  {selectedBarber && (
                    <p style={{ color: '#a89a8a', fontSize: '0.88rem', marginBottom: '28px' }}>
                      with <strong style={{ color: '#f9f6f2' }}>{selectedBarber.name}</strong>
                    </p>
                  )}
                  <p style={{ color: '#6a5a4a', fontSize: '0.82rem', marginBottom: '28px' }}>
                    We'll reach you at <strong style={{ color: '#d8cfc4' }}>{formData.phone}</strong> to confirm.
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

/* ======= Styles ======= */
const barberCardStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(26,20,16,0.98), rgba(18,14,11,0.99))',
  border: '2px solid rgba(213,163,83,0.25)',
  borderRadius: '16px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
};

const anyCardStyle: React.CSSProperties = {
  ...barberCardStyle,
  borderColor: 'rgba(213,163,83,0.5)',
  boxShadow: '0 12px 35px rgba(213,163,83,0.15)',
};

const bookBtnStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '0.78rem',
  fontWeight: 800,
  letterSpacing: '1px',
  color: '#d5a353',
  background: 'rgba(213,163,83,0.08)',
  border: '1px solid rgba(213,163,83,0.3)',
  borderRadius: '20px',
  padding: '8px 18px',
  transition: 'all 0.25s ease',
};
