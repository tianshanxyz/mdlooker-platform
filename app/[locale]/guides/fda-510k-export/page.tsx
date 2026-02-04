export default function GuideDetailPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">FDA 510(k) Export Guide 2024</h1>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>Disclaimer:</strong> Based on FDA regulations as of 2024. Verify at fda.gov.
          </p>
        </div>

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">1. Device Classification</h2>
            <p className="text-slate-700">Use FDA Product Classification Database for your device code.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">2. Timeline & Costs (2024)</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Preparation: 3-6 months, $10,000-$50,000</li>
              <li>FDA Review Fee: $21,760 (standard)</li>
              <li>Total: 6-12 months</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">3. Predicate Device</h2>
            <p className="text-slate-700">Choose a legally marketed device with same intended use.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">4. Submission</h2>
            <p className="text-slate-700">Use FDA eSubmitter system. Review takes 90-120 days.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
