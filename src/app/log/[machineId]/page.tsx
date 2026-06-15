"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentShiftDetails } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MachineLogPage() {
  const params = useParams();
  const machineId = params.machineId as string;

  const [shiftDetails, setShiftDetails] = useState({ shift: '', period: '', logDateStr: '' });
  const [operatorName, setOperatorName] = useState('');
  const [dieCode, setDieCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [inspections, setInspections] = useState({
    thickness: { min: '', max: '' },
    symmetry: { min: '', max: '' },
    parallelism: { min: '', max: '' },
    visual: { min: '', max: '' },
  });

  useEffect(() => {
    setShiftDetails(getCurrentShiftDetails(new Date()));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_id: machineId,
          shift: shiftDetails.shift,
          log_date: shiftDetails.logDateStr,
          period: shiftDetails.period,
          operator_name: operatorName,
          form_data: { inspections }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit log');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!shiftDetails.shift) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-medium text-slate-500">Loading current shift details...</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Log Submitted</h2>
          <p className="text-slate-500 mt-3 font-medium">Your shift log has been securely recorded in the system.</p>
          <Link href="/" className="mt-8 block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-8 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Machine Selection
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Machine Log: {machineId}</h1>
                <p className="text-slate-400 font-medium mt-2">Fill out the inspection parameters for the current active period.</p>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Production Date</div>
                <div className="text-xl font-bold text-blue-400">{shiftDetails.logDateStr}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-lg font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Operator Name</label>
                  <input required type="text" value={operatorName} onChange={e => setOperatorName(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:ring-0 focus:border-blue-500 transition-colors outline-none" placeholder="Enter your full name" />
                </div>
              </div>

              <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Auto-Detected Period</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="font-semibold text-slate-600">Shift</span>
                    <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">Shift {shiftDetails.shift}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Period</span>
                    <span className="font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-md border border-blue-200 shadow-sm">
                      {shiftDetails.period === 'first_4h' ? 'First 4 Hours' : 'Last 4 Hours'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center">
                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">✓</span>
                In-Process Inspection
              </h3>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-sm uppercase tracking-wider">
                    <th className="py-4 px-6 font-bold w-1/2">Parameter & Specification</th>
                    <th className="py-4 px-6 font-bold text-center w-1/4">MIN</th>
                    <th className="py-4 px-6 font-bold text-center w-1/4">MAX</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-6">
                      <div className="font-bold text-slate-900 text-base">1. Thickness</div>
                      <div className="text-slate-500 font-medium text-sm mt-1">20.6±0.05 <span className="text-slate-400 font-normal">(20.55 ~ 20.65)</span></div>
                    </td>
                    <td className="py-5 px-4">
                      <input required type="number" step="0.001" placeholder="e.g. 20.60" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 font-semibold text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        value={inspections.thickness.min} onChange={e => setInspections({...inspections, thickness: {...inspections.thickness, min: e.target.value}})} />
                    </td>
                    <td className="py-5 px-4">
                      <input required type="number" step="0.001" placeholder="e.g. 20.60" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 font-semibold text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        value={inspections.thickness.max} onChange={e => setInspections({...inspections, thickness: {...inspections.thickness, max: e.target.value}})} />
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors bg-slate-50/30">
                    <td className="py-5 px-6">
                      <div className="font-bold text-slate-900 text-base">2. Stem Symmetry</div>
                      <div className="text-slate-500 font-medium text-sm mt-1">0.2 max <span className="text-slate-400 font-normal">(w.r.t Thickness Face)</span></div>
                    </td>
                    <td className="py-5 px-4">
                      <input required type="number" step="0.001" placeholder="e.g. 0.10" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 font-semibold text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        value={inspections.symmetry.min} onChange={e => setInspections({...inspections, symmetry: {...inspections.symmetry, min: e.target.value}})} />
                    </td>
                    <td className="py-5 px-4">
                      <input required type="number" step="0.001" placeholder="e.g. 0.10" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 font-semibold text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        value={inspections.symmetry.max} onChange={e => setInspections({...inspections, symmetry: {...inspections.symmetry, max: e.target.value}})} />
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-6">
                      <div className="font-bold text-slate-900 text-base">3. Parallelism</div>
                      <div className="text-slate-500 font-medium text-sm mt-1">0.05 max <span className="text-slate-400 font-normal">(w.r.t Thickness Face)</span></div>
                    </td>
                    <td className="py-5 px-4">
                      <input required type="number" step="0.001" placeholder="e.g. 0.02" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 font-semibold text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        value={inspections.parallelism.min} onChange={e => setInspections({...inspections, parallelism: {...inspections.parallelism, min: e.target.value}})} />
                    </td>
                    <td className="py-5 px-4">
                      <input required type="number" step="0.001" placeholder="e.g. 0.02" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 font-semibold text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        value={inspections.parallelism.max} onChange={e => setInspections({...inspections, parallelism: {...inspections.parallelism, max: e.target.value}})} />
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors bg-slate-50/30">
                    <td className="py-5 px-6">
                      <div className="font-bold text-slate-900 text-base">4. Visual Inspection</div>
                      <div className="text-slate-500 font-medium text-sm mt-1">Face unclear, damages, marks <span className="text-red-500 font-bold">(Not allowed)</span></div>
                    </td>
                    <td className="py-5 px-4">
                      <input required type="text" placeholder="OK or NG" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 font-bold text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase transition-all" 
                        value={inspections.visual.min} onChange={e => setInspections({...inspections, visual: {...inspections.visual, min: e.target.value}})} />
                    </td>
                    <td className="py-5 px-4">
                      <input required type="text" placeholder="OK or NG" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 font-bold text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase transition-all" 
                        value={inspections.visual.max} onChange={e => setInspections({...inspections, visual: {...inspections.visual, max: e.target.value}})} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-200">
              <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg py-5 px-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed">
                {loading ? 'Submitting to Database...' : `Submit ${shiftDetails.period === 'first_4h' ? 'First' : 'Last'} 4 Hours Inspection`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
