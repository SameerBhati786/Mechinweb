import React from 'react';
import { validatePassword } from '../utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  showDetails = true 
}) => {
  const validation = validatePassword(password);

  const getStrengthColor = () => {
    switch (validation.strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthWidth = () => {
    switch (validation.strength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-sm text-gray-400">Password Strength:</span>
        <span className={`text-sm font-medium ${
          validation.strength === 'weak' ? 'text-red-400' :
          validation.strength === 'medium' ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1)}
        </span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}></div>
      </div>

      {showDetails && validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-xs text-red-400 flex items-center">
              <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;