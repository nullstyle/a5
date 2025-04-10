import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {PolygonLayer, PathLayer, ScatterplotLayer, TextLayer} from '@deck.gl/layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import { colorContinuous } from '@deck.gl/carto';
import { mat2, mat2d, vec2 } from 'gl-matrix';

import { YES, NO, Orientation } from 'a5/core/hilbert';
import { Anchor, sToAnchor } from 'a5/core/hilbert';
import { PENTAGON, TRIANGLE, BASIS } from 'a5/core/pentagon';

export type Triangle = {
  origin: vec2;
  anchor: Anchor;
  vertices: vec2[];
  center: vec2;
  index: number;
}

// Keep transforms that don't depend on BASIS at module level
const M_rotate180 = mat2.fromValues(-1, 0, 0, -1);
const M_reflectY = mat2.fromValues(1, 0, 0, -1);

const applyTransform = (vertices: vec2[], transform: mat2 | mat2d) => {
    const newVertices = vertices.map(v => vec2.create());
    if (transform.length === 6) {
      for (let i = 0; i < vertices.length; i++) {
        vec2.transformMat2d(newVertices[i], vertices[i], transform);
      }
    } else {
      for (let i = 0; i < vertices.length; i++) {
        vec2.transformMat2(newVertices[i], vertices[i], transform as mat2);
      }
    }
    return newVertices;
}

