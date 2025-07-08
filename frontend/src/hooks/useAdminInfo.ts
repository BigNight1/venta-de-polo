import { useContext } from 'react';
import { AdminInfoContext } from '../context/AdminInfoContext';

export const useAdminInfo = () => {
  const context = useContext(AdminInfoContext);
  if (!context) {
    throw new Error('useAdminInfo must be used within an AdminInfoProvider');
  }
  return context;
}; 