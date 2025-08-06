// frontend/src/components/cart/CartIcon.js
import React from 'react';
import { useCart } from '../../contexts/CartContext';

const CartIcon = ({ onClick, className = '' }) => {
  const { cart } = useCart();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 ${className}`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5A1 1 0 006.8 19H19M7 13v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19v2m6-2v2"
        />
      </svg>
      {cart.total_items > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
          {cart.total_items}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
