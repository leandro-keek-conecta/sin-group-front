import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from "@/context/AuthContext";
// Páginas
import NotFound from "../pages/NotFound";
import Home from "../pages/home/Home";
import Login from "@/pages/login/Login";
import Projects from '@/pages/projects';
import ProjectAcess from '@/pages/projectAcess';
import Metricas from '@/pages/metricas';
import Estatisticas from '@/pages/estatistica';
import ProjectRegister from '@/pages/projectRegister';
import UserRegister from '@/pages/userRegister';
import ChangePassword from '@/pages/changePassword';
import { ForgotPassword } from '@/pages/forgotPassword';
import IlhaLayout from '@/pages/ilha/layout/IlhaLayout';
import IlhaOverview from '@/pages/ilha/overview';
import IlhaAnalytics from '@/pages/ilha/analytics';
import IlhaInsights from '@/pages/ilha/insights';
import IlhaConversas from '@/pages/ilha/conversas';
import IlhaEventos from '@/pages/ilha/eventos';

const RoutesConfig = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/bayeux" element={<Login />} />
      <Route path="/guga-pet" element={<Login />} />
      <Route path="/conecta-cmjp" element={<Login />} />
      <Route path="/pad-pb" element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* User */}
      <Route path="/home" element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]}><Home /></ProtectedRoute>} />
      <Route path="/metricas" element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]}><Metricas /></ProtectedRoute>} />
      <Route path="/estatisticas" element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]}><Estatisticas /></ProtectedRoute>} />

      {/* Admin, superAdmin */}
      <Route path="/cadastro-usuario" element={<ProtectedRoute allowedRoles={["ADMIN"]}><UserRegister /></ProtectedRoute>} />
      <Route path="/projetos" element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]}><Projects /></ProtectedRoute>} />
      <Route path="/projeto" element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]}><ProjectAcess /></ProtectedRoute>} />
      <Route path="/cadastro-projeto" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ProjectRegister /></ProtectedRoute>} />

      {/* Ilha (gated por projeto id=9) */}
      <Route
        path="/ilha"
        element={
          <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
            <IlhaLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<IlhaOverview />} />
        <Route path="visao-geral" element={<IlhaOverview />} />
        <Route path="analises" element={<IlhaAnalytics />} />
        <Route path="insights" element={<IlhaInsights />} />
        <Route path="conversas" element={<IlhaConversas />} />
        <Route path="eventos" element={<IlhaEventos />} />
      </Route>

      {/* Rota para NotFound */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);

export default RoutesConfig;
