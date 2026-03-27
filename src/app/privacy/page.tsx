export default function PrivacyPage() {
  return (
    <div className="container" style={{ padding: '40px 20px', lineHeight: '1.8' }}>
      <div className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
        <h1 style={{ marginBottom: '24px' }}>Privacy Policy</h1>
        <p>At PBShub, we take your privacy seriously.</p>
        <h3 style={{ marginTop: '24px' }}>1. Data Collection</h3>
        <p>We collect basic profile information (name, designation, profile picture) to identify contributors.</p>
        <h3 style={{ marginTop: '24px' }}>2. Data Usage</h3>
        <p>Your data is used solely for the functionality of the platform and to credit your contributions.</p>
        <h3 style={{ marginTop: '24px' }}>3. Data Security</h3>
        <p>We implement industry-standard security measures to protect your information.</p>
      </div>
    </div>
  );
}
