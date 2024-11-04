import React from "react";
import { Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { FiAlignJustify } from "react-icons/fi";
import "./Navbar.css";
import { useState } from "react";

export const Navbar = () => {
  // Estado para mantener el idioma actual
  const [language, setLanguage] = useState("es"); // 'es' para español, 'en' para inglés
  const [menuOpen, setMenuOpen] = useState(false);

  // Función para alternar entre inglés y español
  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "es" ? "en" : "es"));
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  return (
    <div className="NavBar">
      <div className="Content">
        <div className="logo">
          <img src="/image/logo.webp" alt="" />
        </div>
        {/* Links From DESKTOP */}
        <nav className="links">
          <ul className="link gap-3 w-full flex items-center">
            <li>
              <Link to="/">INICIO</Link>
            </li>
            <li>
              <Link to="/Nosotros">NOSOTROS</Link>
            </li>
            {/* Tours en Lima */}
            <li className="relative group">
              <Link to="/Tours-en-Lima" className="flex align-center">
                TOURS EN LIMA
                <span className="boton-viajes">
                  <i>
                    <IoIosArrowDown />
                  </i>
                </span>
              </Link>
              <ul className="absolute hidden group-hover:block box-arrow bg-[#514E4E7A] shadow-md  w-full">
                <li className="menu-item">
                  <Link to="/Tours-en-Lima/Viaje-1">Viaje 1</Link>
                </li>
                <li className="menu-item">
                  <Link to="/Tours-en-Lima/Viaje-2">Viaje 2</Link>
                </li>
                <li className="menu-item">
                  <Link to="/Tours-en-Lima/Viaje-3">Viaje 3</Link>
                </li>
              </ul>
            </li>
            {/* Lineas de Nazca */}
            <li className="relative group">
              <Link to="/Lineas-de-Nazca" className="flex align-center">
                Líneas de Nazca
                <span className="boton-viajes">
                  <i>
                    <IoIosArrowDown />
                  </i>
                </span>
              </Link>
              <ul className="absolute hidden group-hover:block box-arrow bg-[#514E4E7A] shadow-md  w-full">
                <li className="menu-item">
                  <Link to="/Lineas-de-Nazca/Viaje-1">Viaje 1</Link>
                </li>
                <li className="menu-item">
                  <Link to="/Lineas-de-Nazca/Viaje-2">Viaje 2</Link>
                </li>
                <li className="menu-item">
                  <Link to="/Lineas-de-Nazca/Viaje-3">Viaje 3</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/Contacto">CONTACTO</Link>
            </li>
          </ul>
        </nav>
        {/* Links From Mobile */}
        <nav className="links_mobile">
          <div
            onClick={toggleMenu}
            className="flex items-center text-xl cursor-pointer"
          >
            <FiAlignJustify className="text-gray-50 text-2xl" />
            <span className="text-gray-50">Menu</span>
          </div>
        </nav>

        {/* Bandera de Language */}
        {language === "es" ? (
          <div
            className="flex items-center cursor-pointer flag"
            onClick={toggleLanguage}
          >
            <img
              src="/image/language-img/English.png"
              alt="English"
              className="h-4 pr-2"
            />
            <span className="text-white">ENG</span>
          </div>
        ) : (
          <div
            className="flex items-center cursor-pointer flag"
            onClick={toggleLanguage}
          >
            <img
              src="/image/language-img/spanish.png"
              alt="Spanish"
              className="h-4 pr-2"
            />
            <span className="text-white">ESP</span>
          </div>
        )}

        {/* Menú móvil desplegable controlado por menuOpen */}
        {menuOpen && (
          <ul className="link_mobile_menu">
            <li>
              <Link to="/" onClick={toggleMenu}>
                INICIO
              </Link>
            </li>
            <li>
              <Link to="/Nosotros" onClick={toggleMenu}>
                NOSOTROS
              </Link>
            </li>
            <li>
              <Link to="/Tours-en-Lima" onClick={toggleMenu}>
                TOURS EN LIMA
              </Link>
            </li>
            <li>
              <Link to="/Lineas-de-Nazca" onClick={toggleMenu}>
                LÍNEAS DE NAZCA
              </Link>
            </li>
            <li>
              <Link to="/Contacto" onClick={toggleMenu}>
                CONTACTO
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};
