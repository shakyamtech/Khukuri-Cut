import React from 'react';
import { ArrowDown } from 'lucide-react';

interface WelcomeProps {
  onLearnMore: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onLearnMore }) => {
  return (
    <section className="welcome_section" id="about">
      <div
        className="welcome_image_box"
        style={{ backgroundImage: "url('/images/about_promo.png')" }}
      ></div>

      <div className="welcome_text_box">
        <h2>WELCOME TO BERGER</h2>
        <h5>
          Berger is an premier vintage barbershop located in the heart of Durbar Marg, Kathmandu
        </h5>
        <p>
          Established with a passion for traditional craftsmanship and contemporary style, Berger Barbershop brings world-class hair grooming, hot towel straight razor shaving, and personalized beard styling to Kathmandu. Our master barbers combine years of artistic mastery with modern techniques to deliver an unparalleled luxury experience.
        </p>

        <div>
          <button className="sc_button sc_button_dark" onClick={onLearnMore}>
            <ArrowDown size={18} />
            <span>MORE ABOUT US</span>
          </button>
        </div>
      </div>
    </section>
  );
};
