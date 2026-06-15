import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { checkTolerance } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { machine_id, shift, log_date, period, operator_name, die_code, form_data } = body;

    const isOutOfTolerance = checkTolerance(form_data);

    const existing = await sql`
      SELECT id FROM machine_logs 
      WHERE machine_id = ${machine_id} 
        AND shift = ${shift} 
        AND log_date = ${log_date} 
        AND period = ${period}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Log already submitted for this period.' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO machine_logs (
        machine_id, shift, log_date, period, operator_name, die_code, form_data, is_out_of_tolerance
      ) VALUES (
        ${machine_id}, ${shift}, ${log_date}, ${period}, ${operator_name}, ${die_code}, ${sql.json(form_data)}, ${isOutOfTolerance}
      ) RETURNING id
    `;

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (err: any) {
    console.error('Error submitting log:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    if (date) {
      const logs = await sql`
        SELECT * FROM machine_logs WHERE log_date = ${date} ORDER BY submitted_at DESC
      `;
      return NextResponse.json({ logs });
    }
    const logs = await sql`
      SELECT * FROM machine_logs ORDER BY log_date DESC, submitted_at DESC LIMIT 100
    `;
    return NextResponse.json({ logs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
