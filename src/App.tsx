// import { useState } from 'react'
import {
  Viewer,
  // CzmlDataSource,
  PointPrimitiveCollection,
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
  // GeoJsonDataSource,
} from "cesium";
import { APP_DATE_START, getSatelliteData, ISatellite } from "./loadData";
// import satData from "./sat-pos.json";
import { useCallback, useMemo, useRef, useState } from "react";
import { generateOrbitPoints, getPositionAtTime } from "./orbitUtils";
import { compact, throttle } from "lodash";

// import czml from "./simple-czml.json";

// const center = Cartesian3.fromDegrees(-75.59777, 40.03883);

const pointScaler = new NearFarScalar(1.5e6, 1, 4.2e7, 0.5);

function App() {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [pointTime, setPointTime] = useState(APP_DATE_START);

  const [selectedSat, setSelectedSat] = useState<ISatellite | null>(null);
  // const viewerRef = useRef<typeof Viewer>(null);

  // const [count, setCount] = useState(0)

  const satData = useMemo(() => {
    return getSatelliteData();
  }, []);

  const onClickViewer = (e: any, p: RootEventTarget) => {
    // console.log('1111 ;lasd', e, p)
    if (p.primitive && p.primitive instanceof CesiumPointPrimitive) {
      console.log("1222", p);
      const sat = satData.find((sat) => sat.OBJECT_ID === p.id);
      if (sat) {
        setSelectedSat(sat);
      }
      // console.log('222 ;lasd', p)
    }
  };

  const pointData = useMemo(() => {
    return compact(
      satData.map((sat) => {
        const position = getPositionAtTime(sat, pointTime);
        if (!position) {
          return null;
        }
        return {
          satId: sat.OBJECT_ID,
          x: position.x,
          y: position.y,
          z: position.z,
        };
      }),
    );
  }, [pointTime]);

  const pointViews = useMemo(() => {
    return pointData.map((point) => {
      return (
        <PointPrimitive
          color={Color.YELLOW}
          position={new Cartesian3(point.x, point.y, point.z)}
          pixelSize={5}
          id={point.satId}
          scaleByDistance={pointScaler}

          //  onClick={doSomething}
        />
      );
    });
  }, [pointData]);

  const handleClockTick = useMemo(
    () =>
      throttle((clock: CesiumClock) => {
        console.log("Throttled clock tick", clock.currentTime);
        setPointTime(JulianDate.toDate(clock.currentTime));
      }, 3000),
    [setPointTime],
  );

  const onClockTick = useCallback(
    (clock: CesiumClock) => {
      handleClockTick(clock);
    },
    [handleClockTick],
  );

  // const selectedSat = satData[100]
  const orbitPoints = selectedSat
    ? generateOrbitPoints(selectedSat, APP_DATE_START)
    : [];

  const polyline = (
    <PolylineCollection>
      <Polyline
        positions={orbitPoints.map(
          (point) => new Cartesian3(point.x, point.y, point.z),
        )} // Array of Cartesian3 positions
        width={2} // Line width in pixels
        // material={Color.CYAN} // Line color
      />
    </PolylineCollection>
  );

  const endTime = useMemo(
    () => new Date(APP_DATE_START.getTime() + 24 * 60 * 60 * 1000),
    [APP_DATE_START],
  );

  return (
    <Viewer ref={viewerRef} onClick={onClickViewer}>
      <PointPrimitiveCollection
      // modelMatrix={Transforms.eastNorthUpToFixedFrame(center)}
      >
        {pointViews}
      </PointPrimitiveCollection>
      {polyline}
      <Clock
        startTime={JulianDate.fromDate(APP_DATE_START)}
        currentTime={JulianDate.fromDate(APP_DATE_START)}
        stopTime={JulianDate.fromDate(endTime)}
        onTick={onClockTick}
      />
    </Viewer>
  );
}

export default App;
