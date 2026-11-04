import assert from 'node:assert/strict';

function coordinatesInRotatedBasis({ x, y }, angleDegrees) {
  const angle = angleDegrees * Math.PI / 180;
  return {
    x: Math.cos(angle) * x + Math.sin(angle) * y,
    y: -Math.sin(angle) * x + Math.cos(angle) * y,
  };
}

const original = { x: 1.2, y: 0.8 };
const unchanged = coordinatesInRotatedBasis(original, 0);
assert.ok(Math.abs(unchanged.x - original.x) < 1e-10);
assert.ok(Math.abs(unchanged.y - original.y) < 1e-10);

const quarterTurn = coordinatesInRotatedBasis({ x: 1, y: 0 }, 90);
assert.ok(Math.abs(quarterTurn.x) < 1e-10);
assert.ok(Math.abs(quarterTurn.y + 1) < 1e-10);
console.log('Coordinate transformation checks passed.');
