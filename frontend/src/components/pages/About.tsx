import React from 'react';
import { Heart, Shield, Truck, Award, Users, Globe } from 'lucide-react';

export const About: React.FC = () => {
  const values = [
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: 'Pasión por la Calidad',
      description: 'Cada polo es cuidadosamente seleccionado para garantizar la máxima calidad y durabilidad.',
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: 'Compra Segura',
      description: 'Tu seguridad es nuestra prioridad. Utilizamos los más altos estándares de seguridad.',
    },
    {
      icon: <Truck className="h-8 w-8 text-green-500" />,
      title: 'Envío Rápido',
      description: 'Entrega en 24-48 horas en península. Envío gratuito en pedidos superiores a 50S/.',
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      title: 'Garantía de Satisfacción',
      description: 'Si no estás satisfecho, te devolvemos el dinero. Sin preguntas, sin complicaciones.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Clientes Satisfechos' },
    { number: '50,000+', label: 'Polos Vendidos' },
    { number: '99%', label: 'Satisfacción del Cliente' },
    { number: '24/7', label: 'Atención al Cliente' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sobre PoloStore
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Desde 2020, nos dedicamos a ofrecer los mejores polos de calidad premium 
              para toda la familia, combinando estilo, comodidad y durabilidad.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  PoloStore nació de una simple observación: era difícil encontrar polos 
                  que combinaran calidad, estilo y precio justo. Fundada por un equipo 
                  apasionado por la moda y la calidad, decidimos crear una marca que 
                  ofreciera exactamente eso.
                </p>
                <p>
                  Comenzamos con una pequeña colección de polos clásicos y, gracias a 
                  la confianza de nuestros clientes, hemos crecido hasta convertirnos 
                  en una de las tiendas online de polos más reconocidas de España.
                </p>
                <p>
                  Hoy, trabajamos directamente con fabricantes seleccionados que 
                  comparten nuestros valores de calidad y sostenibilidad, asegurando 
                  que cada polo que vendemos cumple con nuestros altos estándares.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg"
                alt="Equipo PoloStore"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">4+</div>
                  <div className="text-sm">Años de experiencia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los principios que guían cada decisión que tomamos y cada producto que ofrecemos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Números que nos Respaldan
            </h2>
            <p className="text-xl text-blue-100">
              La confianza de nuestros clientes es nuestro mayor logro
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Nuestra Misión
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Democratizar el acceso a polos de alta calidad, ofreciendo productos 
                excepcionales a precios justos para toda la familia.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Nuestra Visión
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Ser la marca de referencia en polos online en España, reconocida 
                por nuestra calidad, servicio al cliente y compromiso con la sostenibilidad.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Nuestro Compromiso
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Mantener los más altos estándares de calidad en cada producto y 
                ofrecer una experiencia de compra excepcional en cada interacción.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para Descubrir la Diferencia?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a miles de clientes satisfechos y descubre por qué PoloStore 
            es la elección preferida para polos de calidad premium.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Ver Colección
            </button>
            <button 
              onClick={() => window.location.href = '/contact'}
              className="border border-gray-600 hover:border-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Contactar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};