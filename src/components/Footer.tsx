import { MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#121212] border-t border-[#2a2a2c] pt-16 pb-8 md:pb-12 text-billanga-gray mt-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Columna 1: Marca y Redes */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-billanga-primary to-green-400">
              BILLANGA
            </h2>
            <p className="text-sm leading-relaxed max-w-xs">
              El mejor ambiente para jugar billar, disfrutar unas cervezas frías y pasarla increíble con amigos. Más de 5 años brindando las mejores mesas de la ciudad.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1c] border border-[#2a2a2c] flex items-center justify-center text-white hover:bg-billanga-primary hover:border-billanga-primary transition-all hover:-translate-y-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.53 11.16 6.5 13 6.5c.88 0 1.82.16 1.82.16v2h-1.03c-1.01 0-1.32.63-1.32 1.27V12h2.34l-.37 3h-1.97v6.8C18.56 20.87 22 16.84 22 12z" /></svg>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1c] border border-[#2a2a2c] flex items-center justify-center text-white hover:bg-billanga-primary hover:border-billanga-primary transition-all hover:-translate-y-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.tiktok.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1c] border border-[#2a2a2c] flex items-center justify-center text-white hover:bg-billanga-primary hover:border-billanga-primary transition-all hover:-translate-y-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.32 5.56C17.65 5.29 16.27 4.15 15.68 2.5H12V16.79C12 18.25 10.74 19.46 9.25 19.46C7.76 19.46 6.5 18.25 6.5 16.79C6.5 15.34 7.76 14.13 9.25 14.13C9.72 14.13 10.15 14.25 10.55 14.46V10.97C9.97 10.83 9.38 10.76 8.79 10.76C5.55 10.76 2.92 13.46 2.92 16.79C2.92 20.13 5.55 22.83 8.79 22.83C12.03 22.83 14.65 20.13 14.65 16.79V8.65C16.48 10.05 18.66 10.66 20.9 10.59V6.88C19.78 6.84 18.78 6.38 19.32 5.56Z" /></svg>
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="#" className="hover:text-billanga-primary transition-colors">Inicio</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-billanga-primary transition-colors">Quiénes Somos</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-billanga-primary transition-colors">Catálogo de Bebidas</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-billanga-primary transition-colors">Eventos y Torneos</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-billanga-primary transition-colors">Zona Admin</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Nuestros Servicios */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Nuestros Servicios</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <span className="hover:text-white cursor-default transition-colors">Alquiler de Mesas VIP</span>
              </li>
              <li>
                <span className="hover:text-white cursor-default transition-colors">Mesas Normales</span>
              </li>
              <li>
                <span className="hover:text-white cursor-default transition-colors">Snacks y Comida Rápida</span>
              </li>
              <li>
                <span className="hover:text-white cursor-default transition-colors">Bebidas Nacionales e Importadas</span>
              </li>
              <li>
                <span className="hover:text-white cursor-default transition-colors">Reservas para Cumpleaños</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contacto</h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-billanga-primary flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Av. Principal #123 / Zona Sur<br />
                  A media cuadra de la plaza.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-billanga-primary flex-shrink-0" />
                <span>+591 7000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="pt-8 border-t border-[#2a2a2c] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>© 2026 Billanga. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <Link href="#" className="hover:text-white transition-colors">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
