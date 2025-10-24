
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="p-6 rounded-lg shadow-lg bg-secondary">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-primary text-accent">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
