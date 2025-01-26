// import { useState } from 'react'
import {
  Viewer,
  // CzmlDataSource,
  // PointPrimitiveCollection,
  PointPrimitive,
  PolylineCollection,
  Polyline,
  CesiumComponentRef,
  RootEventTarget,
  Clock,
} from "resium";
import {
  Cartesian3,
  Color,
  Viewer as CesiumViewer,
  PointPrimitive as CesiumPointPrimitive,
  Clock as CesiumClock,
  NearFarScalar,
  JulianDate,
  PointPrimitiveCollection,
  // GeoJsonDataSource,
} from "cesium";
import { APP_DATE_START, getSatelliteData, ISatellite } from "./loadData";
// import satData from "./sat-pos.json";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateOrbitPoints, getPositionAtTime } from "./orbitUtils";
import { compact, throttle } from "lodash";

// import czml from "./simple-czml.json";

const pointScaler = new NearFarScalar(1.5e6, 1, 4.2e7, 0.5);

function App() {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);

  const pointCollectionRef = useRef<PointPrimitiveCollection | null>(null);

  const satData = getSatelliteData(); // Static satellite data

  useEffect(() => {
    if (!viewerRef.current?.cesiumElement) {
      return;
    }

    const viewer = viewerRef.current.cesiumElement;

    // viewer.clock = new Clock({
    //   startTime: JulianDate.fromIso8601("2025-01-01T00:00:00Z"), // Simulation start time
    //   currentTime: JulianDate.fromIso8601("2025-01-01T00:00:00Z"), // Current time
    //   stopTime: JulianDate.fromIso8601("2025-01-02T00:00:00Z"), // Simulation stop time
    //   clockRange: Clock.ClockRange.LOOP_STOP, // Loop when reaching the stop time
    //   multiplier: 10, // Simulation time moves 10x faster than real time
    // });

    // Create and add PointPrimitiveCollection
    const pointCollection = new PointPrimitiveCollection();
    viewer.scene.primitives.add(pointCollection);
    pointCollectionRef.current = pointCollection;

    console.log("alkjasd");
    // Add initial points
    satData.forEach((sat) => {
      const position = getPositionAtTime(sat, APP_DATE_START);
      if (!position) {
        return null;
      }

      pointCollection.add({
        id: sat.OBJECT_ID,
        position: Cartesian3.fromElements(position.x, position.y, position.z),
        color: Color.YELLOW,
        pixelSize: 5,
        // scaleByDistance: pointScaler,
      });
    });

    return () => {
      viewer.scene.primitives.remove(pointCollection); // Clean up on unmount
    };
  }, [satData]);

  useEffect(() => {
    if (!viewerRef.current?.cesiumElement) {
      return;
    }

    const onClockTick = throttle((clock: CesiumClock) => {
      const currentTime = JulianDate.toDate(clock.currentTime);

      console.log("currentTime", currentTime);

      // Update positions dynamically
      if (pointCollectionRef.current) {
        const pointCollection = pointCollectionRef.current;

        // Clear and update the points
        for (let i = 0; i < satData.length; i++) {
          const sat = satData[i];
          const position = getPositionAtTime(sat, currentTime); // Calculate new position
          if (position) {
            const point = pointCollection.get(i);
            if (point) {
              point.position = Cartesian3.fromElements(
                position.x,
                position.y,
                position.z,
              );
            }
          }
        }
      }
    }, 3000);

    // Add a listener to Cesium's clock
    viewerRef.current.cesiumElement.clock.onTick.addEventListener(onClockTick);
    const clock = viewerRef.current.cesiumElement.clock;

    return () => {
      clock.onTick.removeEventListener(onClockTick);
    };
  }, [satData]);

  const endTime = useMemo(
    () => new Date(APP_DATE_START.getTime() + 24 * 60 * 60 * 1000),
    [APP_DATE_START],
  );

  return (
    <Viewer ref={viewerRef}>
      <Clock
        startTime={JulianDate.fromDate(APP_DATE_START)}
        currentTime={JulianDate.fromDate(APP_DATE_START)}
        stopTime={JulianDate.fromDate(endTime)}
      />
    </Viewer>
  );
}

export default App;
