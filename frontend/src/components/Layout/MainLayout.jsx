import React from 'react';
import Navbar from './Navbar';
import CarritoSidebar from '../Cart/CarritoSidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="main-bg">
      <Navbar />
      <main>
        {children}
      </main>
      <CarritoSidebar />
      <footer className="main-footer">
        &copy; {new Date().getFullYear()} Tienda de Polos. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default MainLayout; 