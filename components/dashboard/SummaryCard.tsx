import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footerText?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, footerText }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-700">{value}</p>
        </div>
        <div className="p-2 bg-slate-100 rounded-md">
          {icon}
        </div>
      </div>
      {footerText && (
        <p className="text-xs text-slate-400 mt-2">{footerText}</p>
      )}
    </div>
  );
};

export default SummaryCard;
