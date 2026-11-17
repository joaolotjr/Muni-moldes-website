// Áreas do painel que podem ser liberadas para cada usuário.
// Manter igual a backend-moldes/src/auth/permissions.ts.
export type Permission = 'products' | 'collections' | 'news' | 'settings' | 'users';

export const permissionOptions: { value: Permission; label: string; description: string }[] = [
  { value: 'products', label: 'Produtos', description: 'Cadastrar, editar e excluir moldes e suas fotos.' },
  { value: 'collections', label: 'Categorias', description: 'Criar e organizar as linhas de produto.' },
  { value: 'news', label: 'Notícias', description: 'Escrever, publicar e excluir notícias.' },
  { value: 'settings', label: 'Configurações', description: 'Alterar contatos e textos do site.' },
  { value: 'users', label: 'Usuários', description: 'Criar usuários e definir o que cada um pode fazer.' },
];

export const permissionLabel = (permission: Permission) =>
  permissionOptions.find((option) => option.value === permission)?.label ?? permission;
