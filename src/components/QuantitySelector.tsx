import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface QuantitySelectorProps {
  label: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  unitPrice: number;
  currency: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  label,
  quantity,
  onQuantityChange,
  min = 1,
  max = 1000,
  unitPrice,
  currency
}) => {
  // The unitPrice passed here should already be converted to the user's currency
  const totalPrice = quantity * unitPrice;

  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min;
    if (value >= min && value <= max) {
      onQuantityChange(value);
    }
  };


  return (
    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <label className="text-white font-medium">{label}</label>
        <span className="text-cyan-400 font-semibold">
          {formatCurrency(unitPrice, currency)} each
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDecrease}
            disabled={quantity <= min}
            className="w-8 h-8 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          
          <input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="w-16 text-center bg-gray-600 border border-gray-500 rounded-lg py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          
          <button
            onClick={handleIncrease}
            disabled={quantity >= max}
            className="w-8 h-8 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div className="flex-1 text-right">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-white font-bold text-lg">
            {formatCurrency(totalPrice, currency)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuantitySelector;