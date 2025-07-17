import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  glow = false, 
  hover = true,
  padding = 'lg'
}) => {
  const { isDarkMode } = useTheme();

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border transition-all duration-300 
      ${hover ? 'hover:scale-[1.02]' : ''}
      ${isDarkMode 
        ? 'bg-slate-800/40 border-slate-700/50 backdrop-blur-xl' 
        : 'bg-white/40 border-white/20 backdrop-blur-xl'
      } 
      ${glow ? 'shadow-2xl shadow-blue-500/10' : 'shadow-xl shadow-black/5'}
      ${className}
    `}>
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
      )}
      <div className={`relative z-10 ${paddingClasses[padding]}`}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;