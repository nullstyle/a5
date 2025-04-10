// A5
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) A5 contributors

import { vec2, glMatrix } from "gl-matrix";
glMatrix.setMatrixArrayType(Float64Array as any);

/**
 * Triangle class for fast repeated point-in-triangle testing
 */
export class Triangle {
  private origin: vec2;
  private edge1: vec2;
  private edge2: vec2;
  private dot11: number;
  private dot12: number;
  private dot22: number;
  private testPoint: vec2;

  constructor(a: vec2, b: vec2, c: vec2) {
    // Change to coordinate space where `a` is at origin
    this.origin = vec2.clone(a);
    this.edge1 = vec2.subtract(vec2.create(), b, this.origin);
    this.edge2 = vec2.subtract(vec2.create(), c, this.origin);
    this.testPoint = vec2.create();

    // Pre-calculate constant dot products
    this.dot11 = vec2.dot(this.edge1, this.edge1);
    this.dot12 = vec2.dot(this.edge1, this.edge2);
    this.dot22 = vec2.dot(this.edge2, this.edge2);
    const invDenom = 1.0 / (this.dot11 * this.dot22 - this.dot12 * this.dot12);
    this.dot11 *= invDenom;
    this.dot12 *= invDenom;
    this.dot22 *= invDenom;
  }

  containsPoint(p: vec2) {
    // Move test point to same coordinate space as triangle
    vec2.subtract(this.testPoint, p, this.origin);

    // Project onto edges
    const dotp1 = vec2.dot(this.testPoint, this.edge1);
    const dotp2 = vec2.dot(this.testPoint, this.edge2);

    // Check if point is in triangle
    const u = this.dot22 * dotp1 - this.dot12 * dotp2;
    if (u < 0) return false;
    const v = this.dot11 * dotp2 - this.dot12 * dotp1;
    return (v >= 0) && (u + v <= 1);
  }
}