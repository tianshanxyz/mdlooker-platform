export default function EUDAMEDRegistrationGuide() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">EUDAMED & EU MDR Guide 2024</h1>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>Disclaimer:</strong> Based on EU MDR 2017/745 and IVDR 2017/746. Verify at ec.europa.eu.
          </p>
        </div>

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">1. EUDAMED Overview</h2>
            <p className="text-slate-700 mb-4">
              EUDAMED (European Database on Medical Devices) is the IT system developed by the European Commission 
              to implement Regulation (EU) 2017/745 on medical devices and Regulation (EU) 2017/746 on in vitro diagnostic medical devices.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">EUDAMED Modules:</h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-700">
                <li>Actor registration (SRN - Single Registration Number)</li>
                <li>UDI/Devices registration</li>
                <li>Notified Bodies and Certificates</li>
                <li>Clinical Investigations and Performance Studies</li>
                <li>Vigilance and Post-Market Surveillance</li>
                <li>Market Surveillance</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">2. EU MDR Device Classification</h2>
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-2 text-left">Class</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Risk Level</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Examples</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Conformity Route</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Class I</td>
                  <td className="border border-slate-300 px-4 py-2">Low</td>
                  <td className="border border-slate-300 px-4 py-2">Wheelchairs, glasses</td>
                  <td className="border border-slate-300 px-4 py-2">Self-declaration</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Class IIa</td>
                  <td className="border border-slate-300 px-4 py-2">Medium</td>
                  <td className="border border-slate-300 px-4 py-2">Hearing aids, ultrasound</td>
                  <td className="border border-slate-300 px-4 py-2">Notified Body</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Class IIb</td>
                  <td className="border border-slate-300 px-4 py-2">Medium-High</td>
                  <td className="border border-slate-300 px-4 py-2">Infusion pumps, X-ray</td>
                  <td className="border border-slate-300 px-4 py-2">Notified Body</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Class III</td>
                  <td className="border border-slate-300 px-4 py-2">High</td>
                  <td className="border border-slate-300 px-4 py-2">Pacemakers, stents</td>
                  <td className="border border-slate-300 px-4 py-2">Notified Body + Clinical</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">3. Registration Process</h2>
            <ol className="list-decimal pl-6 space-y-3 text-slate-700">
              <li>
                <strong>Appoint Authorized Representative (AR)</strong> - Required for non-EU manufacturers
              </li>
              <li>
                <strong>Register as Actor in EUDAMED</strong> - Obtain SRN (Single Registration Number)
              </li>
              <li>
                <strong>Classify Device</strong> - Determine class according to Annex VIII of MDR
              </li>
              <li>
                <strong>Select Notified Body</strong> - For Class IIa, IIb, III devices
              </li>
              <li>
                <strong>Technical Documentation</strong> - Prepare according to Annexes II & III
              </li>
              <li>
                <strong>Quality Management System</strong> - Implement ISO 13485
              </li>
              <li>
                <strong>Clinical Evaluation</strong> - CER according to MEDDEV 2.7/1 rev 4
              </li>
              <li>
                <strong>UDI Assignment</strong> - Register device in EUDAMED UDI module
              </li>
              <li>
                <strong>CE Marking</strong> - Affix CE mark with Notified Body number
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">4. Timeline & Costs (2024)</h2>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Typical Timeline:</h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                  <li>Class I: 1-3 months (self-declaration)</li>
                  <li>Class IIa: 6-12 months</li>
                  <li>Class IIb: 9-15 months</li>
                  <li>Class III: 12-24 months</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Estimated Costs:</h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                  <li>Notified Body Audit: €15,000 - €50,000</li>
                  <li>Technical Documentation: €20,000 - €100,000+</li>
                  <li>Clinical Evaluation: €10,000 - €50,000+</li>
                  <li>Annual Surveillance: €5,000 - €15,000</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">5. Key Documents Required</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Technical Documentation (Annex II & III of MDR)</li>
              <li>Risk Management File (ISO 14971)</li>
              <li>Clinical Evaluation Report (CER)</li>
              <li>Post-Market Surveillance Plan</li>
              <li>Post-Market Clinical Follow-up (PMCF) Plan</li>
              <li>Summary of Safety and Clinical Performance (SSCP) - for implantable/class III</li>
              <li>Instructions for Use (IFU)</li>
              <li>Labeling and UDI carrier</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">6. Major Notified Bodies</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>BSI Group (0086, 2797)</li>
              <li>TÜV SÜD Product Service GmbH (0123)</li>
              <li>DEKRA Testing and Certification (0124)</li>
              <li>SGS Belgium NV (1639)</li>
              <li>DNV Product Assurance AS (2460)</li>
              <li>Intertek Semko AB (0413)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">7. Official Resources</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>
                <a href="https://ec.europa.eu/tools/eudamed" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  EUDAMED Portal
                </a>
              </li>
              <li>
                <a href="https://health.ec.europa.eu/medical-devices-sector/new-regulations_en" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  EU MDR/IVDR Regulations
                </a>
              </li>
              <li>
                <a href="https://ec.europa.eu/growth/sectors/medical-devices/contacts_en" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  National Competent Authorities
                </a>
              </li>
              <li>
                <a href="https://ec.europa.eu/growth/tools-databases/nando/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  NANDO Database (Notified Bodies)
                </a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
