export default function SupportPage() {
  return (
    <div className="container" style={{ padding: '40px 20px', lineHeight: '1.8' }}>
      <div className="glass" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '24px' }}>Support Center</h1>
        <p>Need help? Contact our technical support team.</p>
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card">
            <h3>Email Support</h3>
            <p>support@pbshub.com</p>
          </div>
          <div className="glass-card">
            <h3>Community Help</h3>
            <p>Join our group to discuss technical issues.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
