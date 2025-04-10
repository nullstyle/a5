import { describe, it, expect, test } from 'vitest'
import { getResolution, serialize, deserialize, MAX_RESOLUTION, REMOVAL_MASK, FIRST_HILBERT_RESOLUTION } from 'a5/core/serialization';
import { A5Cell } from 'a5/core/utils';
import { origins } from 'a5/core/origin';
import TEST_IDS from './test-ids.json';
import { cellToParent, cellToChildren } from 'a5/core/serialization';

const RESOLUTION_MASKS = [
  // Non-Hilbert resolutions
  '0000000000000000000000000000000000000000000000000000000000000000', // Globe
  '0000001000000000000000000000000000000000000000000000000000000000', // Dodecahedron faces
  '0000000100000000000000000000000000000000000000000000000000000000', // Quintants
  // Hilbert resolutions
  '0000000010000000000000000000000000000000000000000000000000000000',
  '0000000000100000000000000000000000000000000000000000000000000000',
  '0000000000001000000000000000000000000000000000000000000000000000',
  '0000000000000010000000000000000000000000000000000000000000000000',
  '0000000000000000100000000000000000000000000000000000000000000000',
  '0000000000000000001000000000000000000000000000000000000000000000',
  '0000000000000000000010000000000000000000000000000000000000000000',
  '0000000000000000000000100000000000000000000000000000000000000000',
  '0000000000000000000000001000000000000000000000000000000000000000',
  '0000000000000000000000000010000000000000000000000000000000000000',
  '0000000000000000000000000000100000000000000000000000000000000000',
  '0000000000000000000000000000001000000000000000000000000000000000',
  '0000000000000000000000000000000010000000000000000000000000000000',
  '0000000000000000000000000000000000100000000000000000000000000000',
  '0000000000000000000000000000000000001000000000000000000000000000',
  '0000000000000000000000000000000000000010000000000000000000000000',
  '0000000000000000000000000000000000000000100000000000000000000000',
  '0000000000000000000000000000000000000000001000000000000000000000',
  '0000000000000000000000000000000000000000000010000000000000000000',
  '0000000000000000000000000000000000000000000000100000000000000000',
  '0000000000000000000000000000000000000000000000001000000000000000',
  '0000000000000000000000000000000000000000000000000010000000000000',
  '0000000000000000000000000000000000000000000000000000100000000000',
  '0000000000000000000000000000000000000000000000000000001000000000',
  '0000000000000000000000000000000000000000000000000000000010000000',
  '0000000000000000000000000000000000000000000000000000000000100000',
  '0000000000000000000000000000000000000000000000000000000000001000',
  '0000000000000000000000000000000000000000000000000000000000000010',
  // Point level
  //'0000000000000000000000000000000000000000000000000000000000000001', // TODO
];

const origin0 = JSON.parse(JSON.stringify(origins[0])); // Use first origin for most tests

describe('serialize', () => {

  test('Correct number of masks', () => {
    expect(RESOLUTION_MASKS.length).toBe(MAX_RESOLUTION); // TODO add point level
  });

  test('Removal mask is correct', () => {
    const originSegmentBits = ''.padStart(6, '0');
    const remainingBits = ''.padStart(58, '1');
    const expected = BigInt(`0b${originSegmentBits}${remainingBits}`);
    expect(REMOVAL_MASK).toBe(expected);
  });

  test('encodes resolution correctly for different values', () => {
    const testCases = RESOLUTION_MASKS.map((_, i) => (
      // Origin 0 has first quintant 4, so start use segment 4 to obtain start of Hilbert curve
      {origin: origin0, segment: 4, S: 0n, resolution: i}
    ));

    testCases.forEach((input, i) => {
      const serialized = serialize(input);
      expect(serialized.toString(2).padStart(64, '0')).toBe(RESOLUTION_MASKS[i]);
    });
  });

  test('correctly extracts resolution', () => {
    RESOLUTION_MASKS.forEach((binary, i) => {
      const bitCount = binary.length;
      expect(bitCount).toBe(64);
      const N = BigInt(`0b${binary}`);
      const resolution = getResolution(N);
      expect(resolution).toBe(i);
    });
  });

  test('encodes origin, segment and S correctly', () => {
    // Origin 0 has first quintant 4, so start use segment 4 to obtain start of Hilbert curve
    const cell: A5Cell = { origin: origin0, segment: 4, S: 0n, resolution: 30 };
    const serialized = serialize(cell);
    expect(serialized).toBe(0b10n)
  });

  test('throws error when S is too large for resolution', () => {
    const cell: A5Cell = {
      origin: origin0,
      segment: 0,
      S: 16n, // Too large for resolution 2 (max is 15)
      resolution: 4
    };
    
    expect(() => serialize(cell)).toThrow('S (16) is too large for resolution level 4');
  });

  test('throws error when resolution exceeds maximum', () => {
    const cell: A5Cell = {
      origin: origin0,
      segment: 0,
      S: 0n,
      resolution: 32 // MAX_RESOLUTION is 31
    }

    expect(() => serialize(cell)).toThrow('Resolution (32) is too large');
  });

  describe('round trip', () => {
    test.skip('resolution masks', () => {
      RESOLUTION_MASKS.forEach(binary => {
        const serialized = BigInt(`0b${binary}`);
        const deserialized = deserialize(serialized);
        const reserialized = serialize(deserialized);
        expect(reserialized).toBe(serialized);
      });
    });

    for (let n = 1; n < 12; n++) {
      const originSegmentId = (5 * n).toString(2).padStart(6, '0');
      test(`resolution masks with origin ${n} (${originSegmentId})`, () => {
        RESOLUTION_MASKS.slice(FIRST_HILBERT_RESOLUTION).forEach(binary => {
          const serialized = BigInt(`0b${originSegmentId}${binary.slice(6)}`);
          const deserialized = deserialize(serialized);
          const reserialized = serialize(deserialized);
          expect(reserialized).toBe(serialized);
        });
      });
    }

    test('test ids', () => {
      TEST_IDS.forEach(id => {
        const serialized = BigInt(`0x${id}`);
        const deserialized = deserialize(serialized);
        const reserialized = serialize(deserialized);
        expect(reserialized).toBe(serialized);
      });
    });
  });
});

describe('hierarchy', () => {
  test.skip('round trip between cellToParent and cellToChildren', () => {
    TEST_IDS.forEach(id => {
      const cell = BigInt(`0x${id}`);
      const child = cellToChildren(cell)[0];
      const parent = cellToParent(child);
      expect(parent).toBe(cell);

      const children = cellToChildren(cell);
      const parents = children.map(c => cellToParent(c));
      expect(parents.every(p => p === cell)).toBe(true);
    });
  });
});

// A bit broken, can generate invalid ids
function randomId() {
  const originSegment = Math.floor(Math.random() * 60).toString(2).padStart(6, '0');
  const resolution = Math.floor(Math.random() * (MAX_RESOLUTION - 1));
  const S = Math.floor(Math.random() * (1 << (2 * resolution)));
  const Sbits = S.toString(2).padStart(2 * resolution, '0');
  const id = `${originSegment}${Sbits}10`.padEnd(64, '0');
  return BigInt(`0b${id}`).toString(16).padStart(16, '0');
}
// for (let i = 0; i < 100; i++) {
//   const id = randomId();
//   console.log(`"${id}",`);
// }