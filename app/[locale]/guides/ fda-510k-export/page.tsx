export default function GuideDetailPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6 prose prose-slate">
        <h1>FDA 510(k) Export Guide 2024</h1>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>Disclaimer:</strong> Based on FDA regulations as of 2024. 
            Verify at <a href="https://www.fda.gov" target="_blank">fda.gov</a>.
          </p>
        </div>

        <h2>1. Determine Device Classification</h2>
        <p>Search FDA Product Classification Database for your device code.</p>
        <p className="text-sm text-slate-600">
          Source: <a href="https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPCD/classification.cfm" target="_blank">FDA Database</a>
        </p>

        <h2>2. Timeline & Costs</h2>
        <ul>
          <li>Preparation: 3-6 months, $10,000-$50,000</li>
          <li>FDA Review Fee: $21,760 (2024 standard)</li>
          <li>Total Timeline: 6-12 months</li>
        </ul>
      </div>
    </div>
  );
}
