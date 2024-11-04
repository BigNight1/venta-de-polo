import Empresas from "../Empresa/Empresas.jsx";
import Footer from "../Footer/Footer.jsx";
import Support from "../Support/Support";
import "./Home.css";

export const Home = () => {
  const Paisajes = [
    {
      name: "Las Islas Ballestas + La Reserva Nacional de Paracas",
      img: "/image/Paracas.webp",
      price: "120",
    },
    {
      name: "Las Islas Ballestas + La Reserva Nacional de Paracas",
      img: "/image/Paracas.webp",
      price: "120",
    },
    {
      name: "Las Islas Ballestas + La Reserva Nacional de Paracas",
      img: "/image/Paracas.webp",
      price: "120",
    },
    {
      name: "Las Islas Ballestas + La Reserva Nacional de Paracas",
      img: "/image/Paracas.webp",
      price: "120",
    },
    {
      name: "Las Islas Ballestas + La Reserva Nacional de Paracas",
      img: "/image/Paracas.webp",
      price: "120",
    },
    {
      name: "Las Islas Ballestas + La Reserva Nacional de Paracas",
      img: "/image/Paracas.webp",
      price: "120",
    },
  ];
  return (
    <div>
      {/*Img Viaja con nosotros */}
      <div className="img-BoxTravel pb-8">
        <img src="/image/slider.webp" alt="" className="w-full" />
      </div>
      {/* Explore lima con nosotros  */}
      <div className="section2 flex flex-col items-center  max-w-[1200px] mx-auto">
        <h2 className="text-[22px] font-bold	text-[#36a9e1] items-center">
          ¡EXPLORE LIMA CON NOSOTROS!
        </h2>

        <div className="BoxExplore py-5 items-center">
          <img src="/image/referencia.jpg" alt="" className="img-referencia" />
          <div className="text-pretty welcome_tour">
            <h5 className="font-semibold text-[20px]  text-[#302F2F] ">
              Bienvenidos! Ofrecemos experiencias culturales con grupos
              pequeños, que incluyen recojo y retornoa su hotel o departamento
              en Lima (Miraflores, San Isidro, Barranco, etc.). Nuestros guías
              expertos están capacitados para ofrecerle una experiencia
              inolvidable. ¡La excelente calidad del servicio nos caracteriza!
              <br></br>
              <br></br>
              ¡Ven y descubre la fascinante historia de la ciudad de Lima con un
              guía local!
            </h5>
          </div>
        </div>
      </div>

      {/* Tours */}
      <div className="Section3 py-[3rem]">
        <div className="mx-auto gap-5 max-w-[1200px] box-tour">
          <h3 className="text-center text-[#36a9e1] font-bold Texto_tour  ">
            TOURS MÁS POPULARES EN LIMA
          </h3>
          {Paisajes.map((paisaje, index) => (
            <div className="BoxPriceTravel " key={index}>
              <div className="lugar-img">
                <img
                  className="img-lugares"
                  src={paisaje.img}
                  alt={paisaje.name}
                />
              </div>
              <div>
                <div className="name">
                  <h4 className="text-[#36a9e1] font-bold text-[20px] px-2 pt-5 uppercase leading-6">
                    {paisaje.name}
                  </h4>
                </div>
                <div className="flex items-center">
                  <div className="justify-items-center w-[50%]">
                    <img
                      className="w-[90%] px-2"
                      src="/image/5stars.webp"
                      alt="Estrellas de Calificación"
                    />
                  </div>
                  {/* price box */}
                  <div className="precio bg-[#36A9E1] text-white font-medium p-3 w-[50%]">
                    <div>
                      <div className="desde text-center w-full">
                        <div className="text text-white text-[11px] font-medium italic">
                          DESDE:
                        </div>
                      </div>
                      {/* number box */}
                      <div className="flex items-center justify-center">
                        <div className="numero pl-4">
                          <div className="text-[30px] font-bold leading-[1.2em]">
                            <sup className="text-[0.6em]">$</sup>
                            {paisaje.price}
                          </div>
                        </div>
                        <div className="persona">
                          <div className="px-1">
                            <span className="text-white text-[11px] font-medium italic ">
                              *Por Persona
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Empresa confiable */}
      <div className="empresasbox py-3">
        <h3 className="text-center text-3xl font-bold	text-[#36a9e1] pb-4">
          Empresa confiable dirigida por expertos
        </h3>
        <Empresas />
      </div>
      {/* Support */}
      <Support />

      <Footer />
    </div>
  );
};
