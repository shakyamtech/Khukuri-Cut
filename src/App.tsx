import { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Welcome } from './components/Welcome';
import { Services } from './components/Services';
import { Testimonials } from './components/Testimonials';
import { Staff } from './components/Staff';
import { PriceList } from './components/PriceList';
import { Shop } from './components/Shop';
import type { ProductItem } from './components/Shop';
import { AppointmentForm } from './components/AppointmentForm';
import { CartDrawer } from './components/CartDrawer';
import type { CartItem } from './components/CartDrawer';
import { Footer } from './components/Footer';

export function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bookingService, setBookingService] = useState<string>('');

  const handleAddToCart = (product: ProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = () => {
    alert('Thank you for ordering with Berger Barbershop Kathmandu! We will contact you to confirm payment and delivery.');
    setCartItems([]);
    setIsCartOpen(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookService = (serviceTitle: string) => {
    setBookingService(serviceTitle);
    scrollToSection('appointment');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#191514' }}>
      {/* Header Banner */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onBookClick={() => scrollToSection('appointment')}
        cartCount={totalCartCount}
      />

      {/* Navigation Drawers */}
      <Navigation
        isMenuOpen={isMenuOpen}
        isSearchOpen={isSearchOpen}
        onCloseMenu={() => setIsMenuOpen(false)}
        onCloseSearch={() => setIsSearchOpen(false)}
        onNavigate={scrollToSection}
      />

      {/* Welcome / About Split Section */}
      <Welcome onLearnMore={() => scrollToSection('services')} />

      {/* Services Section */}
      <Services onBookService={handleBookService} />

      {/* Testimonials & Brands Section */}
      <Testimonials />

      {/* Our Staff Section */}
      <Staff />

      {/* Price List Section */}
      <PriceList onBookClick={() => scrollToSection('appointment')} />

      {/* Grooming E-Commerce Shop Section */}
      <Shop onAddToCart={handleAddToCart} />

      {/* Appointment Booking Section */}
      <AppointmentForm initialService={bookingService} />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Site Footer */}
      <Footer />
    </div>
  );
}

export default App;
