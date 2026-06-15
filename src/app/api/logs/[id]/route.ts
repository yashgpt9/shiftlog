import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { checkTolerance } from '@/lib/validation';

export async function PUT(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await req.json();
    const { form_data } = body;

    const isOutOfTolerance = checkTolerance(form_data);

    await sql`
      UPDATE machine_logs 
      SET form_data = ${sql.json(form_data)}, 
          is_out_of_tolerance = ${isOutOfTolerance}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating log:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
