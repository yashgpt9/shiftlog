import sql from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentShiftDetails } from '@/lib/utils';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function SupervisorDashboard() {
  const cookieStore = await cookies();
  if (!cookieStore.has('supervisor')) {
    redirect('/supervisor/login');
  }

  const logs = await sql`
    SELECT * FROM machine_logs ORDER BY log_date DESC, submitted_at DESC LIMIT 200
  `;

  const now = new Date();
  const { logDateStr } = getCurrentShiftDetails(now);
  
  const expectedLogs: any[] = [];
  const machines = ['MACR1015', 'MACR1021'];
  
  const addExpected = (machine: string, s: string, p: string) => {
    expectedLogs.push({ machine, shift: s, period: p, date: logDateStr });
  };

  const totalMins = now.getHours() * 60 + now.getMinutes();

  machines.forEach(m => {
    if (totalMins >= 630 || totalMins < 390) addExpected(m, 'A', 'first_4h');
    if (totalMins >= 900 || totalMins < 390) addExpected(m, 'A', 'last_4h');
    if (totalMins >= 1140 || totalMins < 390) addExpected(m, 'B', 'first_4h');
    if (totalMins >= 1410 || totalMins < 390) addExpected(m, 'B', 'last_4h');
    if (totalMins >= 210 && totalMins < 390) addExpected(m, 'C', 'first_4h');
  });

  const todayLogs = logs.filter(l => {
    const d = new Date(l.log_date);
    return format(d, 'yyyy-MM-dd') === logDateStr;
  });
  
  const missedLogs = expectedLogs.filter(exp => {
    return !todayLogs.find(l => l.machine_id === exp.machine && l.shift === exp.shift && l.period === exp.period);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white p-6 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">S</div>
            <h1 className="text-2xl font-extrabold tracking-tight">Supervisor Dashboard</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Production Date</div>
              <div className="text-lg font-bold text-blue-400">{logDateStr}</div>
            </div>
            <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors">
              Log Out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        
        {missedLogs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-extrabold text-red-600 mb-5 flex items-center">
              <span className="bg-red-100 p-1.5 rounded-lg mr-3 shadow-sm">⚠️</span> 
              Missed Submissions Alert
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {missedLogs.map((ml, i) => (
                <div key={i} className="bg-white border-2 border-red-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div className="font-extrabold text-slate-900 text-lg">{ml.machine}</div>
                  <div className="text-slate-600 font-medium text-sm mt-1">Shift {ml.shift} <span className="text-slate-400 ml-1">({ml.period === 'first_4h' ? 'First 4h' : 'Last 4h'})</span></div>
                  <div className="mt-3 inline-block px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded uppercase tracking-wider border border-red-100">
                    Expected by {ml.period === 'first_4h' ? (ml.shift === 'A' ? '10:30' : ml.shift === 'B' ? '19:00' : '03:30') : (ml.shift === 'A' ? '15:00' : ml.shift === 'B' ? '23:30' : '06:30')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-800">All Submitted Logs</h2>
            <div className="text-sm font-semibold text-slate-500">{logs.length} records found</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Machine</th>
                  <th className="py-4 px-6">Shift & Period</th>
                  <th className="py-4 px-6">Operator</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const isRed = log.is_out_of_tolerance;
                  const d = new Date(log.log_date);
                  return (
                    <tr key={log.id} className={`hover:bg-slate-50 transition-colors ${isRed ? 'bg-red-50/40' : ''}`}>
                      <td className="py-5 px-6 font-medium text-slate-600">{format(d, 'yyyy-MM-dd')}</td>
                      <td className="py-5 px-6 font-extrabold text-slate-900 text-base">{log.machine_id}</td>
                      <td className="py-5 px-6 font-medium text-slate-700">
                        Shift <span className="font-bold">{log.shift}</span> <span className="text-slate-400 ml-1">({log.period === 'first_4h' ? 'First 4h' : 'Last 4h'})</span>
                      </td>
                      <td className="py-5 px-6 font-medium text-slate-600">{log.operator_name}</td>
                      <td className="py-5 px-6">
                        {isRed ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200 shadow-sm">
                            OUT OF TOLERANCE
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <Link href={`/supervisor/log/${log.id}`} className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
                          Review Detail &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">No logs found in the database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
