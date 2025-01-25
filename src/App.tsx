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
} from "resium";
import {
  Cartesian3,
  Color,
  Viewer as CesiumViewer,
  PointPrimitive as CesiumPointPrimitive,
  // GeoJsonDataSource,
} from "cesium";
import { APP_DATE_START, getSatelliteData, ISatellite } from "./loadData";
// import satData from "./sat-pos.json";
import { useMemo, useRef, useState } from "react";
import { generateOrbitPoints, getPositionAtTime } from "./orbitUtils";
import { compact } from "lodash";

// import czml from "./simple-czml.json";

// const center = Cartesian3.fromDegrees(-75.59777, 40.03883);

function App() {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);

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
        const position = getPositionAtTime(sat, APP_DATE_START);
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
  }, [satData]);

  const pointViews = pointData.map((point) => {
    return (
      <PointPrimitive
        color={Color.YELLOW}
        position={new Cartesian3(point.x, point.y, point.z)}
        pixelSize={5}
        id={point.satId}
        //  onClick={doSomething}
      />
    );
  });

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

  return (
    <Viewer ref={viewerRef} onClick={onClickViewer}>
      <PointPrimitiveCollection
      // modelMatrix={Transforms.eastNorthUpToFixedFrame(center)}
      >
        {pointViews}
      </PointPrimitiveCollection>
      {polyline}
    </Viewer>
  );
}

export default App;
