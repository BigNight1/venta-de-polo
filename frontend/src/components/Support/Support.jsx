import React from "react";
import { American, Mastercard, Paypal, Visa } from "../icons/Pagos";
import { Getyourguide, Tripadvisor, Viator } from "../icons/recommends";
import { Logocolores } from "../icons/Logo";
import "./support.css";
import {
  FacebookIcon,
  InstagramIcon,
  TwiterIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "../icons/Icons-Social";

const Support = () => {
  return (
    <div className="flex mx-auto relative max-w-[1140px]  font-Roboto uppercase text-[#595959] box_support">
      {/* Sección de Contacto */}
      <div className="contact">
        <div className=" img-logo-contact">
          <Logocolores />
        </div>
        <div className=" contact-description">
          <div className="contacts mt-6">
            <h3 className="font-bold leading-[21px]">Contáctenos</h3>
          </div>
          <div className="contacts">
            <span className="font-Roboto font-medium text-[11px] leading-[11px]">
              Contactar por WhatsApp
            </span>
            <div className="text-[16px] leading-[19px]">+51 987 654 321</div>
          </div>
          <div className="contacts bg-[#595959] inline-block rounded-[5rem] p-2 mb-2">
            <p className="text-[11px] leading-[11px] text-white normal-case">
              Lunes a domingo, 24 horas disponibles
            </p>
          </div>
          <div className="contacts">
            <h2 className="text-[12px] leading-[12px] font-medium">
              Email de contacto
            </h2>
            <span className="text-[16px] leading-[19px] italic normal-case">
              contact@limahighlights.com
            </span>
          </div>
          <div className="contacts">
            <h2 className="text-[12px] leading-[12px] font-medium">
              Email de Reservación
            </h2>
            <span className="text-[16px] leading-[19px] italic normal-case">
              reservas@limahighlights.com
            </span>
          </div>
          <div className="contacts">
            <h2 className="text-[12px] leading-[12px] font-medium">
              Para Negocios
            </h2>
            <span className="text-[16px] leading-[19px] italic normal-case">
              negocios@limahighlights.com
            </span>
          </div>
        </div>
      </div>

      {/* Sección de Pago Seguro */}
      <div className="flex  flex-col items-center pay_sure">
        <h3 className="font-Roboto font-bold uppercase mb-6">Pago Seguro</h3>
        {/* Íconos de métodos de pago */}
        <div className="flex items-center w-full min-h-[70px]">
          <div className="methods w-1/2 ">
            <div className="box-pay">
              <div className="w-full flex justify-center">
                <Paypal className="icon-movil" />
              </div>
            </div>
          </div>
          <div className="methods w-1/2 ">
            <div className=" box-pay">
              <div className="w-full  flex justify-center">
                <Mastercard className="icon-movil" />
              </div>
            </div>
          </div>
        </div>
        {/* Íconos de métodos de pago */}
        <div className="flex items-center w-full min-h-[70px]">
          <div className="methods w-1/2 ">
            <div className="box-pay">
              <div className="w-full flex justify-center">
                <Visa className="icon-movil" />
              </div>
            </div>
          </div>
          <div className="methods w-1/2 ">
            <div className="box-pay">
              <div className="w-full flex justify-center">
                <American className="icon-movil" />
              </div>
            </div>
          </div>
        </div>
        {/* Línea de separación */}
        <div className="w-1/2 border-t-2 border-black"></div>
        {/* íconos de redes sociales*/}
        <div className="flex gap-3 mt-3 text-center">
          <div className="">
            <FacebookIcon className="icon" />
          </div>
          <div>
            <InstagramIcon className="icon" />
          </div>
          <div>
            <TwiterIcon className="icon" />
          </div>
          <div>
            <YoutubeIcon className="icon" />
          </div>
          <div>
            <WhatsAppIcon className="icon" />
          </div>
        </div>
      </div>

      {/* Sección de Recomendados */}
      <div className="flex flex-col items-center  recommend">
        <h3 className="font-Roboto font-bold text-[#595959] uppercase pb-[30px]">
          Recomendados en
        </h3>
        <div className="flex flex-col items-center">
          {/* Íconos de recomendaciones */}
          <div className="recommended pb-[30px]">
            <a href="#">
              <Tripadvisor />
            </a>
          </div>
          <div className="recommended pb-[30px]">
            <a href="#">
              <Getyourguide />
            </a>
          </div>
          <div className="recommended pb-[30px]">
            <a href="#">
              <Viator />
            </a>
          </div>

          {/* Línea de separación */}
          <div className="terms py-3">
            <div className="border-t-2 border-black"></div>
            <a href="#">
              <span className="font-Roboto font-medium text-xs text-[#707070]">
                TÉRMINOS Y CONDICIONES
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
