import React, { useState } from 'react';
import { Scissors, ChevronRight, X } from 'lucide-react';

export interface ServiceItem {
  id: string;
  title: string;
  price: string;
  image: string;
  icon: string;
  description: string;
  details: string;
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'haircutting',
    title: 'HAIRCUTTING',
    price: 'Rs 800',
    image: '/images/service_haircut.png',
    icon: 'scissors',
    description: 'Precision scissor work and fade styling tailored to your scalp shape and personality.',
    details: 'Our haircutting service includes a consultation, scalp massage, hair wash, precision haircut by senior Nepali barbers, style shaping, and premium pomade finish.',
  },
  {
    id: 'shaving',
    title: 'SHAVING',
    price: 'Rs 500',
    image: '/images/service_shave.png',
    icon: 'razor',
    description: 'Traditional hot towel straight razor shave with soothing organic eucalyptus oils.',
    details: 'Indulge in a classic hot towel shave. Features pre-shave warm oil treatment, rich badger-brush lathering, dual-pass straight razor shaving, and post-shave cold towel conditioning.',
  },
  {
    id: 'styling',
    title: 'STYLING',
    price: 'Rs 600',
    image: '/images/service_styling.png',
    icon: 'comb',
    description: 'Signature blow-dry, pompadour sculpting, and long-lasting hair texturizing.',
    details: 'Perfect for special events, weddings, and formal occasions. Includes hair wash, blow-drying, hair clay application, and precision edge lining.',
  },
  {
    id: 'trimming',
    title: 'TRIMMING',
    price: 'Rs 400',
    image: '/images/service_trimming.png',
    icon: 'trimmer',
    description: 'Expert beard shaping, mustache contouring, and neck line cleaning.',
    details: 'Keep your beard sharp and healthy. Includes clipper work, straight-razor cheek line cleanup, beard oil massage, and conditioning balm.',
  },
];

interface ServicesProps {
  onBookService: (serviceTitle: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onBookService }) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  return (
    <section className="services_section" id="services">
      <div className="content_wrap">
        <div className="section_title_wrap">
          <h2 className="section_title">OUR SERVICES</h2>
          <p className="section_subtitle">
            Berger Barbershop provides authentic premium grooming services crafted specifically for modern Nepali gentlemen.
          </p>
          <div className="separator_line"></div>
        </div>

        <div className="services_grid">
          {SERVICES_DATA.map((service) => (
            <div className="service_card" key={service.id}>
              <div className="service_img_wrap">
                <img src={service.image} alt={service.title} />
              </div>
              <div className="service_card_body">
                <div className="service_icon_badge">
                  <Scissors size={24} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div style={{ color: '#d5a353', fontWeight: 700, marginBottom: '15px', fontSize: '1.2rem' }}>
                  {service.price}
                </div>
                <button
                  className="read_more_btn"
                  onClick={() => setSelectedService(service)}
                >
                  <span>READ MORE</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="modal_overlay" onClick={() => setSelectedService(null)}>
          <div className="modal_content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close_btn"
              style={{ position: 'absolute', top: '15px', right: '15px' }}
              onClick={() => setSelectedService(null)}
            >
              <X size={24} />
            </button>
            <div style={{ height: '220px', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
              <img
                src={selectedService.image}
                alt={selectedService.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h3 style={{ fontSize: '2.5rem', color: '#d5a353', marginBottom: '10px' }}>
              {selectedService.title}
            </h3>
            <p style={{ color: '#d5a353', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px' }}>
              Price: {selectedService.price}
            </p>
            <p style={{ color: '#d8cfc4', fontSize: '1rem', lineHeight: '1.7', marginBottom: '30px' }}>
              {selectedService.details}
            </p>
            <button
              className="sc_button"
              onClick={() => {
                const title = selectedService.title;
                setSelectedService(null);
                onBookService(title);
              }}
            >
              BOOK THIS SERVICE
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
