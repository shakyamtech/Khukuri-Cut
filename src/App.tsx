import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Main site components
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

// Admin pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAppointments } from './pages/admin/AdminAppointments';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminProducts } from './pages/admin/AdminProducts';

// ─── Main Site Page ───────────────────────────────────────────────────────────
function MainSite() {
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
    alert('Thank you for ordering with Khukuri Cut Kathmandu! We will contact you to confirm payment and delivery.');
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
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onBookClick={() => scrollToSection('appointment')}
        cartCount={totalCartCount}
      />
      <Navigation
        isMenuOpen={isMenuOpen}
        isSearchOpen={isSearchOpen}
        onCloseMenu={() => setIsMenuOpen(false)}
        onCloseSearch={() => setIsSearchOpen(false)}
        onNavigate={scrollToSection}
      />
      <Welcome onLearnMore={() => scrollToSection('services')} />
      <Services onBookService={handleBookService} />
      <Testimonials />
      <Staff />
      <PriceList onBookClick={() => scrollToSection('appointment')} />
      <Shop onAddToCart={handleAddToCart} />
      <AppointmentForm initialService={bookingService} />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
      <Footer />
    </div>
  );
}

// ─── App with Router ──────────────────────────────────────────────────────────
export function App() {
  return (
    <Routes>
      {/* Main website */}
      <Route path="/" element={<MainSite />} />

      {/* Admin login */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* Admin panel (protected layout) */}
      <Route path="/admin/dashboard" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
      </Route>
      <Route path="/admin/appointments" element={<AdminLayout />}>
        <Route index element={<AdminAppointments />} />
      </Route>
      <Route path="/admin/services" element={<AdminLayout />}>
        <Route index element={<AdminServices />} />
      </Route>
      <Route path="/admin/staff" element={<AdminLayout />}>
        <Route index element={<AdminStaff />} />
      </Route>
      <Route path="/admin/products" element={<AdminLayout />}>
        <Route index element={<AdminProducts />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
