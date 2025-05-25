import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { projectDodecahedron, unprojectDodecahedron } from '../modules/core/dodecahedron.ts';
import { origins } from '../modules/core/origin.ts';
import type { Polar } from '../modules/core/coordinate-systems.ts';
import TEST_COORDS from './test-polar-coordinates.json' with { type: 'json' };

describe('Dodecahedron projection round trip', () => {
  it('round trip test', () => {
    origins.forEach((origin) => {
      TEST_COORDS.forEach(({rho, beta}, i) => {
        const polar = [rho, beta] as Polar;
        const spherical = projectDodecahedron(polar, origin.quat, origin.angle);
        const result = unprojectDodecahedron(spherical, origin.quat, origin.angle);
        expect(result[0]).toBeCloseTo(polar[0]);
        expect(result[1]).toBeCloseTo(polar[1]);
      });
    });
  }); 
});