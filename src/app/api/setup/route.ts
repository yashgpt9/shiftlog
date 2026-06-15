import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS machine_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        machine_id VARCHAR(50) NOT NULL,
        shift VARCHAR(10) NOT NULL,
        log_date DATE NOT NULL,
        period VARCHAR(20) NOT NULL,
        operator_name VARCHAR(100) NOT NULL,
        die_code VARCHAR(50),
        form_data JSONB NOT NULL,
        is_out_of_tolerance BOOLEAN DEFAULT FALSE,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(machine_id, shift, log_date, period)
      );
    `;
    return NextResponse.json({ message: 'Database schema created successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Failed to create database schema' }, { status: 500 });
  }
}
