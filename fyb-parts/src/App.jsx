import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import { supabase } from './supabaseClient';

// Componente para Redes Sociales con el ícono de Instagram corregido
const RedSocial = ({ nombre, handle, icon }) => (
  <a 
    href="#" 
    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group transform hover:-translate-y-2"
  >
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 bg-gray-50 group-hover:bg-[#5A8073] group-hover:text-white text-[#5A8073]">
      {icon}
    </div>
    <span className="font-black text-slate-900">{nombre}</span>
    <span className="text-xs font-semibold text-[#5A8073] mt-1">{handle}</span>
  </a>
);

// Componente para las Preguntas Frecuentes (Acordeón Interactivo)
const PreguntaFrecuente = ({ pregunta, respuesta }) => {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-3 overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setAbierta(!abierta)}
        className="w-full text-left p-4 md:p-5 flex justify-between items-center font-bold text-slate-900 hover:bg-gray-50 transition text-sm md:text-base"
      >
        {pregunta}
        <span className={`transform transition-transform ${abierta ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-[#5A8073]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
        </span>
      </button>
      <div className={`px-4 md:px-5 pb-5 text-sm text-slate-600 leading-relaxed ${abierta ? 'block' : 'hidden'}`}>
        {respuesta}
      </div>
    </div>
  );
};

export default function App() {
  const [vistaActual, setVistaActual] = useState('inicio');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos los Repuestos');
  const [busquedaTienda, setBusquedaTienda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Estados para el registro
  const [nombreRegistro, setNombreRegistro] = useState('');
  const [correoRegistro, setCorreoRegistro] = useState('');
  const [telefonoRegistro, setTelefonoRegistro] = useState('');
  const [ubicacionRegistro, setUbicacionRegistro] = useState('');
  const [passRegistro, setPassRegistro] = useState('');
  const [passConfirmar, setPassConfirmar] = useState('');
  const [errorRegistro, setErrorRegistro] = useState('');

  // Estados para el inicio de sesión
  const [correoLogin, setCorreoLogin] = useState('');
  const [passLogin, setPassLogin] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [usuarioActual, setUsuarioActual] = useState(null);

  // Estados para el Panel de Administración (Subir Productos)
  const [productos, setProductos] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Sistema de freno');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('');
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [nuevoVehiculo, setNuevoVehiculo] = useState('');
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoSerial, setNuevoSerial] = useState('');
  const [nuevoAnio, setNuevoAnio] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Estados para Soporte Técnico
  const [soporteEmail, setSoporteEmail] = useState('');
  const [soporteMensaje, setSoporteMensaje] = useState('');

  // Cargar productos desde Supabase al iniciar la app
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*');

    if (error) {
      console.error('Error al cargar productos de Supabase:', error);
      alert('Error al conectar con la base de datos de productos.');
    } else if (data) {
      console.log('Productos cargados desde Supabase:', data);
      setProductos(data); // Carga absolutamente todo lo que esté en tu tabla de Supabase
    }
  };

  const listaCategoriasSidebar = [
    "Todos los Repuestos",
    "Sistema de freno",
    "Bombas de gasolina",
    "Filtros de aires",
    "Faros y micas",
    "Bombas de agua",
    "Bombas de aceite",
    "Multiple admision",
    "Carroceria",
    "Otras categorias"
  ];

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2);
  };

  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaSeleccionada === 'Todos los Repuestos' || p.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase();

    const coincideBusqueda = busquedaTienda.trim() === '' || p.nombre.toLowerCase().includes(busquedaTienda.toLowerCase());
    
    return coincideCategoria && coincideBusqueda;
  });

  // Registro: Guarda los datos, la contraseña, valida errores y redirige inmediatamente al login
  const manejarRegistro = async (e) => {
    e.preventDefault();
    if (passRegistro !== passConfirmar) {
      setErrorRegistro('Las contraseñas no coinciden. Por favor, verifícalas.');
      return;
    }

    const { error } = await supabase
      .from('usuarios')
      .insert([
        { 
          nombres_apellidos: nombreRegistro, 
          correo: correoRegistro, 
          telefono: telefonoRegistro, 
          ubicacion: ubicacionRegistro,
          contrasena: passRegistro, // Guardamos la contraseña para el inicio de sesión
          rol: 'cliente'
        }
      ]);

    if (error) {
      setErrorRegistro('Error de Supabase: ' + error.message);
      console.error("Detalle del error:", error);
      return;
    }

    setErrorRegistro('');
    // Redirección inmediata a iniciar sesión
    setVistaActual('iniciar-sesion');
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');

    // .trim() elimina espacios accidentales al inicio o final del correo
    const correoLimpio = correoLogin.trim();

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correoLimpio)
      .eq('contrasena', passLogin)
      .single();

    if (error) {
      console.error("Detalle exacto del error de Supabase en Login:", error);
      setErrorLogin('Correo o contraseña incorrectos.');
      return;
    }

    if (!data) {
      setErrorLogin('No se encontró una cuenta con esos datos.');
      return;
    }

    setUsuarioActual(data);
    alert(`¡Bienvenido de nuevo, ${data.nombres_apellidos}!`);
    
    if (data.rol === 'admin') {
      setVistaActual('admin');
    } else {
      setVistaActual('inicio');
    }
  };

  // Subir producto nuevo desde el Panel de Administración
  const guardarProductoEnSupabase = async (urlImagen) => {
    const { error } = await supabase
      .from('productos')
      .insert([{
        nombre: nuevoNombre,
        categoria: nuevaCategoria,
        precio: parseFloat(nuevoPrecio),
        vehiculo: nuevoVehiculo,
        marca: nuevaMarca,
        serial: nuevoSerial,
        anio: nuevoAnio,
        descripcion: nuevaDescripcion, // <-- ¡NUEVA LÍNEA AQUÍ!
        imagen_url: urlImagen || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400'
      }]);

    if (error) {
      alert('Error al subir el producto a la base de datos: ' + error.message);
      console.error(error);
    } else {
      alert('¡Producto agregado exitosamente!');
      setNuevoNombre('');
      setNuevoPrecio('');
      setNuevoVehiculo('');
      setNuevaMarca('');
      setNuevoSerial('');
      setNuevoAnio('');
      setNuevaDescripcion(''); // <-- ¡NUEVA LÍNEA AQUÍ!
      setNuevaImagen('');
      setArchivoImagen(null);
      cargarProductos();
    }
  };

  const manejarCrearProducto = async (e) => {
    e.preventDefault();
    
    let imagenFinal = nuevaImagen; // Si usó URL

    if (archivoImagen) {
      const reader = new FileReader();
      reader.readAsDataURL(archivoImagen);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          imagenFinal = canvas.toDataURL('image/jpeg', 0.7);
          await guardarProductoEnSupabase(imagenFinal);
        };
      };
      return;
    }

    await guardarProductoEnSupabase(imagenFinal);
  };

  

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 w-full overflow-x-hidden">
      
      {/* Top Bar - Notificaciones */}
      <div className="bg-[#5A8073] text-white text-xs py-2 px-6 md:px-12 flex justify-between items-center w-full">
        <p className="flex items-center gap-2 font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> 
            DELIVERY GRATIS EN CARACAS <span className="font-normal text-[10px] ml-1 opacity-80">(CIERTAS CONDICIONES APLICAN)</span>
        </p>
        <div className="hidden md:flex gap-6 items-center">
           {usuarioActual && (
             <span className="font-bold">Usuario: {usuarioActual.nombres_apellidos} ({usuarioActual.rol})</span>
           )}
           <button 
             onClick={() => setVistaActual('soporte-tecnico')} 
             className="hover:text-gray-200 transition bg-transparent border-none cursor-pointer p-0 text-xs font-semibold text-white underline"
           >
             Soporte Técnico
           </button>
        </div>
      </div>

      {/* Cabecera Principal */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100 w-full">
        <div className="w-full px-4 md:px-12 py-3 md:py-4 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => { setVistaActual('inicio'); setMenuMovilAbierto(false); }}>
            <img src={logo} alt="Logo F&B Parts" className="h-10 md:h-14 w-auto object-contain hover:opacity-90 transition" />
          </div>

          {/* Navegación para Escritorio (Oculta en móviles) */}
          <div className="hidden lg:flex items-center gap-6 font-bold text-sm text-[#5A8073]">
            <button onClick={() => setVistaActual('inicio')} className={`hover:opacity-70 transition pb-1 ${vistaActual === 'inicio' ? 'border-b-2 border-[#5A8073]' : ''}`}>Inicio</button>
            <button onClick={() => { setVistaActual('tienda'); setCategoriaSeleccionada('Todos los Repuestos'); }} className={`hover:opacity-70 transition pb-1 ${vistaActual === 'tienda' ? 'border-b-2 border-[#5A8073]' : ''}`}>Tienda</button>
            <button onClick={() => setVistaActual('quienes-somos')} className={`hover:opacity-70 transition pb-1 ${vistaActual === 'quienes-somos' ? 'border-b-2 border-[#5A8073]' : ''}`}>Quienes somos</button>
            <button onClick={() => setVistaActual('contacto')} className={`hover:opacity-70 transition pb-1 ${vistaActual === 'contacto' ? 'border-b-2 border-[#5A8073]' : ''}`}>Contacto</button>
            
            {usuarioActual?.rol === 'admin' && (
              <button onClick={() => setVistaActual('admin')} className={`hover:opacity-70 transition pb-1 text-red-600 ${vistaActual === 'admin' ? 'border-b-2 border-red-600' : ''}`}>Panel Admin</button>
            )}

            {usuarioActual ? (
              <button 
                onClick={() => { setUsuarioActual(null); setVistaActual('inicio'); }}
                className="flex items-center gap-2 transition px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs"
              >
                Cerrar Sesión
              </button>
            ) : (
              <button 
                onClick={() => setVistaActual('iniciar-sesion')}
                className={`flex items-center gap-2 transition px-4 py-2 rounded-full border border-gray-200 hover:border-[#5A8073] ${vistaActual === 'iniciar-sesion' ? 'bg-[#5A8073] text-white border-[#5A8073]' : 'text-[#5A8073]'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Iniciar Sesión</span>
              </button>
            )}
            
            <a href="tel:04120161036" className="bg-[#5A8073] text-white px-5 py-2.5 rounded-full hover:opacity-90 transition shadow-md flex items-center gap-2 text-xs">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              LLAMA AHORA
            </a>
          </div>

          {/* Botón de Menú Hamburguesa para Móviles */}
          <div className="flex lg:hidden items-center gap-3">
            <button 
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="p-2 rounded-xl text-[#5A8073] hover:bg-gray-100 transition focus:outline-none"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuMovilAbierto ? (
                  <path strokeLinecap="round" strokeLinejoin="round6" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>

        {/* Desplegable del Menú Móvil */}
        {menuMovilAbierto && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col space-y-3 shadow-lg">
            {usuarioActual && (
              <div className="text-xs font-bold text-[#5A8073] pb-2 border-b border-gray-100">
                Usuario: {usuarioActual.nombres_apellidos}
              </div>
            )}
            <button onClick={() => { setVistaActual('inicio'); setMenuMovilAbierto(false); }} className="text-left font-bold text-sm text-slate-700 py-1.5 hover:text-[#5A8073]">Inicio</button>
            <button onClick={() => { setVistaActual('tienda'); setCategoriaSeleccionada('Todos los Repuestos'); setMenuMovilAbierto(false); }} className="text-left font-bold text-sm text-slate-700 py-1.5 hover:text-[#5A8073]">Tienda</button>
            <button onClick={() => { setVistaActual('quienes-somos'); setMenuMovilAbierto(false); }} className="text-left font-bold text-sm text-slate-700 py-1.5 hover:text-[#5A8073]">Quienes somos</button>
            <button onClick={() => { setVistaActual('contacto'); setMenuMovilAbierto(false); }} className="text-left font-bold text-sm text-slate-700 py-1.5 hover:text-[#5A8073]">Contacto</button>
            
            {usuarioActual?.rol === 'admin' && (
              <button onClick={() => { setVistaActual('admin'); setMenuMovilAbierto(false); }} className="text-left font-bold text-sm text-red-600 py-1.5">Panel Admin</button>
            )}

            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              {usuarioActual ? (
                <button 
                  onClick={() => { setUsuarioActual(null); setVistaActual('inicio'); setMenuMovilAbierto(false); }}
                  className="w-full py-2.5 rounded-full border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 text-center"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <button 
                  onClick={() => { setVistaActual('iniciar-sesion'); setMenuMovilAbierto(false); }}
                  className="w-full py-2.5 rounded-full border border-[#5A8073] text-[#5A8073] font-bold text-xs text-center"
                >
                  Iniciar Sesión
                </button>
              )}
              <a href="tel:04120161036" className="w-full bg-[#5A8073] text-white py-2.5 rounded-full font-bold text-xs text-center flex items-center justify-center gap-2">
                LLAMA AHORA
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 1. VISTA DE INICIO */}
      {vistaActual === 'inicio' && (
        <>
          <section className="relative bg-white overflow-hidden w-full">
            <div className="w-full px-6 md:px-12 py-10 md:py-14 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              
              <div className="relative z-10 flex flex-col items-start">
                <div 
                  className="inline-block font-bold px-4 py-1.5 rounded-full text-xs tracking-wide mb-4 uppercase"
                  style={{ backgroundColor: '#e2ece9', color: '#5A8073' }}
                >
                  Repuestos y Autopartes Originales
                </div>
                
                <h1 
                  className="text-4xl md:text-5xl font-black leading-tight mb-4 text-left"
                  style={{ color: '#000000' }}
                >
                  Encuentra la pieza exacta para tu <span style={{ color: '#5A8073' }}>vehículo.</span>
                </h1>
                
                <p className="text-lg text-slate-600 mb-6 max-w-xl leading-relaxed text-left">
                  Catálogo completo de motor, frenos y carrocería. Atención rápida, asesoría experta y despachos seguros a toda Venezuela.
                </p>
                
                <div className="w-full flex justify-start">
                  <button onClick={() => setVistaActual('tienda')} className="bg-[#5A8073] text-white px-8 py-3.5 rounded-full font-bold hover:opacity-90 transition shadow-lg flex items-center gap-2">
                    VER CATÁLOGO
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-6">
                 <div className="h-72 bg-slate-200 rounded-3xl overflow-hidden shadow-inner relative group">
                    <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Repuestos de Motor" />
                 </div>
                 <div className="h-72 bg-[#5A8073] rounded-3xl overflow-hidden shadow-xl p-8 flex flex-col justify-end text-white">
                    <svg className="w-12 h-12 mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="font-bold text-2xl leading-tight">ENVÍO RÁPIDO<br/>Y SEGURO</h3>
                    <p className="text-white/80 text-sm mt-2">Atención y despacho a toda Venezuela.</p>
                 </div>
              </div>

              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[30rem] h-[30rem] bg-[#5A8073] opacity-5 rounded-full blur-3xl"></div>
            </div>
          </section>

          <section className="bg-white border-t border-slate-100 w-full">
            <div className="w-full px-6 md:px-12 py-8 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#5A8073] shadow-sm border border-[#5A8073]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">100% Originales</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Garantía de fábrica</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#5A8073] shadow-sm border border-[#5A8073]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Pagos Seguros</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Múltiples métodos</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#5A8073] shadow-sm border border-[#5A8073]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Envíos Rápidos</h4>
                  <p className="text-xs text-slate-500 mt-0.5">A nivel nacional</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#5A8073] shadow-sm border border-[#5A8073]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Soporte Experto</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Asesoría mecánica</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-10 bg-white border-t border-slate-100 w-full">
            <div className="w-full px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center text-center">
              <div className="max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: '#000000' }}>
                  QUIÉNES SOMOS
                </h2>
                <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full mb-4"></div>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed text-center mx-auto">
                  Bienvenido a nuestra tienda de repuestos. En FB PARTS nos enorgullece ofrecer una amplia variedad de repuestos para todo tipo de vehículos. Ya sea que necesites repuestos para tu automóvil o camión, estamos aquí para ayudarte.
                </p>
              </div>
            </div>
          </section>

          <section className="py-10 bg-gray-50 border-t border-slate-100 w-full">
            <div className="w-full px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: '#000000' }}>
                  CATEGORÍAS DE REPUESTOS
                </h2>
                <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-center">
                {[
                  { title: "Sistema de freno", desc: "Pastillas, discos y componentes hidráulicos." },
                  { title: "Bombas de gasolina", desc: "Bombas eléctricas, módulos y filtros." },
                  { title: "Filtros de aires", desc: "Filtros de aire, cabina y alto rendimiento." },
                  { title: "Faros y micas", desc: "Ópticas delanteras, micas y luces." },
                  { title: "Bombas de agua", desc: "Bombas de refrigeración y motores." },
                  { title: "Bombas de aceite", desc: "Lubricación y repuestos internos." },
                  { title: "Multiple admision", desc: "Múltiples de admisión y juntas." },
                  { title: "Carroceria", desc: "Paneles, guardabarros y parachoques." },
                  { title: "Otras categorias", desc: "Accesorios, herramientas y más." }
                ].map((cat, index) => (
                  <div 
                    key={index} 
                    onClick={() => { setCategoriaSeleccionada(cat.title); setVistaActual('tienda'); }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col items-center text-center cursor-pointer group"
                  >
                    <div className="w-16 h-14 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner flex items-center justify-center mb-4 group-hover:bg-[#5A8073] group-hover:text-white transition">
                      <svg className="w-7 h-7 text-[#5A8073] group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base tracking-wide mb-1" style={{ color: '#5A8073' }}>
                      {cat.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 bg-white border-t border-slate-100 w-full">
            <div className="w-full px-6 md:px-12 max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: '#000000' }}>
                  CATÁLOGO MERCADO LIBRE
                </h2>
                <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full mb-3"></div>
                <p className="text-slate-500 text-sm">Explora todas nuestras publicaciones activas y repuestos disponibles.</p>
              </div>

              <div className="bg-gray-50 p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                <p className="text-slate-600 text-base mb-6 max-w-lg leading-relaxed">
                  Visita nuestra tienda oficial en Mercado Libre para realizar compras 100% protegidas y ver nuestro stock actualizado en tiempo real.
                </p>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#FFE600] text-slate-900 font-bold px-8 py-3.5 rounded-full shadow-md hover:bg-[#f2db00] transition-all transform hover:-translate-y-0.5 flex items-center gap-3 text-sm md:text-base"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM12 16.5l-4-4h3V8h2v4.5h3l-4 4z"/>
                  </svg>
                  IR A NUESTRA TIENDA DE MERCADO LIBRE
                </a>
              </div>
            </div>
          </section>

          <section className="py-5 bg-gray-50 border-t border-slate-100 w-full">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: '#000000' }}>
                  CONTACTO
                </h2>
                <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between items-center text-center">
                  <div className="w-full">
                    <h3 className="font-bold text-2xl mb-6 text-slate-900 border-b border-gray-100 pb-4 text-center">
                      Datos de contacto
                    </h3>

                    <div className="space-y-6 text-slate-700 flex flex-col items-center">
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#5A8073]/10 flex items-center justify-center text-[#5A8073] font-bold text-lg">
                          📍
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-base">Sede Principal</p>
                          <p className="text-sm text-slate-600 mt-0.5">Gran Caracas, Distrito Capital, Venezuela</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-50 w-full flex flex-col items-center">
                        <a href="tel:02125513003" className="flex items-center justify-center gap-3 text-sm font-semibold hover:text-[#5A8073] transition">
                          <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-base">📞</span>
                          <span>0212 - 551 - 3003</span>
                        </a>
                        <a href="tel:04120161036" className="flex items-center justify-center gap-3 text-sm font-semibold hover:text-[#5A8073] transition">
                          <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-base">📱</span>
                          <span>0412 - 016 - 1036</span>
                        </a>
                        <a href="tel:04242004842" className="flex items-center justify-center gap-3 text-sm font-semibold hover:text-[#5A8073] transition">
                          <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-base">📱</span>
                          <span>0424 - 200 - 4842</span>
                        </a>
                      </div>

                      <div className="pt-4 border-t border-gray-100 w-full text-center">
                        <p className="font-bold text-slate-900 text-sm mb-1.5 flex items-center justify-center gap-2">
                          <span>⏰</span> Horarios de Atención
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">Lunes - Viernes: 9:00 am – 4:00 pm</p>
                        <p className="text-xs text-slate-600 leading-relaxed">Sábados: 9:00 am – 1:00 pm</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 mt-6 w-full text-center">
                    <a href="mailto:fybinversiones.ccs@gmail.com" className="inline-flex items-center justify-center gap-2 font-bold text-[#5A8073] hover:underline text-sm">
                      <span>✉️</span> fybinversiones.ccs@gmail.com
                    </a>
                  </div>
                </div>

                <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-80 md:h-auto min-h-[350px]">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125574.87784015694!2d-66.96962259160155!3d10.4939763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a58ad2223c213%3A0x63391d13f1754045!2sCaracas%2C%20Distrito%20Capital!5e0!3m2!1ses!2sve!4v1717777777777!5m2!1ses!2sve" 
                    width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy">
                  </iframe>
                </div>
              </div>
            </div>
          </section>

          <section className="py-10 bg-white border-t border-slate-100 w-full">
            <div className="w-full px-6 md:px-12 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: '#000000' }}>
                  PREGUNTAS FRECUENTES
                </h2>
                <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full mb-2"></div>
                <p className="text-slate-500 text-sm">Todo lo que necesitas saber sobre nuestras compras y envíos.</p>
              </div>

              <PreguntaFrecuente pregunta="¿Ofrecen delivery de repuestos en Caracas?" respuesta="Sí, contamos con servicio de delivery rápido en la Gran Caracas. (Ciertas condiciones aplican según la zona)." />
              <PreguntaFrecuente pregunta="¿Hacen envíos a toda Venezuela?" respuesta="Sí, realizamos envíos nacionales seguros a través de empresas de encomienda confiables como Tealca, MRW y Zoom." />
              <PreguntaFrecuente pregunta="¿Qué métodos de pago aceptan?" respuesta="Aceptamos múltiples métodos de pago: Pago Móvil, efectivo en divisas, transferencias bancarias (Banesco, BNC, BVC, Bancamiga) y Binance." />
              <PreguntaFrecuente pregunta="¿Los repuestos y autopartes son originales?" respuesta="Sí, somos especialistas en la comercialización y optimización de repuestos y autopartes originales y de alta calidad para marcas como Toyota, Ford, Dongfeng, Mazda y Honda." />
            </div>
          </section>

          <section className="py-10 bg-gray-50 w-full border-t border-slate-100">
            <div className="w-full px-6 md:px-12 max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-black mb-2 uppercase" style={{ color: '#000000' }}>
                  LAS RESEÑAS DE NUESTROS CLIENTES
                </h2>
                <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 justify-center">
                {[
                  { name: "Lux Motors", text: "Servicio muy rápido, excelentes precios, atención profesional y amplia gama de repuestos originales." },
                  { name: "Maria Romero", text: "Excelente atención, buenos precios, personal calificado para dar la mejor asesoría y muy puntuales con las entregas." },
                  { name: "Luisa Ruiz", text: "Buena atención, personas responsables y puntuales. Me vendieron exactamente el repuesto que solicité." }
                ].map((review, index) => (
                  <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5">
                    <div className="flex gap-1 text-[#FBBF24] mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-600 mb-6 italic text-sm leading-relaxed">"{review.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#5A8073] flex items-center justify-center text-white font-bold text-xs uppercase">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                        <span className="text-[10px] text-[#5A8073] font-semibold">CLIENTE VERIFICADO</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-white border-t border-slate-100 w-full">
            <div className="max-w-6xl mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-2 uppercase" style={{ color: '#000000' }}>
                NUESTRAS REDES SOCIALES
              </h2>
              <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full mb-12"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <RedSocial 
                  nombre="Instagram" 
                  handle="@fbparts.ccs" 
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>} 
                />
                <RedSocial 
                  nombre="Facebook" 
                  handle="F&B Parts C.A." 
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.37 14.5 5 15.5 5H18V0h-3.808C10.59 0 9 1.581 9 4.75V8z"/></svg>} 
                />
                <RedSocial 
                  nombre="WhatsApp" 
                  handle="+58 412-0161036" 
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>} 
                />
              </div>
            </div>
          </section>
        </>
      )}

      {/* 2. VISTA DEDICADA: QUIENES SOMOS */}
      {vistaActual === 'quienes-somos' && (
        <div className="py-12 bg-white w-full min-h-screen">
          <div className="w-full px-6 md:px-12 max-w-5xl mx-auto flex flex-col items-center text-center">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#000000' }}>
                QUIÉNES SOMOS
              </h2>
              <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full mb-6"></div>
              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Bienvenido a nuestra tienda de repuestos. En FB PARTS nos enorgullece ofrecer una amplia variedad de repuestos para todo tipo de vehículos. Ya sea que necesites repuestos para tu automóvil o camión, estamos aquí para ayudarte.
              </p>
            </div>

            <div className="w-full mb-16">
              <div className="mb-10 text-center">
                <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#000000' }}>
                  NUESTROS PRODUCTOS
                </h2>
                <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-lg mb-2" style={{ color: '#000000' }}>Repuestos de motor:</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Tenemos una gran selección de repuestos de calidad para motores. Desde filtros de aire y aceite hasta bujías y correas, contamos con todo lo que necesitas para mantener tu motor funcionando sin problemas.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-lg mb-2" style={{ color: '#000000' }}>Repuestos de carrocería:</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Si necesitas reparar daños en la carrocería de tu vehículo, tenemos paneles, guardabarros, parachoques y más. Nuestros repuestos de carrocería están diseñados para adaptarse perfectamente a diferentes modelos y marcas de automóviles.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-lg mb-2" style={{ color: '#000000' }}>Repuestos de suspensión:</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Si sientes que tu vehículo no está ofreciendo una experiencia de conducción suave, es posible que necesites repuestos de suspensión. Ofrecemos una amplia gama de amortiguadores, resortes y otras piezas de suspensión para mejorar la comodidad y el rendimiento de tu vehículo.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-lg mb-2" style={{ color: '#000000' }}>Repuestos de frenos:</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">La seguridad es nuestra máxima prioridad. Por eso ofrecemos una variedad de repuestos de frenos de alta calidad, como pastillas, discos y líquidos de frenos. Mantén tus frenos en perfecto estado con nuestros repuestos confiables.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm md:col-span-2 md:max-w-xl md:mx-auto w-full">
                  <h4 className="font-bold text-lg mb-2 text-center" style={{ color: '#000000' }}>Accesorios y herramientas:</h4>
                  <p className="text-sm text-slate-600 leading-relaxed text-center">Además de repuestos, también ofrecemos una variedad de accesorios y herramientas para tu vehículo. Desde aceites y lubricantes hasta herramientas de mano, tenemos todo lo que necesitas para el mantenimiento de tu vehículo.</p>
                </div>
              </div>
            </div>

            <div className="w-full pt-8 border-t border-slate-100">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-black mb-3 uppercase" style={{ color: '#000000' }}>
                  LAS RESEÑAS DE NUESTROS CLIENTES
                </h2>
                <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 justify-center">
                {[
                  { name: "Lux Motors", text: "Servicio muy rápido, excelentes precios, atención profesional y amplia gama de repuestos originales." },
                  { name: "Maria Romero", text: "Excelente atención, buenos precios, personal calificado para dar la mejor asesoría y muy puntuales con las entregas." },
                  { name: "Luisa Ruiz", text: "Buena atención, personas responsables y puntuales. Me vendieron exactamente el repuesto que solicité." }
                ].map((review, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left">
                    <div className="flex gap-1 text-[#FBBF24] mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-600 mb-6 italic text-sm leading-relaxed">"{review.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#5A8073] flex items-center justify-center text-white font-bold text-xs uppercase">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                        <span className="text-[10px] text-[#5A8073] font-semibold">CLIENTE VERIFICADO</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. VISTA DEDICADA: CONTACTO */}
      {vistaActual === 'contacto' && (
        <div className="py-12 bg-white w-full min-h-screen">
          <div className="w-full px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center">
            <div className="text-center mb-12 w-full">
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#000000' }}>
                CONTACTO
              </h2>
              <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-stretch w-full mb-16">
              <div className="bg-gray-50 p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between items-center text-center">
                <div className="w-full">
                  <h3 className="font-bold text-2xl mb-6 text-slate-900 border-b border-gray-100 pb-4 text-center">
                    Datos de contacto
                  </h3>

                  <div className="space-y-6 text-slate-700 flex flex-col items-center">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-[#5A8073]/10 flex items-center justify-center text-[#5A8073] font-bold text-lg">
                        📍
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">Sede Principal</p>
                        <p className="text-sm text-slate-600 mt-0.5">Gran Caracas, Distrito Capital, Venezuela</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-50 w-full flex flex-col items-center">
                      <a href="tel:02125513003" className="flex items-center justify-center gap-3 text-sm font-semibold hover:text-[#5A8073] transition">
                        <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-base">📞</span>
                        <span>0212 - 551 - 3003</span>
                      </a>
                      <a href="tel:04120161036" className="flex items-center justify-center gap-3 text-sm font-semibold hover:text-[#5A8073] transition">
                        <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-base">📱</span>
                        <span>0412 - 016 - 1036</span>
                      </a>
                      <a href="tel:04242004842" className="flex items-center justify-center gap-3 text-sm font-semibold hover:text-[#5A8073] transition">
                        <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-base">📱</span>
                        <span>0424 - 200 - 4842</span>
                      </a>
                    </div>

                    <div className="pt-4 border-t border-gray-100 w-full text-center">
                      <p className="font-bold text-slate-900 text-sm mb-1.5 flex items-center justify-center gap-2">
                        <span>⏰</span> Horarios de Atención
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">Lunes - Viernes: 9:00 am – 4:00 pm</p>
                      <p className="text-xs text-slate-600 leading-relaxed">Sábados: 9:00 am – 1:00 pm</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-6 w-full text-center">
                  <a href="mailto:fybinversiones.ccs@gmail.com" className="inline-flex items-center justify-center gap-2 font-bold text-[#5A8073] hover:underline text-sm">
                    <span>✉️</span> fybinversiones.ccs@gmail.com
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-80 md:h-auto min-h-[350px]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125574.87784015694!2d-66.96962259160155!3d10.4939763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a58ad2223c213%3A0x63391d13f1754045!2sCaracas%2C%20Distrito%20Capital!5e0!3m2!1ses!2sve!4v1717777777777!5m2!1ses!2sve" 
                  width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy">
                </iframe>
              </div>
            </div>

            <div className="w-full max-w-4xl mx-auto mb-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: '#000000' }}>
                  PREGUNTAS FRECUENTES
                </h2>
                <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full mb-2"></div>
                <p className="text-slate-500 text-sm">Todo lo que necesitas saber sobre nuestras compras y envíos.</p>
              </div>

              <PreguntaFrecuente pregunta="¿Ofrecen delivery de repuestos en Caracas?" respuesta="Sí, contamos con servicio de delivery rápido en la Gran Caracas. (Ciertas condiciones aplican según la zona)." />
              <PreguntaFrecuente pregunta="¿Hacen envíos a toda Venezuela?" respuesta="Sí, realizamos envíos nacionales seguros a través de empresas de encomienda confiables como Tealca, MRW y Zoom." />
              <PreguntaFrecuente pregunta="¿Qué métodos de pago aceptan?" respuesta="Aceptamos múltiples métodos de pago: Pago Móvil, efectivo en divisas, transferencias bancarias (Banesco, BNC, BVC, Bancamiga) y Binance." />
              <PreguntaFrecuente pregunta="¿Los repuestos y autopartes son originales?" respuesta="Sí, somos especialistas en la comercialización y optimización de repuestos y autopartes originales y de alta calidad para marcas como Toyota, Ford, Dongfeng, Mazda y Honda." />
            </div>

            <div className="w-full pt-8 border-t border-slate-100">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-black mb-3 uppercase" style={{ color: '#000000' }}>
                  LAS RESEÑAS DE NUESTROS CLIENTES
                </h2>
                <div className="w-20 h-1 bg-[#5A8073] mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 justify-center w-full">
                {[
                  { name: "Lux Motors", text: "Servicio muy rápido, excelentes precios, atención profesional y amplia gama de repuestos originales." },
                  { name: "Maria Romero", text: "Excelente atención, buenos precios, personal calificado para dar la mejor asesoría y muy puntuales con las entregas." },
                  { name: "Luisa Ruiz", text: "Buena atención, personas responsables y puntuales. Me vendieron exactamente el repuesto que solicité." }
                ].map((review, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left">
                    <div className="flex gap-1 text-[#FBBF24] mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-600 mb-6 italic text-sm leading-relaxed">"{review.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#5A8073] flex items-center justify-center text-white font-bold text-xs uppercase">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                        <span className="text-[10px] text-[#5A8073] font-semibold">CLIENTE VERIFICADO</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. VISTA DEDICADA: INICIAR SESIÓN */}
      {vistaActual === 'iniciar-sesion' && (
        <div className="py-16 bg-gray-50 w-full min-h-[80vh] flex items-center justify-center px-6">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#5A8073]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#5A8073]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-black mb-2 text-slate-900" style={{ color: '#000000' }}>
              Iniciar Sesión
            </h2>
            <p className="text-slate-500 text-sm mb-8">Accede a tu cuenta de F&B Parts para gestionar tus pedidos.</p>

            {errorLogin && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
                {errorLogin}
              </div>
            )}

            <form onSubmit={manejarLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Correo electrónico</label>
                <input 
                  type="email" 
                  required 
                  value={correoLogin}
                  onChange={(e) => setCorreoLogin(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Contraseña</label>
                <input 
                  type="password" 
                  required 
                  value={passLogin}
                  onChange={(e) => setPassLogin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#5A8073] text-white py-3.5 rounded-full font-bold hover:opacity-90 transition shadow-lg text-sm mt-2"
              >
                INGRESAR A LA CUENTA
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-slate-500">
              ¿No tienes una cuenta?{' '}
              <button 
                onClick={() => setVistaActual('registro')} 
                className="text-[#5A8073] font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Regístrate aquí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VISTA DEDICADA: REGISTRARSE CONECTADA A SUPABASE */}
      {vistaActual === 'registro' && (
        <div className="py-16 bg-gray-50 w-full min-h-[80vh] flex items-center justify-center px-6">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#5A8073]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#5A8073]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-black mb-2 text-slate-900" style={{ color: '#000000' }}>
              Crear una Cuenta
            </h2>
            <p className="text-slate-500 text-sm mb-6">Regístrate en F&B Parts para disfrutar de todos nuestros beneficios.</p>

            {errorRegistro && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
                {errorRegistro}
              </div>
            )}

            <form onSubmit={manejarRegistro} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nombres y Apellidos</label>
                <input 
                  type="text" 
                  required 
                  value={nombreRegistro}
                  onChange={(e) => setNombreRegistro(e.target.value)}
                  placeholder="Ej. Asdrúbal Polidor"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Correo electrónico</label>
                <input 
                  type="email" 
                  required 
                  value={correoRegistro}
                  onChange={(e) => setCorreoRegistro(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Número telefónico</label>
                <input 
                  type="tel" 
                  required 
                  value={telefonoRegistro}
                  onChange={(e) => setTelefonoRegistro(e.target.value)}
                  placeholder="Ej. 0412-0000000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Ubicación</label>
                <input 
                  type="text" 
                  required 
                  value={ubicacionRegistro}
                  onChange={(e) => setUbicacionRegistro(e.target.value)}
                  placeholder="Ej. Caracas, Distrito Capital"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Contraseña</label>
                <input 
                  type="password" 
                  required 
                  value={passRegistro}
                  onChange={(e) => setPassRegistro(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  required 
                  value={passConfirmar}
                  onChange={(e) => setPassConfirmar(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#5A8073] text-white py-3.5 rounded-full font-bold hover:opacity-90 transition shadow-lg text-sm mt-4"
              >
                REGISTRARME
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-slate-500">
              ¿Ya tienes una cuenta?{' '}
              <button 
                onClick={() => setVistaActual('iniciar-sesion')} 
                className="text-[#5A8073] font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Inicia sesión aquí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. VISTA DEDICADA: PANEL DE ADMINISTRADOR (SUBIR REPUESTOS) */}
      {vistaActual === 'admin' && usuarioActual?.rol === 'admin' && (
        <div className="py-16 bg-gray-50 w-full min-h-[80vh] flex items-center justify-center px-6">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-xl w-full">
            <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: '#000000' }}>
              Panel de Administración
            </h2>
            <p className="text-slate-600 text-sm mb-6 font-medium">
              Sube nuevos repuestos con sus especificaciones de vehículo y serial a Supabase.
            </p>

            <form onSubmit={manejarCrearProducto} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nombre del Repuesto</label>
                <input 
                  type="text" 
                  required 
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Bomba de Freno Original"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Categoría</label>
                  <select 
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none text-sm text-slate-900 bg-white"
                  >
                    {listaCategoriasSidebar.filter(c => c !== 'Todos los Repuestos').map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Precio ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required 
                    value={nuevoPrecio}
                    onChange={(e) => setNuevoPrecio(e.target.value)}
                    placeholder="Ej. 45.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* NUEVOS CAMPOS: VEHÍCULO, MARCA, SERIAL Y AÑO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Vehículo Compatible</label>
                  <input 
                    type="text" 
                    value={nuevoVehiculo}
                    onChange={(e) => setNuevoVehiculo(e.target.value)}
                    placeholder="Ej. Toyota Corolla / Aveo"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Marca del Repuesto</label>
                  <input 
                    type="text" 
                    value={nuevaMarca}
                    onChange={(e) => setNuevaMarca(e.target.value)}
                    placeholder="Ej. Bosch / Chevrolet"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Serial / Código de Parte</label>
                  <input 
                    type="text" 
                    value={nuevoSerial}
                    onChange={(e) => setNuevoSerial(e.target.value)}
                    placeholder="Ej. FB-98234"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Años Compatibles</label>
                  <input 
                    type="text" 
                    value={nuevoAnio}
                    onChange={(e) => setNuevoAnio(e.target.value)}
                    placeholder="Ej. 2012 - 2018"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none text-sm text-slate-900"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1 sm:col-span-2 mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Descripción (Opcional)</label>
                <textarea
                  name="descripcion"
                  value={nuevaDescripcion} 
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  placeholder="Ej: Camisa oficial del equipo Fórmula SAE UCV, diseño en azul marino con detalles en negro, 100% algodón..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none text-sm text-slate-900 focus:ring-2 focus:ring-[#5A8073] min-h-[100px] resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">URL de la Imagen (Opcional)</label>
                <input 
                  type="url" 
                  value={nuevaImagen}
                  disabled={archivoImagen !== null}
                  onChange={(e) => setNuevaImagen(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none text-sm text-slate-900 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">O Subir Imagen desde el Dispositivo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  disabled={nuevaImagen !== ''}
                  onChange={(e) => setArchivoImagen(e.target.files[0])}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-2 px-3 outline-none text-sm text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#5A8073]/10 file:text-[#5A8073] hover:file:bg-[#5A8073]/20 disabled:opacity-50"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#5A8073] text-white py-3.5 rounded-full font-bold hover:opacity-90 transition shadow-lg text-sm mt-4"
              >
                PUBLICAR REPUESTO EN LA TIENDA
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. VISTA DEDICADA: SOPORTE TÉCNICO */}
      {vistaActual === 'soporte-tecnico' && (
        <div className="py-16 bg-gray-50 w-full min-h-[80vh] flex items-center justify-center px-6">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full text-center">
            <div className="w-16 h-16 bg-[#5A8073]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#5A8073]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-black mb-2 text-slate-900" style={{ color: '#000000' }}>
              Soporte Técnico
            </h2>
            <p className="text-slate-500 text-sm mb-6">Describe el error o problema que experimentas y envíanos un reporte directo a nuestro equipo.</p>

            <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tu Correo Electrónico</label>
                <input 
                  type="email" 
                  required 
                  value={soporteEmail}
                  onChange={(e) => setSoporteEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Descripción del Error</label>
                <textarea 
                  required 
                  rows={4}
                  value={soporteMensaje}
                  onChange={(e) => setSoporteMensaje(e.target.value)}
                  placeholder="Explica detalladamente qué error necesitas que sea solucionado..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900 resize-none"
                />
              </div>

              <a 
                href={`mailto:fybinversiones.ccs@gmail.com?subject=Reporte%20de%20Error%20Soporte%20Tecnico&body=Correo%20del%20usuario:%20${encodeURIComponent(soporteEmail)}%0D%0A%0D%0ADescripcion%20del%20error:%0D%0A${encodeURIComponent(soporteMensaje)}`}
                className="w-full bg-[#5A8073] text-white py-3.5 rounded-full font-bold hover:opacity-90 transition shadow-lg text-sm mt-4 block text-center"
              >
                ENVIAR REPORTE POR GMAIL
              </a>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-slate-500">
              ¿Prefieres volver?{' '}
              <button 
                onClick={() => setVistaActual('inicio')} 
                className="text-[#5A8073] font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. VISTA DE LA TIENDA E INTERFAZ DE PRODUCTOS Y CARRITO */}
      {vistaActual === 'tienda' && (
        <>
        {/* VISTA DETALLE DE PRODUCTO A PANTALLA COMPLETA */}
              {productoSeleccionado ? (
                <div className="py-12 bg-gray-50 w-full min-h-[85vh] px-6 overflow-y-auto">
                  <div className="max-w-5xl mx-auto">
                    <button 
                      onClick={() => setProductoSeleccionado(null)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 mb-6 flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 w-max transition"
                    >
                      <span>← Volver al catálogo</span>
                    </button>

                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                      {/* Imagen del Producto */}
                      <div className="flex items-center justify-center bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <img 
                          src={productoSeleccionado.imagen_url} 
                          alt={productoSeleccionado.nombre} 
                          className="max-h-[450px] object-contain rounded-xl"
                        />
                      </div>

                      {/* Detalles del Producto */}
                      <div className="flex flex-col justify-start text-left">
                        <span className="text-[10px] font-extrabold text-[#5A8073] uppercase tracking-wider bg-[#5A8073]/10 px-3 py-1 rounded-full w-max mb-3">
                          {productoSeleccionado.categoria}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 capitalize" style={{ color: '#0f172a' }}>
                          {productoSeleccionado.nombre}
                        </h1>
                        <div className="text-3xl font-black text-[#5A8073] mb-6">
                          ${productoSeleccionado.precio}
                        </div>

                        {/* Descripción del Producto (Siempre visible) */}
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-slate-700 uppercase mb-2">Descripción</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {productoSeleccionado.descripcion ? productoSeleccionado.descripcion : 'No hay descripción detallada disponible para este artículo en este momento.'}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2.5 border border-gray-100 mb-8">
                          <div className="flex justify-between border-b border-gray-200/60 pb-2">
                            <span className="font-bold text-slate-500 uppercase">Vehículo:</span>
                            <span className="font-semibold text-slate-800">{productoSeleccionado.vehiculo || 'Genérico'}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-200/60 pb-2">
                            <span className="font-bold text-slate-500 uppercase">Marca:</span>
                            <span className="font-semibold text-slate-800">{productoSeleccionado.marca || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-200/60 pb-2">
                            <span className="font-bold text-slate-500 uppercase">Serial:</span>
                            <span className="font-semibold text-slate-800 font-mono">{productoSeleccionado.serial || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500 uppercase">Años:</span>
                            <span className="font-semibold text-slate-800">{productoSeleccionado.anio || 'Todos'}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => { agregarAlPedido(productoSeleccionado); setProductoSeleccionado(null); }}
                          className="w-full bg-[#5A8073] text-white py-4 rounded-full font-bold text-xs hover:opacity-90 transition shadow-lg tracking-wider uppercase mt-auto"
                        >
                          AÑADIR AL PEDIDO
                        </button>
                      </div>
                    </div>

                    {/* SECCIÓN "TAMBIÉN TE PUEDE INTERESAR" */}
                    <div className="mt-12">
                      <h3 className="text-xl font-black text-slate-900 uppercase mb-6 border-b-2 border-[#5A8073] pb-2 inline-block">
                        También te puede interesar
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {productos
                          .filter(p => p.categoria === productoSeleccionado.categoria && p.id !== productoSeleccionado.id)
                          .slice(0, 4) // Mostrar máximo 4 productos relacionados
                          .map((relacionado) => (
                            <div 
                              key={relacionado.id}
                              onClick={() => {
                                // Al hacer clic, hace un scroll suave hacia arriba y cambia el producto
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                setProductoSeleccionado(relacionado);
                              }}
                              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center cursor-pointer hover:shadow-md hover:border-[#5A8073]/30 transition group h-full"
                            >
                              <img 
                                src={relacionado.imagen_url} 
                                alt={relacionado.nombre} 
                                className="w-full h-32 object-cover rounded-xl mb-3 group-hover:scale-[1.02] transition duration-300"
                              />
                              <h4 className="font-bold text-slate-900 text-xs text-center group-hover:text-[#5A8073] transition line-clamp-2 mb-2 leading-tight capitalize h-8">
                                {relacionado.nombre}
                              </h4>
                              <div className="w-full flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                                <span className="font-black text-sm text-[#5A8073]">${relacionado.precio}</span>
                                <button className="text-[9px] font-bold text-white bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-700 transition">
                                  Ver Detalles
                                </button>
                              </div>
                            </div>
                          ))
                        }
                        
                        {/* Mensaje por si no hay relacionados */}
                        {productos.filter(p => p.categoria === productoSeleccionado.categoria && p.id !== productoSeleccionado.id).length === 0 && (
                          <div className="col-span-full text-center text-slate-500 py-8 text-sm">
                            No hay otros artículos en esta categoría por el momento.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
            <section className="py-8 bg-gray-50 w-full min-h-screen">
              <div className="w-full px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#5A8073]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                      CATEGORÍAS
                    </h3>
                    <div className="flex flex-col space-y-2">
                      {listaCategoriasSidebar.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCategoriaSeleccionada(cat)}
                          className={`text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition ${categoriaSeleccionada === cat ? 'bg-[#5A8073] text-white shadow-md' : 'text-slate-600 hover:bg-gray-100'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
                      <h2 className="text-xl font-black text-slate-900 uppercase">Catálogo: {categoriaSeleccionada}</h2>
                      <div className="relative w-full md:w-72">
                        <input 
                          type="text" 
                          placeholder="Buscar repuesto..." 
                          value={busquedaTienda}
                          onChange={(e) => setBusquedaTienda(e.target.value)}
                          className="w-full bg-gray-100 border-none rounded-full py-2 px-4 pl-10 focus:ring-2 focus:ring-[#5A8073] outline-none text-sm text-slate-900"
                        />
                        <svg className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {productosFiltrados.length === 0 ? (
                      <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <p className="text-slate-500 font-semibold text-lg">No se encontraron repuestos en esta categoría.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                        {productosFiltrados.map((producto, idx) => (
                          <div 
                            key={producto.id || idx}
                            onClick={() => setProductoSeleccionado(producto)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center cursor-pointer hover:shadow-md hover:border-[#5A8073]/30 transition group h-full"
                          >
                          {/* Imagen compacta */}
                          <img 
                            src={producto.imagen_url} 
                            alt={producto.nombre} 
                            className="w-full h-32 object-cover rounded-xl mb-3 group-hover:scale-[1.02] transition duration-300"
                          />
                          
                          <span className="text-[9px] font-extrabold text-[#5A8073] uppercase tracking-wider bg-[#5A8073]/10 px-2.5 py-0.5 rounded-full mb-2">
                            {producto.categoria}
                          </span>
                          
                          <h3 className="font-black text-slate-900 text-sm text-center group-hover:text-[#5A8073] transition line-clamp-2 mb-3 leading-tight capitalize">
                            {producto.nombre}
                          </h3>
                          
                          {/* Caja de detalles minimalista (Sin el serial) */}
                          <div className="w-full bg-gray-50/80 rounded-xl p-2.5 text-[10px] space-y-1.5 text-left border border-gray-100 mb-4 mt-auto">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px]">Vehículo:</span>
                              <span className="font-semibold text-slate-700 text-right truncate max-w-[65%]">{producto.vehiculo || 'Genérico'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px]">Marca:</span>
                              <span className="font-semibold text-slate-700 text-right truncate max-w-[65%]">{producto.marca || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px]">Año:</span>
                              <span className="font-semibold text-slate-700 text-right truncate max-w-[65%]">{producto.anio || 'Todos'}</span>
                            </div>
                          </div>

                          {/* Precio y Botón en la parte inferior */}
                          <div className="w-full flex items-center justify-between px-1" onClick={(e) => e.stopPropagation()}>
                            <span className="font-black text-lg text-slate-900">${producto.precio}</span>
                            <button 
                              onClick={() => agregarAlPedido(producto)}
                              className="bg-[#5A8073] text-white px-4 py-1.5 rounded-full font-bold text-[10px] hover:opacity-90 hover:shadow-md transition"
                            >
                              AGREGAR
                            </button>
                          </div>
                        </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#5A8073]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                      TU PEDIDO
                    </h3>

                    {carrito.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 font-medium border-b border-gray-100 pb-10">
                        Vacío
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-4 max-h-60 overflow-y-auto mb-4 pr-1">
                        {carrito.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                            <div>
                              <p className="font-bold text-slate-800">{item.nombre}</p>
                              <span className="text-xs text-slate-500">Cant: {item.cantidad} x ${Number(item.precio).toFixed(2)}</span>
                            </div>
                            <button onClick={() => eliminarDelCarrito(item.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center mb-6">
                      <span className="font-bold text-slate-700">Total:</span>
                      <span className="text-2xl font-black text-slate-900">${calcularTotal()}</span>
                    </div>

                    <button 
                      disabled={carrito.length === 0}
                      className={`w-full py-3.5 rounded-full font-bold text-white transition shadow-md flex items-center justify-center gap-2 ${carrito.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#22c55e] hover:opacity-90'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      PROCESAR PEDIDO
                    </button>
                  </div>

                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}