import React from 'react';
import { ShoppingCart } from 'lucide-react';

export interface ProductItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  isSale?: boolean;
}

const PRODUCTS: ProductItem[] = [
  {
    id: 'razor-1',
    title: 'Master Tech Extra Sharp Razor',
    price: 4500,
    image: '/images/product_razor.png',
  },
  {
    id: 'brush-1',
    title: 'Faux Feather Light Shave Brush',
    price: 2200,
    image: '/images/product_brush.png',
  },
  {
    id: 'pomade-1',
    title: 'Deluxe Hair Styling Pomade',
    price: 1800,
    originalPrice: 2100,
    image: '/images/product_pomade.png',
    isSale: true,
  },
  {
    id: 'comb-1',
    title: 'Big Red Wooden Beard Comb',
    price: 850,
    image: '/images/product_brush.png',
  },
];

interface ShopProps {
  onAddToCart: (product: ProductItem) => void;
}

export const Shop: React.FC<ShopProps> = ({ onAddToCart }) => {
  return (
    <section className="shop_section" id="shop">
      <div className="content_wrap">
        <div className="section_title_wrap">
          <h2 className="section_title dark_theme">FROM THE SHOP</h2>
          <p className="section_subtitle" style={{ color: '#d8cfc4' }}>
            Handpicked premium grooming tools, straight razors, and organic hair pomades.
          </p>
          <div className="separator_line"></div>
        </div>

        <div className="shop_grid">
          {PRODUCTS.map((product) => (
            <div className="product_card" key={product.id}>
              {product.isSale && <span className="sale_tag">SALE!</span>}
              <div className="product_img_box">
                <img src={product.image} alt={product.title} />
              </div>
              <div>
                <h3 className="product_title">{product.title}</h3>
                <div className="product_price">
                  {product.originalPrice && <del>Rs {product.originalPrice.toLocaleString()}</del>}
                  <span>Rs {product.price.toLocaleString()}</span>
                </div>
              </div>
              <button className="buy_now_btn" onClick={() => onAddToCart(product)}>
                <ShoppingCart size={16} style={{ display: 'inline', marginRight: '6px' }} />
                BUY NOW
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