const App: React.FC = () => {
  const [resolution, setResolution] = useState(2);
  const [usePentagon, setUsePentagon] = useState(true);
  const [layerVisibility, setLayerVisibility] = useState({
    triangles: true,
    path: true,
    points: false,
    labels: false,
    anchors: false
  });
  const [orientation, setOrientation] = useState<Orientation>('uv');
  const [quaternaryColor, setQuaternaryColor] = useState(false);
  const [maxFilterValue, setMaxFilterValue] = useState(100);

  // Memoize points and BASIS
  const points = useMemo(() => 
    usePentagon ? PENTAGON.getVertices() : TRIANGLE.getVertices(), 
    [usePentagon]
  );

  // Memoize BASIS-dependent transforms
  const transforms = useMemo(() => {
    const M_translateRight = mat2d.fromTranslation(mat2d.create(), TRIANGLE.getVertices()[2]);
    const M_translateLeft = mat2d.invert(mat2d.create(), M_translateRight);
    return { M_translateLeft, M_translateRight };
  }, []);

  // Memoize the triangle generation function
  const generateTriangles = useCallback((resolution: number) => {
    const sequence = Array.from({length: Math.pow(4, resolution)}, (_, i) => i);
    const scale = Math.pow(2, -resolution);
    
    let anchors = sequence.map(s => sToAnchor(s, resolution, orientation)) as Anchor[];
    return anchors.map((anchor, i) => 
      createTriangle(anchor, scale, i, points, BASIS, transforms.M_translateLeft, transforms.M_translateRight)
    );
  }, [points, BASIS, transforms, orientation]);

  const generatePaths = useCallback((triangles: Triangle[]) => {
    return triangles.slice(0, -1).map((triangle, i) => ({
      path: [triangle.center, triangles[i + 1].center],
      index: triangle.index
    }));
  }, []);

  // Initialize state with memoized values
  const [triangles, setTriangles] = useState(() => generateTriangles(resolution));
  const [paths, setPaths] = useState(() => generatePaths(triangles));

  // Update geometry when resolution or pentagon mode changes
  useEffect(() => {
    const newTriangles = generateTriangles(resolution);
    setTriangles(newTriangles);
    setPaths(generatePaths(newTriangles));
  }, [resolution, generateTriangles, generatePaths]);

  // Resolution change handler
  const handleResolutionChange = useCallback((newResolution: number) => {
    setResolution(newResolution);
  }, []);

  const softBuffer = useMemo(() => paths.length / 100, [paths.length]);

  // Calculate actual filter range based on percentage
  const filterRange = useMemo(() => {
    const maxIndex = paths.length;
    const maxValue = Math.floor(maxIndex * (maxFilterValue / 100));
    return [0, maxValue] as [number, number];
  }, [paths.length, maxFilterValue]);

  // Move createTriangle outside component and pass in dependencies
  function createTriangle(
    anchor: Anchor, 
    scale: number, 
    index: number,
    points: vec2[],
    BASIS: mat2,
    M_translateLeft: mat2d,
    M_translateRight: mat2d
  ): Triangle {
    const origin = vec2.transformMat2(vec2.create(), anchor.offset, BASIS);
    let primitive = points;

    if (anchor.flips[0] === NO && anchor.flips[1] === YES) {
      primitive = applyTransform(primitive, M_rotate180);
    }

    const k = anchor.k;
    const F = anchor.flips[0] + anchor.flips[1];
    if (
        // Orient last two pentagons when both or neither flips are YES
        ((F === -2 || F === 2) && k > 1) ||
        // Orient first & last pentagons when only one of flips is YES
        (F === 0 && (k === 0 || k === 3))
    ) {
        primitive = applyTransform(primitive, M_reflectY);
    }

    if (anchor.flips[0] === YES && anchor.flips[1] === YES) {
        primitive = applyTransform(primitive, M_rotate180);
    } else if (anchor.flips[0] === YES) {
        primitive = applyTransform(primitive, M_translateLeft);
    } else if (anchor.flips[1] === YES) {
        primitive = applyTransform(primitive, M_translateRight);
    }
    
    // Calculate vertices
    const vertices = primitive.map(p => {
        const unscaled = vec2.add([0, 0], origin, p);
        vec2.scale(unscaled, unscaled, scale);
        return unscaled;
    });
    
    // Calculate center as average of vertices
    const center = vertices.reduce((sum, v) => vec2.add(sum, sum, v), [0, 0] as vec2);
    vec2.scale(center, center, 1/vertices.length);
    return { origin: vec2.scale(vec2.create(), origin, scale), anchor, vertices, center, index };
  }

  const INITIAL_VIEW_STATE = { latitude: 0, longitude: 0.4, zoom: 9 };

  // UI Components
  const Controls: React.FC<{
    resolution: number,
    onResolutionChange: (res: number) => void,
    layerVisibility: {triangles: boolean, path: boolean, points: boolean, labels: boolean, anchors: boolean},
    setLayerVisibility: (vis: {triangles: boolean, path: boolean, points: boolean, labels: boolean, anchors: boolean}) => void,
    usePentagon: boolean,
    setUsePentagon: (use: boolean) => void,
    orientation: Orientation,
    setOrientation: (o: Orientation) => void,
    quaternaryColor: boolean,
    setQuaternaryColor: (quaternaryColor: boolean) => void
  }> = ({
    resolution, 
    onResolutionChange, 
    layerVisibility, 
    setLayerVisibility, 
    usePentagon, 
    setUsePentagon,
    orientation,
    setOrientation,
    quaternaryColor,
    setQuaternaryColor
  }) => {
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1
      }}>
        <div style={{marginBottom: '10px'}}>
          <label>
            Orientation: {' '}
            <select 
              value={orientation}
              onChange={e => setOrientation(e.target.value as Orientation)}
              style={{marginLeft: '5px'}}
            >
              <option value="uv">uv</option>
              <option value="vu">vu</option>
              <option value="uw">uw</option>
              <option value="wu">wu</option>
              <option value="vw">vw</option>
              <option value="wv">wv</option>
            </select>
          </label>
        </div>

        <div style={{marginBottom: '10px'}}>
          <label>
            <input
              type="checkbox"
              checked={usePentagon}
              onChange={e => setUsePentagon(e.target.checked)}
            /> Use Pentagon
          </label>
        </div>
        
        <div style={{marginBottom: '10px'}}>
          <label>
            <input
              type="checkbox"
              checked={quaternaryColor}
              onChange={e => setQuaternaryColor(e.target.checked)}
            /> Quaternary Color
          </label>
        </div>

        <div style={{marginBottom: '10px', borderTop: '1px solid #ccc', paddingTop: '10px'}}>
          <label>
            Resolution: {resolution}
            <input 
              type="range" 
              min="1" 
              max="8" 
              value={resolution} 
              onChange={e => onResolutionChange(Number(e.target.value))}
              style={{marginLeft: '10px'}}
            />
          </label>
        </div>

        <div style={{
          display: 'flex', 
          flexDirection: 'column', 
          gap: '5px',
          borderTop: '1px solid #ccc',
          paddingTop: '10px'
        }}>
          <label>
            <input
              type="checkbox"
              checked={layerVisibility.triangles}
              onChange={e => setLayerVisibility({...layerVisibility, triangles: e.target.checked})}
            /> Show {usePentagon ? 'Pentagon' : 'Triangle'}s
          </label>
          <label>
            <input
              type="checkbox"
              checked={layerVisibility.path}
              onChange={e => setLayerVisibility({...layerVisibility, path: e.target.checked})}
            /> Show Path
          </label>
          <label>
            <input
              type="checkbox"
              checked={layerVisibility.points}
              onChange={e => setLayerVisibility({...layerVisibility, points: e.target.checked})}
            /> Show Points
          </label>
          <label>
            <input
              type="checkbox"
              checked={layerVisibility.labels}
              onChange={e => setLayerVisibility({...layerVisibility, labels: e.target.checked})}
            /> Show Labels
          </label>
          <label>
            <input
              type="checkbox"
              checked={layerVisibility.anchors}
              onChange={e => setLayerVisibility({...layerVisibility, anchors: e.target.checked})}
            /> Show Anchors
          </label>
        </div>
      </div>
    );
  };

  // New component for the filter slider
  const FilterSlider: React.FC<{
    value: number,
    onChange: (value: number) => void
  }> = ({ value, onChange }) => {
    return (
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1,
        width: '300px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '5px' }}>
          Show {value}% of Path
        </div>
        <input 
          type="range" 
          min="1" 
          max="100" 
          value={value} 
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    );
  };

  const createLayers = (
    filterRange: [number, number], 
    pathsLength: number,
    triangles: Triangle[],
    paths: any[],
    softBuffer: number
  ) => {
    // Common filter props shared between layers
    const filterProps = {
      extensions: [new DataFilterExtension({filterSize: 1})],
      getFilterValue: (d: any) => d.index,
      filterSoftRange: filterRange,
      filterRange: filterRange.map((x, i) => i === 0 ? x - softBuffer : x + softBuffer)
    };

    const lineProps = { lineWidthMinPixels: 1, stroked: true };

    const getSegmentColor = colorContinuous({
      attr: (p: any) => p.index,
      colors: 'Geyser',
      domain: Array.from({length: 10}).map((_, i) => i * pathsLength / 10),
    });
    const getQuaternaryColor = (d: Triangle) => {
      if (!quaternaryColor) {
        return [100, 100, 100, 200]; // Default gray color
      }
      
      const {k} = d.anchor;
      if (k === 0) {
        return [255, 99, 71, 200]; // Tomato red
      } else if (k === 1) {
        return [50, 205, 50, 200]; // Lime green  
      } else if (k === 2) {
        return [147, 112, 219, 200]; // Medium purple
      } else {
        return [255, 215, 0, 200]; // Gold
      }
    }

    return [
      new PolygonLayer<Triangle>({
        id: 'triangles',
        data: triangles,
        getPolygon: d => d.vertices,
        getFillColor: getQuaternaryColor,
        updateTriggers: { getFillColor: [quaternaryColor] },
        getLineColor: [135, 206, 235, 100],
        filled: true,
        visible: layerVisibility.triangles,
        ...lineProps,
        ...filterProps
      }),

      new PathLayer({
        id: 'path',
        data: paths,
        getPath: d => d.path,
        getColor: getSegmentColor,
        getWidth: 4,
        widthUnits: 'pixels',
        capRounded: true,
        visible: layerVisibility.path,
        ...filterProps
      }),

      new TextLayer<Triangle>({
        id: 'labels',
        data: triangles,
        getPosition: d => vec2.lerp(vec2.create(), d.origin, d.center, 0.2),
        getText: d => {
          const [i, j] = d.anchor.offset;
          return `[${i},${j}]`;
        },
        getSize: 16,
        getColor: [255, 255, 255, 255],
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        visible: layerVisibility.labels,
        ...filterProps
      }),

      new ScatterplotLayer<Triangle>({
        id: 'points',
        data: triangles,
        getPosition: d => d.center,
        getFillColor: getSegmentColor,
        getRadius: 8,
        radiusUnits: 'pixels',
        getLineColor: [255, 255, 255],
        visible: layerVisibility.points,
        ...lineProps,
        ...filterProps
      }),

      new ScatterplotLayer<Triangle>({
        id: 'anchors',
        data: triangles,
        getPosition: d => d.origin,
        getFillColor: [0, 0, 0],
        getLineColor: [255, 255, 255],
        getRadius: d => [1, 6, 9, 14, 18, 21, 26, 29].includes(d.index % 32) ? 10 : 5,
        radiusUnits: 'pixels',
        stroked: true,
        lineWidthMinPixels: 1,
        visible: layerVisibility.anchors,
        ...filterProps
      })
    ];
  };

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={createLayers(
          filterRange,
          paths.length,
          triangles,
          paths,
          softBuffer
        )}
      />
      <Controls 
        resolution={resolution}
        onResolutionChange={handleResolutionChange}
        layerVisibility={layerVisibility}
        setLayerVisibility={setLayerVisibility}
        usePentagon={usePentagon}
        setUsePentagon={setUsePentagon}
        orientation={orientation}
        setOrientation={setOrientation}
        quaternaryColor={quaternaryColor}
        setQuaternaryColor={setQuaternaryColor}
      />
      <FilterSlider 
        value={maxFilterValue}
        onChange={setMaxFilterValue}
      />
    </>
  );
};

export default App;

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  console.log('renderToDOM');
  root.render(<App />);
}