// tslint:disable:object-literal-sort-keys
// {h,s,l} and {r,g,b} shouldn’t be alphabetisized
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export function parseHex(hex: string): RGBColor {
  if (!hex.startsWith("#")) {
    throw new Error("Not a hex string");
  }
  if (hex.length !== 7) {
    throw new Error("Not a hex string");
  }
  const parts = hex
    .substr(1)
    .split(/(?<=^(?:.{2})+)/)
    .map(str => parseInt(str, 16));
  return {
    r: parts[0] / 255,
    g: parts[1] / 255,
    b: parts[2] / 255
  };
}

export function RGBtoHex(rgb: RGBColor): string {
  return `#${(Math.floor(rgb.r * 255) + 0x100).toString(16).substr(-2)}${(
    Math.floor(rgb.g * 255) + 0x100
  )
    .toString(16)
    .substr(-2)}${(Math.floor(rgb.b * 255) + 0x100).toString(16).substr(-2)}`;
}

function asrCurve(
  attack: number,
  sustain: number,
  release: number,
  t: number
): number {
  if (t <= 0) {
    return 0;
  }
  if (t <= attack) {
    return t / attack;
  }
  if (t < attack + sustain) {
    return 1;
  }
  if (t < attack + sustain + release) {
    return 1 - (t - sustain - attack) / release;
  }
  return 0;
}

function clerp(
  minV: number,
  maxV: number,
  minT: number,
  maxT: number,
  t: number
): number {
  t = Math.max(minT, Math.min(maxT, t));
  return ((t - minT) / (maxT - minT)) * (maxV - minV) + minV;
}

export function HSLtoRGB(hsl: HSLColor): RGBColor {
  const result: RGBColor = { r: 0, g: 0, b: 0 };
  result.r = Math.max(
    asrCurve(60, 120, 60, hsl.h + 120),
    asrCurve(60, 120, 60, hsl.h - 240)
  );
  (result.g = asrCurve(60, 120, 60, hsl.h + 0)),
    (result.b = asrCurve(60, 120, 60, hsl.h - 120)),
    (result.r = clerp(0.5, result.r, 0, 100, hsl.s));
  result.g = clerp(0.5, result.g, 0, 100, hsl.s);
  result.b = clerp(0.5, result.b, 0, 100, hsl.s);

  if (hsl.l > 50) {
    result.r = clerp(result.r, 1, 50, 100, hsl.l);
    result.g = clerp(result.g, 1, 50, 100, hsl.l);
    result.b = clerp(result.b, 1, 50, 100, hsl.l);
  } else {
    result.r = clerp(0, result.r, 0, 50, hsl.l);
    result.g = clerp(0, result.g, 0, 50, hsl.l);
    result.b = clerp(0, result.b, 0, 50, hsl.l);
  }
  return result;
}

export function RGBtoHSL(rgb: RGBColor): HSLColor {
  const min = Math.min(...Object.values(rgb));
  const max = Math.max(...Object.values(rgb));
  const l = ((min + max) / 2) * 100;
  if (max === min) {
    return {
      h: 0,
      s: 0,
      l
    };
  }

  const chroma = max - min;
  const s = (chroma / (1 - Math.abs((2 * l) / 100 - 1))) * 100;
  const maxIndex = Object.values(rgb).indexOf(max);
  switch (maxIndex) {
    case 0:
      return {
        h: (((rgb.g - rgb.b) / chroma + 0) * 60 + 360) % 360,
        s,
        l
      };
    case 1:
      return {
        h: (((rgb.b - rgb.r) / chroma + 2) * 60 + 360) % 360,
        s,
        l
      };
    case 2:
      return {
        h: (((rgb.r - rgb.g) / chroma + 4) * 60 + 360) % 360,
        s,
        l
      };
    default:
      throw new Error("Should not happen");
  }
}

export function generatePalette(hexBase: string): HSLColor[] {
  const hslBase = RGBtoHSL(parseHex(hexBase));
  return [
    ...new Array(3)
      .fill(0)
      .map((_, i) => i)
      .map(i =>
        Object.assign({}, hslBase, { l: hslBase.l * (1 + (i - 2) * 0.33) })
      ),
    Object.assign({}, hslBase, { l: 6 }),
    Object.assign({}, hslBase, { l: 94 })
  ];
}
