// A5
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) A5 contributors

import { toCartesian, toSpherical, Polar, Spherical, Cartesian } from './math';

export function projectGnomonic(input: Polar): Spherical {
  const [rho, gamma] = input;
  const x = rho * Math.cos(gamma);
  const y = rho * Math.sin(gamma);
  const z = 1;
  return toSpherical([x, y, z] as Cartesian);
}

export function unprojectGnomonic(spherical: Spherical): Polar {
  const [x, y, z] = toCartesian(spherical);
  const x2 = x / z;
  const y2 = y / z;
  const rho = Math.sqrt(x2 * x2 + y2 * y2);
  const gamma = Math.atan2(y2, x2);
  return [rho, gamma] as Polar;
} 