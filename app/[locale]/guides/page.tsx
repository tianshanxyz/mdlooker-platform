export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Regulatory Guides</h1>
        
        <article className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">FDA 510(k) Export Guide 2024</h2>
          <p className="text-slate-600 mb-6">
            A step-by-step roadmap for exporting Class II medical devices to USA.
          </p>
          <a 
            href={`/en/guides/fda-510k-export`} 
            className="text-blue-600 hover:underline font-medium"
          >
            Read Full Guide →
          </a>
        </article>
      </div>
    </div>
  );
}
