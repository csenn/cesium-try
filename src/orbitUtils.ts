import { propagate, SatRec, twoline2satrec } from "satellite.js";
import { ISatellite } from "./loadData";

interface IVector3 {
  x: number;
  y: number;
  z: number;
}

export const getSatRecPosition = (
  satrec: SatRec,
  atTime: Date,
): IVector3 | null => {
  const posAndVel = propagate(satrec, atTime);
  if (!posAndVel) {
    return null;
  }

  const { position, velocity } = posAndVel;

  if (typeof position !== "object" || typeof velocity !== "object") {
    return null;
  }

  return {
    x: position.x * 1000,
    y: position.y * 1000,
    z: position.z * 1000,
  };
};

export function getPositionAtTime(
  satellite: ISatellite,
  time: Date,
): IVector3 | null {
  const satrec = twoline2satrec(satellite.TLE_LINE1, satellite.TLE_LINE2);
  return getSatRecPosition(satrec, time);
}

export function generateOrbitPoints(
  satellite: ISatellite,
  specificTime: Date,
): IVector3[] {
  const points: IVector3[] = [];

  // Convert rad/min to rev/day
  const meanMotion = (satellite.satrec.no * 1440) / (2 * Math.PI);
  const orbitalPeriod = 86400 / meanMotion; // seconds

  // Divide the orbit into chunks
  const intervalCount = 500;
  const timeStep = orbitalPeriod / intervalCount; // seconds

  // Generate points for each time step
  for (let i = 0; i <= intervalCount; i++) {
    const time = new Date(specificTime.getTime() + i * timeStep * 1000);
    const position = getSatRecPosition(satellite.satrec, time);
    if (position) {
      points.push(position);
    }
  }

  return points;
}
