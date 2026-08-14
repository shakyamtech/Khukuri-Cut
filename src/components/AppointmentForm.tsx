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

        {/* Barber Avatar Grid — click to open modal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>

          {/* Any Barber Card */}
          <div onClick={() => openModal(null)} style={anyCardStyle}>
            {/* Square avatar with corner accents */}
            <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 18px' }}>
              {/* Corner accent lines */}
              <span style={topLeftCorner('#d5a353')} />
              <span style={topRightCorner('#d5a353')} />
              <span style={bottomLeftCorner('#d5a353')} />
              <span style={bottomRightCorner('#d5a353')} />
              <div style={anyAvatarStyle}>✂️</div>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f9f6f2', marginBottom: '6px', letterSpacing: '0.5px' }}>Any Barber</div>
            <div style={{ fontSize: '0.72rem', color: '#d5a353', background: 'rgba(213,163,83,0.15)', border: '1px solid rgba(213,163,83,0.35)', padding: '3px 14px', borderRadius: '20px', fontWeight: 800, letterSpacing: '0.8px' }}>
              AVAILABLE
            </div>
            <div style={{ marginTop: '14px', fontSize: '0.8rem', color: '#8a7a6a' }}>Click to Book</div>
          </div>

          {/* Individual Barber Cards */}
          {staffList.map((barber) => {
            const col = statusColor(barber);
            const st = statusText(barber);
            return (
              <div key={barber.id} onClick={() => openModal(barber)} style={{ ...barberCardStyle, boxShadow: `0 0 0 1px ${col}30, 0 8px 32px rgba(0,0,0,0.5)` }}>
                {/* Square avatar wrapper with corner accents */}
                <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 18px' }}>
                  {/* Glow layer behind image */}
                  <div style={{ position: 'absolute', inset: 4, borderRadius: '12px', boxShadow: `0 0 28px ${col}50`, background: `${col}08` }} />
                  {/* Corner accent lines */}
                  <span style={topLeftCorner(col)} />
                  <span style={topRightCorner(col)} />
                  <span style={bottomLeftCorner(col)} />
                  <span style={bottomRightCorner(col)} />
                  {/* Main image — square with rounded corners */}
                  <img
                    src={barber.image}
                    alt={barber.name}
                    style={{ position: 'absolute', inset: 6, width: 'calc(100% - 12px)', height: 'calc(100% - 12px)', borderRadius: '10px', objectFit: 'cover', objectPosition: 'top' }}
                  />
                  {/* Status badge — bottom right */}
                  <span style={{
                    position: 'absolute', bottom: 6, right: 6,
                    width: 14, height: 14, borderRadius: '50%',
                    background: col, border: '2.5px solid #191514',
                    boxShadow: `0 0 10px ${col}`,
                  }} />
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f9f6f2', marginBottom: '3px', letterSpacing: '0.5px' }}>{barber.name.split(' ')[0]}</div>
                <div style={{ fontSize: '0.78rem', color: '#8a7a6a', marginBottom: '12px', fontStyle: 'italic' }}>{barber.role}</div>
                <div style={{
                  display: 'inline-block',
                  fontSize: '0.68rem', fontWeight: 800, padding: '3px 14px', borderRadius: '20px',
                  color: col, background: `${col}18`, border: `1px solid ${col}45`, letterSpacing: '0.8px',
                }}>
                  {st}
                </div>
                <div style={{ marginTop: '14px', fontSize: '0.8rem', color: '#d5a353', fontWeight: 600 }}>
                  Tap to Book →
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
                        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 12px' }}>
                          <img
                            src={selectedBarber.image}
                            alt={selectedBarber.name}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${statusColor(selectedBarber)}`, boxShadow: `0 0 24px ${statusColor(selectedBarber)}55` }}
                          />
                          <span style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: statusColor(selectedBarber), border: '2.5px solid #161210' }} />
                        </div>
                        <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2rem', color: '#d5a353', marginBottom: '2px', letterSpacing: '1px' }}>{selectedBarber.name}</h3>
                        <p style={{ fontFamily: "'Merriweather', serif", fontStyle: 'italic', fontSize: '0.85rem', color: '#a89a8a', marginBottom: '8px' }}>{selectedBarber.role}</p>
                        <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: '20px', color: statusColor(selectedBarber), background: `${statusColor(selectedBarber)}18`, border: `1px solid ${statusColor(selectedBarber)}40`, letterSpacing: '0.5px' }}>
                          {statusText(selectedBarber)}
                        </span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #d5a353, #b8863b)', color: '#191514', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.8rem', boxShadow: '0 0 24px rgba(213,163,83,0.4)' }}>✂️</div>
                        <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2rem', color: '#d5a353', marginBottom: '2px', letterSpacing: '1px' }}>Any Master Barber</h3>
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
  background: 'linear-gradient(145deg, rgba(28,22,18,0.97), rgba(20,16,13,0.99))',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '16px',
  padding: '28px 20px 22px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(4px)',
};

const anyCardStyle: React.CSSProperties = {
  ...barberCardStyle,
  border: '1px solid rgba(213,163,83,0.25)',
  boxShadow: '0 0 0 1px rgba(213,163,83,0.15), 0 8px 32px rgba(0,0,0,0.5)',
  background: 'linear-gradient(145deg, rgba(35,28,18,0.97), rgba(28,22,14,0.99))',
};

const anyAvatarStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #d5a353, #b8863b)',
  color: '#191514',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '3rem',
  boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.15)',
};

/* Corner accent helpers */
const cornerBase: React.CSSProperties = {
  position: 'absolute',
  width: '18px',
  height: '18px',
  zIndex: 2,
};

const topLeftCorner = (col: string): React.CSSProperties => ({
  ...cornerBase,
  top: 0, left: 0,
  borderTop: `2.5px solid ${col}`,
  borderLeft: `2.5px solid ${col}`,
  borderRadius: '4px 0 0 0',
});

const topRightCorner = (col: string): React.CSSProperties => ({
  ...cornerBase,
  top: 0, right: 0,
  borderTop: `2.5px solid ${col}`,
  borderRight: `2.5px solid ${col}`,
  borderRadius: '0 4px 0 0',
});

const bottomLeftCorner = (col: string): React.CSSProperties => ({
  ...cornerBase,
  bottom: 0, left: 0,
  borderBottom: `2.5px solid ${col}`,
  borderLeft: `2.5px solid ${col}`,
  borderRadius: '0 0 0 4px',
});

const bottomRightCorner = (col: string): React.CSSProperties => ({
  ...cornerBase,
  bottom: 0, right: 0,
  borderBottom: `2.5px solid ${col}`,
  borderRight: `2.5px solid ${col}`,
  borderRadius: '0 0 4px 0',
});
