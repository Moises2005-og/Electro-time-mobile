export interface Role {
  tipo_role: string;          // e.g. "admin", "colaborador"
  tipo_role_display: string;  // e.g. "Administrador"
  empresa_id: number;
  empresa_nome: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  nome: string;
  sobrenome: string;
  role: Role;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  id: number;
  username: string;
  email: string;
  nome: string;
  sobrenome: string;
  role: Role;
  autenticado: boolean;
  mensagem: string;
}
