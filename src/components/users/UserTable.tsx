// src/components/users/UserTable.tsx


interface UserTableProps {
  users: any[];
  onEdit: (user: any) => void;
  onDelete: (id: any) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '16px' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px', backgroundColor: 'white' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
            <th style={{ border: '1px solid #d1d5db', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px' }}>Usuario</th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users && users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id || u.username}>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{u.id || 'N/A'}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{u.username}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>
                  <button 
                    onClick={() => onEdit(u)} 
                    style={{ marginRight: '8px', padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Editar / Cambiar Contraseña
                  </button>
                  <button 
                    onClick={() => onDelete(u.id)} 
                    style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'center', color: '#6b7280' }}>
                No hay usuarios registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}