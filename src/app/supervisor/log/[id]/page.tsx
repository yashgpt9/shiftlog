import sql from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ReportClient from './ReportClient';

export const dynamic = 'force-dynamic';

export default async function SupervisorLogReview({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  if (!cookieStore.has('supervisor')) {
    redirect('/supervisor/login');
  }

  const logId = params.id;

  const targetLogResult = await sql`SELECT machine_id, log_date FROM machine_logs WHERE id = ${logId}`;
  
  if (targetLogResult.length === 0) {
    return <div className="p-8">Log not found.</div>;
  }

  const { machine_id, log_date } = targetLogResult[0];

  const dailyLogs = await sql`
    SELECT * FROM machine_logs 
    WHERE machine_id = ${machine_id} AND log_date = ${log_date}
  `;

  // We pass the data to a client component to handle editing and printing
  return <ReportClient initialLogs={dailyLogs} machineId={machine_id} logDate={log_date} targetLogId={logId} />;
}
