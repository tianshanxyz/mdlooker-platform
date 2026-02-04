export default function NMPARegistrationGuide() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">NMPA Registration Guide 2024</h1>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>Disclaimer:</strong> Based on NMPA regulations as of 2024. Verify at nmpa.gov.cn.
          </p>
        </div>

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">1. Device Classification</h2>
            <p className="text-slate-700 mb-4">
              NMPA classifies medical devices into three categories based on risk level:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Class I:</strong> Low risk (e.g., surgical instruments, bandages)</li>
              <li><strong>Class II:</strong> Moderate risk (e.g., ultrasound devices, patient monitors)</li>
              <li><strong>Class III:</strong> High risk (e.g., pacemakers, implantable devices)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">2. Registration Pathways</h2>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Domestic Manufacturers (境内生产)</h3>
                <p className="text-slate-700">Apply for 医疗器械注册证 (Medical Device Registration Certificate)</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Imported Devices (进口)</h3>
                <p className="text-slate-700">Apply for 进口医疗器械注册证 (Imported Medical Device Registration Certificate)</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Hong Kong, Macau, Taiwan</h3>
                <p className="text-slate-700">Treated as imported devices, require 进口医疗器械注册证</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">3. Timeline & Costs (2024)</h2>
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-2 text-left">Class</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Timeline</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Application Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Class I</td>
                  <td className="border border-slate-300 px-4 py-2">1-2 months</td>
                  <td className="border border-slate-300 px-4 py-2">¥0 (filing only)</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Class II</td>
                  <td className="border border-slate-300 px-4 py-2">12-18 months</td>
                  <td className="border border-slate-300 px-4 py-2">¥153,600</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Class III</td>
                  <td className="border border-slate-300 px-4 py-2">18-24 months</td>
                  <td className="border border-slate-300 px-4 py-2">¥204,800</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">4. Required Documents</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Business license and manufacturing license</li>
              <li>Product technical requirements (产品技术要求)</li>
              <li>Testing reports from NMPA-accredited labs</li>
              <li>Clinical evaluation report (CER) or clinical trial data</li>
              <li>Risk management report (ISO 14971)</li>
              <li>Quality management system certificate (ISO 13485)</li>
              <li>Instructions for use and labeling</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">5. Key Regulatory References</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Regulations on Supervision and Administration of Medical Devices (国务院令第739号)</li>
              <li>Measures for the Administration of Medical Device Registration (NMPA Order No. 47)</li>
              <li>GB/T 16886 series (Biological evaluation of medical devices)</li>
              <li>YY/T 0316 (Risk management application to medical devices)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">6. Official Resources</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>
                <a href="https://www.nmpa.gov.cn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  NMPA Official Website
                </a>
              </li>
              <li>
                <a href="https://www.nmpa.gov.cn/datasearch/search-info.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  NMPA Database Search
                </a>
              </li>
              <li>
                <a href="https://www.cmde.org.cn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Center for Medical Device Evaluation (CMDE)
                </a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
