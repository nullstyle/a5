import { describe, it, expect } from 'vitest';
import { Triangle } from 'a5/core/triangle';
import { vec2 } from 'gl-matrix';

describe('Triangle', () => {
  it('correctly identifies points inside triangle', () => {
    // Create a simple right triangle
    const triangle = new Triangle(
      [0, 0],   // Origin
      [1, 0],   // 1 unit right
      [0, 1]    // 1 unit up
    );

    // Test points that should be inside
    const INSIDE_POINTS: vec2[] = [
      [0.25, 0.25],  // Center-ish
      [0.1, 0.1],    // Near origin
      [0.9, 0.05],   // Near right edge
      [0.05, 0.9],   // Near top edge
    ];

    INSIDE_POINTS.forEach(point => {
      expect(triangle.containsPoint(point)).toBe(true);
    });

    // Test points that should be outside
    const OUTSIDE_POINTS: vec2[] = [
      [-0.1, -0.1],  // Below and left
      [1.1, 0],      // Right
      [0, 1.1],      // Above
      [1, 1],        // Above and right
      [0.6, 0.6],    // Outside hypotenuse
    ];

    OUTSIDE_POINTS.forEach(point => {
      expect(triangle.containsPoint(point)).toBe(false);
    });
  });

  it('handles degenerate triangles', () => {
    // Line segment
    const lineTriangle = new Triangle(
      [0, 0],
      [1, 0],
      [2, 0]
    );

    expect(lineTriangle.containsPoint([0.5, 0])).toBe(false);

    // Single point
    const pointTriangle = new Triangle(
      [1, 1],
      [1, 1],
      [1, 1]
    );

    expect(pointTriangle.containsPoint([1, 1])).toBe(false);
  });

  it('handles triangles of different sizes', () => {
    // Large triangle
    const largeTriangle = new Triangle(
      [0, 0],
      [100, 0],
      [50, 86.6] // Equilateral triangle
    );

    expect(largeTriangle.containsPoint([50, 43.3])).toBe(true);
    expect(largeTriangle.containsPoint([0, 100])).toBe(false);

    // Tiny triangle
    const tinyTriangle = new Triangle(
      [0, 0],
      [0.001, 0],
      [0, 0.001]
    );

    expect(tinyTriangle.containsPoint([0.0005, 0.0005])).toBe(true);
    expect(tinyTriangle.containsPoint([0.002, 0.002])).toBe(false);
  });

  it('handles triangles in different orientations', () => {
    // Create triangles rotated at different angles
    const angles = [45, 90, 135, 180];
    const radius = 1;

    angles.forEach(angle => {
      const radians = (angle * Math.PI) / 180;
      const triangle = new Triangle(
        [0, 0],
        [radius * Math.cos(radians), radius * Math.sin(radians)],
        [-radius * Math.sin(radians), radius * Math.cos(radians)]
      );

      // Test point that should be inside
      const insidePoint: vec2 = [
        0.2 * Math.cos(radians),
        0.2 * Math.sin(radians)
      ];
      expect(triangle.containsPoint(insidePoint)).toBe(true);

      // Test point that should be outside
      const outsidePoint: vec2 = [
        2 * Math.cos(radians),
        2 * Math.sin(radians)
      ];
      expect(triangle.containsPoint(outsidePoint)).toBe(false);
    });
  });
}); 