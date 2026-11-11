import { useState } from 'react';
import { Layout, type Vista } from './components/Layout';
import { useConvocatoria } from './hooks/useConvocatoria';
import { usePerfil } from './hooks/usePerfil';
import { FavoritosPage, HistoricoPage } from './pages/Pendientes';
import { InicioPage } from './pages/InicioPage';
import { PerfilPage } from './pages/PerfilPage';

export default function App() {
  const [vista, setVista] = useState<Vista>('inicio');
  const convocatoria = useConvocatoria();
  const { perfil, guardar, restablecer, completo, almacenamientoDisponible } = usePerfil();

  return (
    <Layout vista={vista} onNavegar={setVista}>
      {vista === 'inicio' && <InicioPage perfil={perfil} completo={completo} onEditarPerfil={() => setVista('perfil')} convocatoria={convocatoria} />}
      {vista === 'perfil' && (
        <PerfilPage
          perfil={perfil}
          onGuardar={guardar}
          onRestablecer={restablecer}
          almacenamientoDisponible={almacenamientoDisponible}
          onGuardado={() => setVista('inicio')}
        />
      )}
      {vista === 'favoritos' && <FavoritosPage />}
      {vista === 'historico' && <HistoricoPage />}
    </Layout>
  );
}
