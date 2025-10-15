# Controle de Acesso por Role (RBAC) no Frontend

Este documento descreve como implementar e utilizar proteção baseada em papéis de usuário (roles) no projeto frontend, utilizando React, TypeScript e React Router.

---

## Objetivo

Permitir ou negar acesso a rotas e componentes com base no papel (`role`) do usuário autenticado.

---

## Estrutura de Roles

Os papéis disponíveis são:

- `USER`
- `ADMIN`

---

## Contexto de Autenticação (`AuthContext`)

O contexto é responsável por fornecer o `user`, função `setUser`, e o estado `isAuthenticated`.

### Exemplo de estrutura:

```ts
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}
````

---

## Proteção de Rotas

Usamos o componente `ProtectedRoute` para envolver rotas que exigem roles específicas.

### Exemplo de uso:

```tsx
<Route path="/home" element={
  <ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPERADMIN"]}>
    <Home />
  </ProtectedRoute>
} />

<Route path="/superAdmin" element={
  <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
    <SuperAdmin />
  </ProtectedRoute>
} />
```

### Implementação do `ProtectedRoute`:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## Proteção de Componentes

Também é possível proteger partes da interface (como botões ou seções) com base no role:

```tsx
import { useAuth } from "@/context/AuthContext";

const AdminOnlyButton: React.FC = () => {
  const { user } = useAuth();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return null;
  }

  return (
    <button onClick={handleClick}>
      Ação administrativa
    </button>
  );
};
```

---

## Enum de Roles (opcional, recomendado)

Crie um enum para manter consistência:

```ts
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN"
}
```

---

## Página de Acesso Negado

Crie uma página para redirecionar usuários sem permissão:

```tsx
const Unauthorized: React.FC = () => (
  <div>
    <h1>403 - Acesso não autorizado</h1>
    <p>Você não tem permissão para acessar esta página.</p>
  </div>
);
```

E adicione a rota:

```tsx
<Route path="/unauthorized" element={<Unauthorized />} />
```


## Observações

* Sempre valide roles também no backend para segurança real.
* Frontend apenas controla o acesso visual e de navegação.
* Manter consistência nos valores de role (`USER`, `ADMIN`, etc.) entre frontend e backend.
