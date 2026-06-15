"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function safeVal(log: any, param: string, minMax: 'min' | 'max') {
  if (!log || !log.form_data || !log.form_data.inspections || !log.form_data.inspections[param]) return '';
  return log.form_data.inspections[param][minMax] || '';
}

export default function ReportClient({ initialLogs, machineId, logDate, targetLogId }: any) {
  const router = useRouter();
  const [logs, setLogs] = useState(initialLogs);
  const [saving, setSaving] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleValueChange = (logId: string, param: string, minMax: 'min'|'max', val: string) => {
    setLogs((prev: any[]) => prev.map(l => {
      if (l.id === logId) {
        const newForm = { ...l.form_data };
        if (!newForm.inspections) newForm.inspections = {};
        if (!newForm.inspections[param]) newForm.inspections[param] = { min: '', max: '' };
        newForm.inspections[param][minMax] = val;
        return { ...l, form_data: newForm };
      }
      return l;
    }));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      for (const l of logs) {
        await fetch(`/api/logs/${l.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ form_data: l.form_data })
        });
      }
      alert('Changes saved successfully.');
      router.refresh();
    } catch (e) {
      alert('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const ShiftSection = ({ shift, isFirst }: { shift: string, isFirst?: boolean }) => {
    const shiftLogs = logs.filter((l: any) => l.shift === shift);
    const firstLog = shiftLogs.find((l: any) => l.period === 'first_4h');
    const lastLog = shiftLogs.find((l: any) => l.period === 'last_4h');
    const operatorName = firstLog?.operator_name || lastLog?.operator_name || '';

    const dt = new Date(logDate);
    const dateStr = format(dt, 'dd/MM/yyyy');

    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginBottom: '0', borderTop: isFirst ? 'none' : '2px solid #000' }}>
        <tbody>
          {isFirst && (
            <tr>
              <td colSpan={15} style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '4px' }}>PROCESS DATA SHEET</td>
              <td colSpan={2} style={{ color: '#0055A4', fontWeight: 'bold', fontSize: '11px', textAlign: 'right', border: '1px solid #000', borderLeft: 'none', padding: '4px' }}>
                SANSERA<br /><span style={{ color: '#000', fontSize: '9px', fontWeight: 'normal' }}>PLANT IV</span>
              </td>
            </tr>
          )}
          {!isFirst && (
            <tr>
              <td colSpan={15} style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', borderTop: '2px solid #000', padding: '4px' }}>PROCESS DATA SHEET</td>
              <td colSpan={2} style={{ color: '#0055A4', fontWeight: 'bold', fontSize: '11px', textAlign: 'right', border: '1px solid #000', borderLeft: 'none', borderTop: '2px solid #000', padding: '4px' }}>
                SANSERA<br /><span style={{ color: '#000', fontSize: '9px', fontWeight: 'normal' }}>PLANT IV</span>
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={6} style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000' }}>Component No.{machineId}</td>
            <td colSpan={3} style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000' }}>Shift: &nbsp;&nbsp;{shift}</td>
            <td colSpan={4} style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000' }}>Date: {dateStr}</td>
            <td colSpan={4} style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000' }}>Operation: Rough thickness<br />grinding</td>
          </tr>
          <tr>
            <td colSpan={6} style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000' }}>Operator name: {operatorName}</td>
            <td colSpan={3} style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000' }}>Die Code: --</td>
            <td colSpan={4} style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000' }}>M/C No. : {machineId === 'MACR1015' ? '' : '--'}</td>
            <td colSpan={4} style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000' }}>Operation Number: 040</td>
          </tr>
          <tr>
            <th rowSpan={2} style={{ width: '3%', border: '1px solid #000', padding: '4px' }}>S.No</th>
            <th rowSpan={2} style={{ width: '14%', border: '1px solid #000', padding: '4px' }}>Parameter</th>
            <th rowSpan={2} style={{ width: '11%', border: '1px solid #000', padding: '4px' }}>Specification</th>
            <th rowSpan={2} style={{ width: '14%', border: '1px solid #000', padding: '4px' }}>Insp. Method</th>
            <th rowSpan={2} style={{ width: '3%', border: '1px solid #000', padding: '4px' }}>Res.</th>
            <th colSpan={2} style={{ border: '1px solid #000', padding: '4px' }}>Sample</th>
            <th colSpan={4} style={{ border: '1px solid #000', padding: '4px' }}>IN-PROCESS INSPECTION</th>
            <th colSpan={6} style={{ border: '1px solid #000', padding: '4px' }}>CHANGEPOINT DETAIL</th>
          </tr>
          <tr>
            <th style={{ width: '3%', border: '1px solid #000', padding: '4px' }}>Size</th>
            <th style={{ width: '3%', border: '1px solid #000', padding: '4px' }}>Freq.</th>
            <th style={{ width: '3.5%', border: '1px solid #000', padding: '4px' }}>MIN.</th>
            <th style={{ width: '3.5%', border: '1px solid #000', padding: '4px' }}>MAX.</th>
            <th style={{ width: '3.5%', border: '1px solid #000', padding: '4px' }}>MIN.</th>
            <th style={{ width: '3.5%', border: '1px solid #000', padding: '4px' }}>MAX.</th>
            {[...Array(6)].map((_, i) => <th key={i} style={{ width: '5.83%', border: '1px solid #000', padding: '4px' }}></th>)}
          </tr>
          
          {/* Row 1 Thickness */}
          <tr>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>1</td>
            <td style={{ border: '1px solid #000', textAlign: 'left', padding: '4px' }}>Thickness <span style={{ float: 'right', color: 'red', fontSize: '16px', fontWeight: 'bold' }}>&#9671;</span></td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>20.6±0.05<br />(20.55 ~ 20.65)</td>
            <td style={{ border: '1px solid #000', textAlign: 'left', padding: '4px' }}>Digital Micrometer<br />(L.C:0.001)</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>I</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>3</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>4Hr</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>
              {firstLog ? <input type="text" value={safeVal(firstLog, 'thickness', 'min')} onChange={e => handleValueChange(firstLog.id, 'thickness', 'min', e.target.value)} style={{ width: '100%', height: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={Number(safeVal(firstLog, 'thickness', 'min')) < 20.55 || Number(safeVal(firstLog, 'thickness', 'min')) > 20.65 ? 'bg-red-100 text-red-900 font-bold' : ''} /> : ''}
            </td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>
              {firstLog ? <input type="text" value={safeVal(firstLog, 'thickness', 'max')} onChange={e => handleValueChange(firstLog.id, 'thickness', 'max', e.target.value)} style={{ width: '100%', height: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={Number(safeVal(firstLog, 'thickness', 'max')) < 20.55 || Number(safeVal(firstLog, 'thickness', 'max')) > 20.65 ? 'bg-red-100 text-red-900 font-bold' : ''} /> : ''}
            </td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>
              {lastLog ? <input type="text" value={safeVal(lastLog, 'thickness', 'min')} onChange={e => handleValueChange(lastLog.id, 'thickness', 'min', e.target.value)} style={{ width: '100%', height: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={Number(safeVal(lastLog, 'thickness', 'min')) < 20.55 || Number(safeVal(lastLog, 'thickness', 'min')) > 20.65 ? 'bg-red-100 text-red-900 font-bold' : ''} /> : ''}
            </td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>
              {lastLog ? <input type="text" value={safeVal(lastLog, 'thickness', 'max')} onChange={e => handleValueChange(lastLog.id, 'thickness', 'max', e.target.value)} style={{ width: '100%', height: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={Number(safeVal(lastLog, 'thickness', 'max')) < 20.55 || Number(safeVal(lastLog, 'thickness', 'max')) > 20.65 ? 'bg-red-100 text-red-900 font-bold' : ''} /> : ''}
            </td>
            {[...Array(6)].map((_, i) => <td key={i} style={{ border: '1px solid #000' }}></td>)}
          </tr>

          {/* Row 2 Stem Symmetry */}
          <tr>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>2</td>
            <td style={{ border: '1px solid #000', textAlign: 'left', padding: '4px' }}>Stem Symmetry w.r.t<br />Thickness Face</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>0.2 max</td>
            <td style={{ border: '1px solid #000', textAlign: 'left', padding: '4px' }}>Ht.gauge with lever dial &<br />v-Block (LC:{machineId === 'MACR1015' ? '0.002' : '0.01'})</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>I</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>1</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>4Hr</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{firstLog && <input type="text" value={safeVal(firstLog, 'symmetry', 'min')} onChange={e => handleValueChange(firstLog.id, 'symmetry', 'min', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={Number(safeVal(firstLog, 'symmetry', 'min')) > 0.2 ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{firstLog && <input type="text" value={safeVal(firstLog, 'symmetry', 'max')} onChange={e => handleValueChange(firstLog.id, 'symmetry', 'max', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={Number(safeVal(firstLog, 'symmetry', 'max')) > 0.2 ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{lastLog && <input type="text" value={safeVal(lastLog, 'symmetry', 'min')} onChange={e => handleValueChange(lastLog.id, 'symmetry', 'min', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={Number(safeVal(lastLog, 'symmetry', 'min')) > 0.2 ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{lastLog && <input type="text" value={safeVal(lastLog, 'symmetry', 'max')} onChange={e => handleValueChange(lastLog.id, 'symmetry', 'max', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={Number(safeVal(lastLog, 'symmetry', 'max')) > 0.2 ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            {[...Array(6)].map((_, i) => <td key={i} style={{ border: '1px solid #000' }}></td>)}
          </tr>

          {/* Row 3 Parallelism */}
          <tr>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>3</td>
            <td style={{ border: '1px solid #000', textAlign: 'left', padding: '4px' }}>Parallelism w.r.t thickness<br />face</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>0.05 max</td>
            <td style={{ border: '1px solid #000', textAlign: 'left', padding: '4px' }}>Ht.gauge with lever dial &<br />v-Block (LC:0.002)</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>I</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>1</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>4Hr</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{firstLog && <input type="text" value={safeVal(firstLog, 'parallelism', 'min')} onChange={e => handleValueChange(firstLog.id, 'parallelism', 'min', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none' }} className={Number(safeVal(firstLog, 'parallelism', 'min')) > 0.05 ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{firstLog && <input type="text" value={safeVal(firstLog, 'parallelism', 'max')} onChange={e => handleValueChange(firstLog.id, 'parallelism', 'max', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none' }} className={Number(safeVal(firstLog, 'parallelism', 'max')) > 0.05 ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{lastLog && <input type="text" value={safeVal(lastLog, 'parallelism', 'min')} onChange={e => handleValueChange(lastLog.id, 'parallelism', 'min', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={Number(safeVal(lastLog, 'parallelism', 'min')) > 0.05 ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{lastLog && <input type="text" value={safeVal(lastLog, 'parallelism', 'max')} onChange={e => handleValueChange(lastLog.id, 'parallelism', 'max', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={Number(safeVal(lastLog, 'parallelism', 'max')) > 0.05 ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            {[...Array(6)].map((_, i) => <td key={i} style={{ border: '1px solid #000' }}></td>)}
          </tr>

          {/* Row 4 Visual */}
          <tr>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>4</td>
            <td style={{ border: '1px solid #000', textAlign: 'left', padding: '4px' }}>Face unclear, dam-<br />ages, Line Marks and<br />Burnings</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>Not allowed</td>
            <td style={{ border: '1px solid #000', textAlign: 'left', padding: '4px' }}>Visual (With limit sample)</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>I</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>1</td>
            <td style={{ border: '1px solid #000', textAlign: 'center' }}>4Hr</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{firstLog && <input type="text" value={safeVal(firstLog, 'visual', 'min')} onChange={e => handleValueChange(firstLog.id, 'visual', 'min', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={safeVal(firstLog, 'visual', 'min').toUpperCase() === 'NG' ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{firstLog && <input type="text" value={safeVal(firstLog, 'visual', 'max')} onChange={e => handleValueChange(firstLog.id, 'visual', 'max', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none', color: '#000', fontWeight: 'bold' }} className={safeVal(firstLog, 'visual', 'max').toUpperCase() === 'NG' ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{lastLog && <input type="text" value={safeVal(lastLog, 'visual', 'min')} onChange={e => handleValueChange(lastLog.id, 'visual', 'min', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none' }} className={safeVal(lastLog, 'visual', 'min').toUpperCase() === 'NG' ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            <td style={{ border: '1px solid #000', textAlign: 'center', padding: '0' }}>{lastLog && <input type="text" value={safeVal(lastLog, 'visual', 'max')} onChange={e => handleValueChange(lastLog.id, 'visual', 'max', e.target.value)} style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none' }} className={safeVal(lastLog, 'visual', 'max').toUpperCase() === 'NG' ? 'bg-red-100 text-red-900 font-bold' : ''}/>}</td>
            {[...Array(6)].map((_, i) => <td key={i} style={{ border: '1px solid #000' }}></td>)}
          </tr>

          <tr>
            <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '10px', border: '1px solid #000' }}>Time</td>
            <td colSpan={2} style={{ fontSize: '8px', border: '1px solid #000', textAlign: 'center' }}>FIRST 4 HOURS<br />OF SHIFT</td>
            <td colSpan={2} style={{ fontSize: '8px', border: '1px solid #000', textAlign: 'center' }}>LAST 4 HOURS OF<br />SHIFT</td>
            {[...Array(6)].map((_, i) => <td key={i} style={{ border: '1px solid #000' }}></td>)}
          </tr>
          <tr>
            <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '10px', border: '1px solid #000' }}>Inspector</td>
            <td colSpan={10} style={{ border: '1px solid #000' }}></td>
          </tr>
          <tr>
            <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '10px', border: '1px solid #000' }}>Shift In charge verification</td>
            <td colSpan={10} style={{ border: '1px solid #000' }}></td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <Link href="/supervisor" className="text-slate-300 hover:text-white font-semibold flex items-center">
          &larr; Back to Dashboard
        </Link>
        <div className="space-x-4">
          <button onClick={saveChanges} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={handlePrint} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors">
            Print Report
          </button>
        </div>
      </div>
      
      <div className="max-w-[1000px] mx-auto p-5" style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>
        <ShiftSection shift="A" isFirst={true} />
        <div style={{ height: '10px' }}></div>
        <ShiftSection shift="B" />
        
        <div style={{ border: '1px solid #000', borderTop: 'none', padding: '4px', fontSize: '9px', fontWeight: 'bold', textAlign: 'left' }}>
          O=operator change ,C=Component Change,P=Cutting Parameter Change,T=Tool Change, D=Dim compensation,E=Fixture/Accesory Change,RT =Resetting tool,RF=Resetting Fix<br/>
          <span style={{ borderBottom: '1px solid #000', display: 'block', margin: '2px 0' }}>I=Inspector,W=Workman</span>
          Legends= &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', verticalAlign: 'middle' }}>&#9671;</span> Critical Characteristics for Process
        </div>
        
        <ShiftSection shift="C" />
        <div style={{ height: '10px' }}></div>

        {/* NC Detail Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', borderTop: '2px solid #000' }}>
          <tbody>
            <tr>
              <th rowSpan={2} style={{ width: '4%', border: '1px solid #000', padding: '4px' }}>S.NO</th>
              <th rowSpan={2} style={{ width: '8%', border: '1px solid #000', padding: '4px' }}>SHIFT</th>
              <th rowSpan={2} style={{ width: '8%', border: '1px solid #000', padding: '4px' }}>TIME</th>
              <th rowSpan={2} style={{ width: '20%', border: '1px solid #000', padding: '4px' }}>NC DETAIL</th>
              <th rowSpan={2} style={{ width: '20%', border: '1px solid #000', padding: '4px' }}>ROOT CAUSE</th>
              <th rowSpan={2} style={{ width: '20%', border: '1px solid #000', padding: '4px' }}>CORRECTIVE ACTION</th>
              <th colSpan={3} style={{ width: '12%', border: '1px solid #000', padding: '4px' }}>SEGREGATION DETAILS</th>
              <th rowSpan={2} style={{ width: '4%', border: '1px solid #000', padding: '4px' }}>PROD.<br/>INCH.</th>
              <th rowSpan={2} style={{ width: '4%', border: '1px solid #000', padding: '4px' }}>QA<br/>INCH.</th>
            </tr>
            <tr>
              <th style={{ fontSize: '9px', border: '1px solid #000', padding: '4px' }}>TOTAL</th>
              <th style={{ fontSize: '9px', border: '1px solid #000', padding: '4px' }}>OK</th>
              <th style={{ fontSize: '9px', border: '1px solid #000', padding: '4px' }}>NG</th>
            </tr>
            {[...Array(3)].map((_, i) => (
              <tr key={i}>
                <td style={{ height: '30px', border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
