import React from "react";
import "./Nosotros.css";
import Support from "../Support/Support";
import Footer from "../Footer/Footer";
import Empresas from "../Empresa/Empresas";
const Nosotros = () => {
  return (
    <div>
      <section className="bg-image">
        <div className="container-welcome">
          <div className="elementor-column">
            <div className="flex items-end justify-center h-full">
              <h2 className="text-white uppercase font-semibold text-4xl pb-10 font-Roboto shadow">
                ¡BIENVENIDO!
              </h2>
            </div>
          </div>
        </div>
      </section>
      <section className="us">
        <div className="aboutus">
          <div className="description">
            <div>
              <h2 className="font-Roboto font-bold text-[#36a9e1] text-3xl uppercase mb-5">
                Sobre Nosotros
              </h2>
            </div>
            <div className="font-Roboto text-[15px] text-[#595959]">
              <p className="mb-[10px]">
                Lima Highlights Tours S.A.C. es una empresa tour operadora legal
                debidamente registrada y bajo las leyes del gobierno peruano.
                Está dirigido por profesionales de la industria del turismo con
                título de certificación en este sector.
              </p>
              <p className="mb-[10px]">RUC: 20605078134</p>
              <p className="mb-[10px]">
                Nació con la idea de crear experiencias únicas para viajeros de
                todo el mundo. Llevamos muchos años trabajando en el negocio de
                turismo. Estamos especializados en realizar recorridos únicos en
                la ciudad de Lima con pequeños grupos de 8 viajeros. Además,
                realizamos tours privados, excursiones desde el aeropuerto y
                también para cruceros.
              </p>
              <p className="mb-[10px]">
                Podemos decir con seguridad que somos la única empresa operadora
                de turismo que ofrece la mayor variedad de tours en Lima, Perú.
                Además de esto, entregamos experiencias temáticas para aquellos
                que quieren algo diferente. Haremos todo lo posible para que
                tenga momentos inolvidables en nuestra ciudad.
              </p>
            </div>
          </div>
          <div className="img-aboutus">
            <img src="/image/13.webp" alt="" />
          </div>
        </div>
      </section>
      <section className="nuestro_equipo">
        <div className="box_team flex">
          <div className="text_team ">
            <div className="pr-[40px]">
              <h2 className="text-[#36a9e1] font-Roboto font-bold uppercase text-3xl">
                SOBRE NUESTRO EQUIPO
              </h2>
              <div className="font-Roboto text-[15px] font-normal text-[#595959]">
                <p>
                  Nuestros guías locales expertos están completamente
                  capacitados para hacer que su visita a Lima sea inolvidable.
                  Son profesionales, certificados y reconocidos por el
                  ministerio de turismo del Perú.
                </p>
                <p>
                  Todos ellos han estudiado durante años en la facultad de
                  turismo de Lima para convertirse en guías turísticos oficiales
                  y obtener su carnet/licencia (obligatoria para guiar en
                  cualquier lugar del Perú según la ley N ° 28529, ley de Guías
                  Oficiales de Turismo en el Perú).
                </p>
                <p>
                  Poseen amplios conocimientos en historia, arquitectura, arte,
                  literatura, gastronomía, flora, fauna y siempre están leyendo
                  y estudiando cada vez más como parte de su crecimiento
                  profesional y personal.
                </p>
                <p>
                  Somos expertos locales, apasionados por lo que hacemos y todos
                  haremos que disfrute cada minuto que esté en tours con
                  nosotros.
                </p>
                <p>Esperamos verle pronto.</p>
                <p>
                  Si tienes alguna duda o consulta, No dudes en hacérnosla
                  saber. Te responderemos atentamente lo más pronto posible.
                </p>
              </div>
            </div>
          </div>
          <div className="img_team">
            <img src="/image/10@2x.webp" alt="" />
          </div>
        </div>
      </section>
      <section className="certificacion">
        <div className="flex justify-center font-Roboto italic font-medium text-xl uppercase text-white">
          <a href="#" className="bg-[#36a9e1] py-1 px-4 rounded-full">
            <span className="">Ver certificados de la Empresa</span>
          </a>
        </div>
      </section>
      {/* Empresas */}

      <Empresas />
      {/* Support */}

      <Support />
      {/* Foooter */}
      <Footer />
    </div>
  );
};

export default Nosotros;
