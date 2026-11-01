export default function AdminPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f1f5f9 50%, #e0e7ff 100%)',
      padding: '24px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '8px'
        }}>Tableau de bord</h1>
        <p style={{ color: '#64748b' }}>Console d'administration DuoPlay</p>
      </div>
    </div>
  );
}
