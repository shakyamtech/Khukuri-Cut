import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';
import { getStoredStaff, STAFF_UPDATED_EVENT } from '../utils/staffStorage';
import type { StaffMember } from '../utils/staffStorage';

interface AppointmentFormProps {
  initialService?: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ initialService = '' }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(getStoredStaff);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '12:00 PM',
    barber: 'Any Master Barber',
    service: initialService || 'HAIRCUTTING',
    notes: '',
    accepted: false,
  });

  useEffect(() => {
    const handleUpdate = () => {
      setStaffList(getStoredStaff());
    };
    window.addEventListener(STAFF_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(STAFF_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialService) {
      setFormData((prev) => ({ ...prev, service: initialService }));
    }
  }, [initialService]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.date) {
      alert('Please fill out all required fields (Name, Phone number, and Date).');
      return;
    }

    // Save appointment to localStorage for admin panel
    const newAppt = {
      id: `real-${Date.now()}`,
      ...formData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('kc_appointments') || '[]');
    localStorage.setItem('kc_appointments', JSON.stringify([newAppt, ...existing]));

    setIsSubmitted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <section className="appointment_section" id="appointment">
      <div className="content_wrap">
        <div className="section_title_wrap">
          <h2 className="section_title dark_theme">MAKE AN APPOINTMENT</h2>
          <p className="section_subtitle" style={{ color: '#d8cfc4' }}>
            Book your session with Kathmandu's top master barbers in advance.
          </p>
          <div className="separator_line"></div>
        </div>

        <div className="appointment_form_container">
          {isSubmitted ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <CheckCircle2 size={64} color="#d5a353" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '2.5rem', color: '#d5a353', marginBottom: '10px' }}>
                BOOKING CONFIRMED!
              </h3>
              <p style={{ color: '#f9f6f2', fontSize: '1.1rem', marginBottom: '8px' }}>
                Thank you, <strong>{formData.name}</strong>.
              </p>
              <p style={{ color: '#d8cfc4', fontSize: '0.95rem', marginBottom: '25px' }}>
                Your appointment for <strong>{formData.service}</strong> on <strong>{formData.date} at {formData.time}</strong> has been successfully scheduled. We will contact you at {formData.phone} shortly.
              </p>
              <button
                className="sc_button"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    date: '',
                    time: '12:00 PM',
                    barber: 'Any Master Barber',
                    service: 'HAIRCUTTING',
                    notes: '',
                    accepted: false,
                  });
                }}
              >
                BOOK ANOTHER SESSION
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form_grid_2col">
                <div>
                  <input
                    type="text"
                    className="form_input"
                    placeholder="Full Name *"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    className="form_input"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form_grid_2col">
                <div>
                  <input
                    type="tel"
                    className="form_input"
                    placeholder="Phone Number (e.g. 9851000000) *"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <input
                    type="date"
                    className="form_input"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Barber Selector Cards */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#d5a353', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                  SELECT PREFERRED BARBER:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  {/* Any Barber Option */}
                  <div
                    onClick={() => setFormData({ ...formData, barber: 'Any Master Barber' })}
                    style={{
                      background: formData.barber === 'Any Master Barber' ? 'rgba(213, 163, 83, 0.18)' : 'rgba(255,255,255,0.03)',
                      border: formData.barber === 'Any Master Barber' ? '2px solid #d5a353' : '1px solid rgba(213, 163, 83, 0.25)',
                      borderRadius: '12px',
                      padding: '12px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: formData.barber === 'Any Master Barber' ? '0 4px 16px rgba(213, 163, 83, 0.2)' : 'none',
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #d5a353, #b8863b)', color: '#191514', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 800, fontSize: '1.2rem' }}>
                      ✂️
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#f9f6f2', fontWeight: 700 }}>Any Barber</div>
                    <div style={{
                      display: 'inline-block',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      marginTop: '6px',
                      color: '#d5a353',
                      background: 'rgba(213, 163, 83, 0.15)',
                      border: '1px solid rgba(213, 163, 83, 0.3)',
                      letterSpacing: '0.5px'
                    }}>
                      AVAILABLE
                    </div>
                  </div>

                  {/* Individual Barber Avatar Cards */}
                  {staffList.map((barber) => {
                    const isSelected = formData.barber === barber.name;
                    const isAvailable = barber.status === 'available';
                    const isBusy = barber.status === 'busy';
                    const color = isAvailable ? '#22c55e' : isBusy ? '#eab308' : '#ef4444';
                    const statusText = isAvailable ? 'AVAILABLE' : isBusy ? 'IN SESSION' : 'ON LEAVE';

                    return (
                      <div
                        key={barber.id}
                        onClick={() => setFormData({ ...formData, barber: barber.name })}
                        style={{
                          background: isSelected ? `${color}20` : 'rgba(255,255,255,0.03)',
                          border: isSelected ? `2px solid ${color}` : `1px solid ${color}45`,
                          borderRadius: '12px',
                          padding: '12px 8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          boxShadow: isSelected ? `0 4px 20px ${color}35` : 'none',
                          transition: 'all 0.25s ease',
                          transform: isSelected ? 'translateY(-2px)' : 'none',
                        }}
                      >
                        <div style={{ position: 'relative', width: '52px', height: '52px', margin: '0 auto 8px' }}>
                          <img
                            src={barber.image}
                            alt={barber.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: `2px solid ${color}`,
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              background: color,
                              border: '2px solid #191514',
                              boxShadow: isAvailable ? '0 0 8px #22c55e' : 'none',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#f9f6f2', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {barber.name.split(' ')[0]}
                        </div>
                        <div style={{
                          display: 'inline-block',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          marginTop: '6px',
                          color: color,
                          background: `${color}18`,
                          border: `1px solid ${color}35`,
                          letterSpacing: '0.5px'
                        }}>
                          {statusText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form_grid_2col">
                <div>
                  <select
                    className="form_select"
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
                <div>
                  <select
                    className="form_select"
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

              <div style={{ marginTop: '20px', marginBottom: '10px' }}>
                <textarea
                  className="form_textarea"
                  rows={2}
                  placeholder="Special instructions or hair style preferences (Optional)..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>

              <div className="checkbox_row">
                <input
                  type="checkbox"
                  id="agree_terms"
                  required
                  checked={formData.accepted}
                  onChange={(e) => setFormData({ ...formData, accepted: e.target.checked })}
                />
                <label htmlFor="agree_terms">
                  I agree that my submitted booking data is collected and stored for appointment processing.
                </label>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button type="submit" className="sc_button" style={{ width: '100%' }}>
                  SEND MESSAGE / BOOK NOW
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
