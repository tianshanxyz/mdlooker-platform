export default function RootPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1>MDLooker Platform</h1>
      <p>Global Medical Device Compliance Intelligence</p>
      <div style={{ marginTop: '30px' }}>
        <a href="/en" style={{ marginRight: '20px', color: '#339999' }}>English</a>
        <a href="/zh" style={{ color: '#339999' }}>中文</a>
      </div>
      <div style={{ marginTop: '30px' }}>
        <a href="/test" style={{ color: '#666' }}>Test Page</a>
      </div>
    </div>
  );
}
