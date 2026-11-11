import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { onboardingVisto } from './lib/onboarding';
import { obtenerStorage } from './lib/profile';
import { BienvenidaPage } from './pages/BienvenidaPage';
import { FavoritosPage } from './pages/FavoritosPage';
import { MasPage } from './pages/MasPage';
import { PerfilPage } from './pages/PerfilPage';
import { PlazasPage } from './pages/PlazasPage';

function Inicio() {
  // Primer arranque: se muestra la bienvenida antes que nada.
  if (!onboardingVisto(obtenerStorage())) return <Navigate to="/bienvenida" replace />;
  return <PlazasPage />;
}

export default function App() {
  return (
    <Routes>
      {/* La bienvenida es una experiencia a pantalla completa, fuera del marco de la app */}
      <Route path="bienvenida" element={<BienvenidaPage />} />
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="favoritos" element={<FavoritosPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="mas" element={<MasPage />} />
        <Route path="historico" element={<Navigate to="/mas" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
