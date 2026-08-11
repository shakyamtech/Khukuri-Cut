import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';

interface AppointmentFormProps {
  initialService?: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ initialService = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '12:00 PM',
    service: initialService || 'HAIRCUTTING',
    notes: '',
    accepted: false,
  });

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

              <div style={{ marginBottom: '20px' }}>
                <textarea
                  className="form_textarea"
                  rows={4}
                  placeholder="Special instructions or hair style preferences..."
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
