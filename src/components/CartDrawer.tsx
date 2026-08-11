import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import type { ProductItem } from './Shop';

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

const emptyContainerStyle: React.CSSProperties = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
};

const fullColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
};

const totalRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 20,
  fontFamily: 'Teko',
  fontSize: '1.8rem',
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const totalSum = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <>
      <div className="drawer_overlay" onClick={onClose} />
      <div className="side_drawer">
        <div className="drawer_header">
          <h3>SHOPPING CART</h3>
          <button className="close_btn" onClick={onClose} title="Close Cart">
            <X size={24} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div style={emptyContainerStyle}>
            <ShoppingBag size={54} color="#d5a353" style={{ marginBottom: 15 }} />
            <p style={{ fontSize: '1.2rem', fontFamily: 'Teko', color: '#f9f6f2' }}>
              YOUR CART IS CURRENTLY EMPTY
            </p>
            <p style={{ fontSize: '0.9rem', color: '#88827b' }}>
              Add grooming razors, pomades, and brushes from the shop.
            </p>
          </div>
        ) : (
          <div style={fullColStyle}>
            <div className="cart_items_list">
              {cartItems.map((item) => (
                <div className="cart_item_row" key={item.product.id}>
                  <img src={item.product.image} alt={item.product.title} className="cart_item_img" />
                  <div className="cart_item_info">
                    <div className="cart_item_title">{item.product.title}</div>
                    <div className="cart_item_price">
                      {item.quantity} x Rs {item.product.price.toLocaleString()}
                    </div>
                  </div>
                  <button
                    style={{ background: 'transparent', color: '#ff5555', padding: 4 }}
                    onClick={() => onRemoveItem(item.product.id)}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
              <div style={totalRowStyle}>
                <span>TOTAL:</span>
                <span style={{ color: '#d5a353' }}>Rs {totalSum.toLocaleString()}</span>
              </div>

              <button className="sc_button" style={{ width: '100%' }} onClick={onCheckout}>
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
