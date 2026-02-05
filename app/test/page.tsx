export default function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>MDLooker Test Page</h1>
      <p>If you can see this, the basic rendering works!</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
