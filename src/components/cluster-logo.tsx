import React from 'react';

export const ClusterLogo = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
 
      </div>
      <span className="text-white font-bold text-2xl monument-font">Cluster</span>
    </div>
  );
};

export const DefiLogo = () => {
  return (
    <div className="flex items-center space-x-0">
      <div className="relative h-10 w-10">
        <img 
          src="/02_WHITE (1) (1).png" 
          alt="Yapps Logo" 
          className="object-contain w-full h-full"
        />
      </div>
      <div className="relative h-10 w-24">
        <img 
          src="/02_WHITE (2).png" 
          alt="Secondary Logo" 
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
};
