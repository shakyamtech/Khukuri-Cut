import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  text: string;
  author: string;
  role: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    text: "Nothing like a neat beard and a proper fade haircut makes a man look truly stylish. I appreciate Laxman's incredible attention to detail at Khukuri Cut. The hot towel shave is pure luxury in Kathmandu!",
    author: "Bishal Gurung",
    role: "Tech Entrepreneur, Kathmandu",
    rating: 5,
  },
  {
    id: 2,
    text: "I love how hospitality is prioritized here. The staff are welcoming and skilled barbers. Thanks to Subash, I got a pompadour look that everyone compliments. Absolutely the best barbershop in Nepal!",
    author: "Sushant Thapa",
    role: "Photographer & Creative Director",
    rating: 5,
  },
  {
    id: 3,
    text: "Top-notch hygiene, vintage aesthetic, and skilled hands. I visited Khukuri Cut Durbar Marg before my wedding and got a haircut & beard trim combo. Couldn't be happier with the results!",
    author: "Prashant Shrestha",
    role: "Architect, Lalitpur",
    rating: 5,
  },
];

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const current = TESTIMONIALS[currentIndex];

  const btnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #d5a353',
    color: '#d5a353',
    padding: 8,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  return (
    <section className="testimonials_section" id="testimonials">
      <div className="content_wrap">
        <div className="section_title_wrap">
          <h2 className="section_title dark_theme">TESTIMONIALS</h2>
          <p className="section_subtitle" style={{ color: '#d8cfc4' }}>
            Hear what our esteemed clients in Kathmandu say about their experience at Khukuri Cut.
          </p>
          <div className="separator_line"></div>
        </div>

        {/* Testimonial Box */}
        <div className="testimonial_slider_box">
          <div className="quote_mark">“</div>
          <p className="testimonial_text">{current.text}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 15 }}>
            {Array.from({ length: current.rating }).map((_, i) => (
              <Star key={i} size={18} fill="#d5a353" color="#d5a353" />
            ))}
          </div>

          <h4 className="testimonial_author">{current.author}</h4>
          <div className="testimonial_role">{current.role}</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 30 }}>
            <button onClick={prevSlide} style={btnStyle} title="Previous Review">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} style={btnStyle} title="Next Review">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Brand Logos */}
        <div className="sponsors_bar">
          <div className="sponsor_badge">HAIR CRAFT</div>
          <div className="sponsor_badge">VINTAGE RAZOR</div>
          <div className="sponsor_badge">BARBER CLUB</div>
          <div className="sponsor_badge">POMADE CO.</div>
          <div className="sponsor_badge">NEPAL TATTOO</div>
        </div>
      </div>
    </section>
  );
};
