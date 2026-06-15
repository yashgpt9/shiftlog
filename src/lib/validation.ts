export const TOLERANCES = {
  thickness: { min: 20.55, max: 20.65 },
  symmetry: { min: 0, max: 0.2 },
  parallelism: { min: 0, max: 0.05 },
};

export function checkTolerance(formData: any) {
  let isOutOfTolerance = false;
  
  const checkValue = (val: number | string | undefined, param: keyof typeof TOLERANCES) => {
    if (val === undefined || val === null || val === '') return;
    const num = Number(val);
    if (!isNaN(num)) {
      if (num < TOLERANCES[param].min || num > TOLERANCES[param].max) {
        isOutOfTolerance = true;
      }
    }
  };

  const { inspections } = formData || {};
  if (!inspections) return false;

  const { thickness, symmetry, parallelism, visual } = inspections;

  if (thickness) {
    checkValue(thickness.min, 'thickness');
    checkValue(thickness.max, 'thickness');
  }
  if (symmetry) {
    checkValue(symmetry.min, 'symmetry');
    checkValue(symmetry.max, 'symmetry');
  }
  if (parallelism) {
    checkValue(parallelism.min, 'parallelism');
    checkValue(parallelism.max, 'parallelism');
  }
  
  if (visual) {
    const vMin = String(visual.min || '').toUpperCase();
    const vMax = String(visual.max || '').toUpperCase();
    if (vMin === 'NG' || vMin === 'NOT OK' || vMax === 'NG' || vMax === 'NOT OK') {
      isOutOfTolerance = true;
    }
  }

  return isOutOfTolerance;
}
