import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useConvocatoriaCtx, usePerfilCtx } from './app/contexts';
import { Layout } from './components/Layout';
import { onboardingVisto } from './lib/onboarding';
import { obtenerStorage } from './lib/profile';
import { BienvenidaPage } from './pages/BienvenidaPage';
import { InicioPage } from './pages/InicioPage';
import { PerfilPage } from './pages/PerfilPage';
import { FavoritosPage, HistoricoPage } from './pages/Pendientes';

function Inicio() {
  const { perfil, completo } = usePerfilCtx();
  const convocatoria = useConvocatoriaCtx();
  const navigate = useNavigate();
  // Primer arranque: se muestra la bienvenida antes que nada.
  if (!onboardingVisto(obtenerStorage())) return <Navigate to="/bienvenida" replace />;
  return <InicioPage perfil={perfil} completo={completo} onEditarPerfil={() => navigate('/perfil')} convocatoria={convocatoria} />;
}

function Perfil() {
  const { perfil, guardar, restablecer, almacenamientoDisponible } = usePerfilCtx();
  const navigate = useNavigate();
  return <PerfilPage perfil={perfil} onGuardar={guardar} onRestablecer={restablecer} almacenamientoDisponible={almacenamientoDisponible} onGuardado={() => navigate('/')} />;
}

export default function App() {
  return (
    <Routes>
      {/* La bienvenida es una experiencia a pantalla completa, fuera del marco de la app */}
      <Route path="bienvenida" element={<BienvenidaPage />} />
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="favoritos" element={<FavoritosPage />} />
        <Route path="historico" element={<HistoricoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
