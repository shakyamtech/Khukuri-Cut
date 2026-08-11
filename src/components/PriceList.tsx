import React from 'react';
import { ArrowDown } from 'lucide-react';

interface PriceListProps {
  onBookClick: () => void;
}

export const PriceList: React.FC<PriceListProps> = ({ onBookClick }) => {
  return (
    <section className="prices_section" id="prices">
      <div
        className="prices_image_box"
        style={{ backgroundImage: "url('/images/prices_bg.png')" }}
      ></div>

      <div className="prices_content_box">
        <h2>PRICES LIST</h2>
        <p className="sub">
          Transparent pricing for unmatched luxury barbering and hair grooming services.
        </p>

        <table className="prices_table">
          <tbody>
            <tr>
              <td>Haircut (Consultation, Wash & Finish)</td>
              <td>Rs 800</td>
            </tr>
            <tr>
              <td>Hot Towel Straight Razor Shave</td>
              <td>Rs 500</td>
            </tr>
            <tr>
              <td>Haircut + Hot Towel Shave Combo</td>
              <td>Rs 1,200</td>
            </tr>
            <tr>
              <td>Trim (Back & Sides Touch-up)</td>
              <td>Rs 400</td>
            </tr>
            <tr>
              <td>Beard Trim & Sculpting</td>
              <td>Rs 350</td>
            </tr>
            <tr>
              <td>Custom Tattoo Session (Per Hour)</td>
              <td>Rs 2,500</td>
            </tr>
          </tbody>
        </table>

        <div>
          <button className="sc_button" onClick={onBookClick}>
            <ArrowDown size={18} />
            <span>MAKE AN APPOINTMENT</span>
          </button>
        </div>
      </div>
    </section>
  );
};
