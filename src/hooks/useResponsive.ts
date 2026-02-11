import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  width: number;
}

export const useResponsive = (): ResponsiveInfo => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const deviceType: DeviceType = isMobile
    ? 'mobile'
    : isTablet
    ? 'tablet'
    : 'desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    width
  };
};
