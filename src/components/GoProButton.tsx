import React, { useState } from 'react';
import ProUpgradeModal from './ProUpgradeModal';

interface GoProButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function GoProButton({ className = "", onClick }: GoProButtonProps) {
  const [showProModal, setShowProModal] = useState(false);

  const handleClick = () => {
    setShowProModal(true);
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className={`glossy-green text-black dark:border-white px-6 py-2 rounded-full text-sm font-black uppercase italic flex items-center gap-2 hover:scale-105 transition-transform ${className}`}
      >
        <span className="material-symbols-outlined text-sm">upgrade</span>
        Go Pro
      </button>
      
      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
      />
    </>
  );
}
