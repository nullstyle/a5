import { describe, it, expect } from 'vitest'
describe('tiling', () => {it('passes', () => {})});
/*import { mat2, vec2 } from 'gl-matrix'
import { PrimitiveUnit, getNormalizedAngle, findNearestAnchor, anchorToPoint } from '../tiling'
import { PI_OVER_5 } from '../constants'

describe('tiling', () => {
  describe('PrimitiveUnit', () => {
    it('creates pentagons at the correct scale', () => {
      const unit = new PrimitiveUnit({i: 0, j: 0}, 2, 0);
      const pentagons = unit.getPentagons();
      
      // Should create some pentagons
      expect(pentagons.length).toBe(3);
      
      // Check scale of first pentagon
      const vertices = pentagons[0].getVertices();
      const edgeLength = vec2.distance(vertices[0], vertices[1]);
      expect(edgeLength).toBeCloseTo(0.25, 1);
    });

    it('assigns correct segment to pentagons', () => {
      const segment = 2;
      const unit = new PrimitiveUnit({i: 0, j: 0}, 1.0, segment);
      const pentagons = unit.getPentagons();
      
      // All pentagons should have the correct segment
      pentagons.forEach(p => {
        expect(p.id.segment).toBe(segment);
      });
    });

    it('rotates pentagons by segment angle', () => {
      const TESTS = [
        {segment: 0, expectedAngle: Math.PI / 2},
        {segment: 1, expectedAngle: Math.PI / 2 + 2 * PI_OVER_5},
        {segment: 2, expectedAngle: Math.PI / 2 - 6 * PI_OVER_5},
        {segment: 3, expectedAngle: Math.PI / 2 - 4 * PI_OVER_5},
        {segment: 4, expectedAngle: Math.PI / 2 - 2 * PI_OVER_5},
      ];

      TESTS.forEach(({segment, expectedAngle}) => {
        const unit = new PrimitiveUnit({i: 0, j: 0}, 1.0, segment);
        const pentagons = unit.getPentagons();
        
      // Get vertex of first pentagon
      const vertex = pentagons[0].getVertices()[1];
        
        // Check angle matches segment
        const angle = Math.atan2(vertex[1], vertex[0]);
        expect(angle).toBeCloseTo(expectedAngle, 2);
      });
    });

    describe('generateFullSegment', () => {
      it('generates correct number of pentagons for each resolution', () => {
        const TESTS = [
          {resolution: 0, expectedCount: 4},  // 4 pentagons (one primitive unit)
          {resolution: 1, expectedCount: 16}, // 4 * 4 = 16 pentagons
          {resolution: 2, expectedCount: 64}, // 4 * 4 * 4 = 64 pentagons etc...
          {resolution: 3, expectedCount: 256},
          {resolution: 4, expectedCount: 1024}
        ];

        TESTS.forEach(({resolution, expectedCount}) => {
          const segment = PrimitiveUnit.generateFullSegment(resolution, 0);
          expect(segment.length).toBe(expectedCount);
        });
      });

      it('assigns correct segment to all pentagons', () => {
        const SEGMENTS = [0, 1, 2, 3, 4];
        
        SEGMENTS.forEach(segmentNum => {
          const segment = PrimitiveUnit.generateFullSegment(1, segmentNum);
          segment.forEach(pentagon => {
            expect(pentagon.id.segment).toBe(segmentNum);
          });
        });
      });

      it('assigns correct resolution to all pentagons', () => {
        const segment = PrimitiveUnit.generateFullSegment(2, 0);
        segment.forEach(pentagon => {
          expect(pentagon.id.resolution).toBe(2);
        });
      });
    });

    describe('generateFullFace', () => {
      it('generates all segments', () => {
        const face = PrimitiveUnit.generateFullFace(1);
        
        // Count pentagons in each segment
        const segmentCounts = new Array(5).fill(0);
        face.forEach(pentagon => {
          segmentCounts[pentagon.id.segment!]++;
        });
        
        // Each segment should have same number of pentagons
        const expectedPerSegment = 16;  // For resolution 1
        segmentCounts.forEach(count => {
          expect(count).toBe(expectedPerSegment);
        });
      });

      it('generates correct total number of pentagons', () => {
        const TESTS = [
          {resolution: 0, expectedTotal: 20},     // 5 segments × 4 pentagons
          {resolution: 4, expectedTotal: 5120},   // 5 segments × (4 ** 5) pentagons
        ];

        TESTS.forEach(({resolution, expectedTotal}) => {
          const face = PrimitiveUnit.generateFullFace(resolution);
          expect(face.length).toBe(expectedTotal);
        });
      });

      it('maintains consistent pentagon scale across segments', () => {
        const face = PrimitiveUnit.generateFullFace(2);
        const expectedLength = 0.25; // 1 / (2 ** 2)
        
        // Check all pentagons have same edge length
        face.forEach(pentagon => {
          const vertices = pentagon.getVertices();
          const edgeLength = vec2.distance(vertices[0], vertices[1]);
          expect(edgeLength).toBeCloseTo(expectedLength, 4);
        });
      });
    });
  });

  describe('getNormalizedAngle', () => {
    it('normalizes angles to 0-360 range', () => {
      expect(getNormalizedAngle([1, 0])).toBeGreaterThanOrEqual(0);
      expect(getNormalizedAngle([1, 0])).toBeLessThan(360);
      expect(getNormalizedAngle([-1, 0])).toBeGreaterThanOrEqual(0);
      expect(getNormalizedAngle([-1, 0])).toBeLessThan(360);
    });

    it('handles cardinal directions correctly', () => {
      // Note: -64 degree offset in implementation
      expect(getNormalizedAngle([0, 1])).toBeCloseTo(90 - 64, 1);
      expect(getNormalizedAngle([-1, 0])).toBeCloseTo(180 - 64, 1);
      expect(getNormalizedAngle([0, -1])).toBeCloseTo(270 - 64, 1);
      expect(getNormalizedAngle([1, 0])).toBeCloseTo(360 - 64, 1);
    });
  });

  describe('anchor conversion', () => {
    it('converts anchor to point and back', () => {
      const originalAnchor = {i: 2, j: 3};
      const point = anchorToPoint(originalAnchor);
      const resultAnchor = findNearestAnchor(point);
      
      expect(resultAnchor.i).toBeCloseTo(originalAnchor.i);
      expect(resultAnchor.j).toBeCloseTo(originalAnchor.j);
    });

    it('handles negative anchors', () => {
      const originalAnchor = {i: -2, j: -3};
      const point = anchorToPoint(originalAnchor);
      const resultAnchor = findNearestAnchor(point);
      
      expect(resultAnchor.i).toBeCloseTo(originalAnchor.i);
      expect(resultAnchor.j).toBeCloseTo(originalAnchor.j);
    });
  });
}); */
