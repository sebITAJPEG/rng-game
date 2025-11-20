import React from 'react';
import { RARITY_TIERS } from '../constants';
import { RarityId } from '../types';

interface Props {
  rarityId: RarityId;
  size?: 'sm' | 'md' | 'lg';
  label?: string; // Optional override for localization
}

export const RarityBadge: React.FC<Props> = ({ rarityId, size = 'md', label }) => {
  const tier = RARITY_TIERS[rarityId];
  
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-lg px-4 py-2"
  };

  const style = {
    color: tier.id >= RarityId.LEGENDARY ? tier.textColor.replace('text-', '') : undefined, 
    textShadow: tier.id >= RarityId.MYTHICAL ? `0 0 10px ${tier.shadowColor}, 0 0 20px ${tier.shadowColor}` : 'none',
  };

  return (
    <span 
      className={`
        ${sizeClasses[size]} 
        border ${tier.color} 
        ${tier.textColor} 
        font-bold uppercase tracking-widest
        bg-black/50 backdrop-blur-sm
        rounded
        ${tier.animate ? 'animate-pulse' : ''}
      `}
      style={{
        boxShadow: tier.id >= RarityId.DIVINE ? `0 0 15px ${tier.shadowColor}` : 'none',
        ...style
      }}
    >
      {label || tier.name}
    </span>
  );
};