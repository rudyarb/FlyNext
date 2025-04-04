import React from 'react';

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      className={`${value === index ? 'block' : 'hidden'}`}
    >
      {value === index && <div className="py-4">{children}</div>}
    </div>
  );
};

export default TabPanel;