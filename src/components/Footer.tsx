import { Facebook, Instagram, Music, MapPin, Phone } from "lucide-react";
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
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1c] border border-[#2a2a2c] flex items-center justify-center text-white hover:bg-billanga-primary hover:border-billanga-primary transition-all hover:-translate-y-1">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1c] border border-[#2a2a2c] flex items-center justify-center text-white hover:bg-billanga-primary hover:border-billanga-primary transition-all hover:-translate-y-1">
                <Music className="w-5 h-5" />
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
