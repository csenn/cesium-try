import { SatRec, twoline2satrec } from "satellite.js";
import satelliteData from "./data/satellites-api.json";
import { compact } from "lodash";

export interface ISatellite {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  EPOCH: string;
  COUNTRY_CODE: string;
  NORAD_CAT_ID: string;
  TLE_LINE1: string;
  TLE_LINE2: string;
  satrec: SatRec;
}

export const APP_DATE_START = new Date("2025-01-12T00:00:00Z");

// TODO: Could do some pre-computation here for satrec
export const getSatelliteData = (): ISatellite[] => {
  return compact(
    satelliteData.map((satellite) => {
      if (satellite.OBJECT_ID === "UNKNOWN") {
        return null;
      }
      return {
        satrec: twoline2satrec(satellite.TLE_LINE1, satellite.TLE_LINE2),
        ...satellite,
      };
    }),
  );
};
