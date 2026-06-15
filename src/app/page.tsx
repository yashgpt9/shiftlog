import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shift Log System</h1>
          <p className="text-slate-500 mt-2 font-medium">Select a machine to start logging</p>
        </div>
        
        <div className="space-y-4">
          <Link href="/log/MACR1015" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            MACR1015
          </Link>
          <Link href="/log/MACR1021" className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            MACR1021
          </Link>
        </div>

        <div className="mt-12 text-center pt-6 border-t border-slate-100">
          <Link href="/supervisor/login" className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors">
            Supervisor Access &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
