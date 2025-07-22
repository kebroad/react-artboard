import React, { useState } from "react";
import {
  useBrush,
  useMarker,
  useAirbrush,
  Artboard,
  ArtboardRef,
  useShadingBrush,
  useEraser,
  useWatercolor,
  usePencil,
  useCharcoal,
  useCalligraphy,
  useInkPen,
  useOilPaint,
  useAcrylic,
  useCrayon,
  useSmudge,
  ToolHandlers,
} from "../src/";

import {
  FaPencilAlt,
  FaPaintBrush,
  FaMarker,
  FaEraser,
  FaSprayCan,
  FaDownload,
  FaTrash,
  FaUndo,
  FaRedo,
  FaGithub,
  FaPen,
  FaFeather,
  FaPalette,
} from "react-icons/fa";
import { 
  GiCoalWagon,
  GiInkSwirl,
  GiPaintBrush,
  GiWaxSeal,
  GiFingerPrint,
} from "react-icons/gi";
import { HexColorPicker } from "react-colorful";
import { IoMdWater } from "react-icons/io";
import { useHistory } from "../src/history";
import "./style.css";
import "react-colorful/dist/index.css";
import "react-responsive-modal/styles.css";
import "react-rangeslider/lib/index.css";
import Slider from "react-rangeslider";
import { Modal } from "react-responsive-modal";
import type { IconType } from "react-icons/lib";

export function App(): JSX.Element {
  const [color, setColor] = useState("#531B93");
  const [strokeWidth, setStrokeWidth] = useState(40);
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [artboardRef, setArtboardRef] = useState<ArtboardRef | null>();

  // Initialize all brush types
  const pencil = usePencil({ color, strokeWidth: strokeWidth * 0.1 });
  const charcoal = useCharcoal({ color, strokeWidth: strokeWidth * 0.4 });
  const calligraphy = useCalligraphy({ color, strokeWidth: strokeWidth * 0.5 });
  const inkPen = useInkPen({ color, strokeWidth: strokeWidth * 0.15 });
  const oilPaint = useOilPaint({ color, strokeWidth: strokeWidth * 0.6 });
  const acrylic = useAcrylic({ color, strokeWidth: strokeWidth * 0.5 });
  const crayon = useCrayon({ color, strokeWidth: strokeWidth * 0.3 });
  const smudge = useSmudge({ strokeWidth });
  
  // Original brushes
  const brush = useBrush({ color, strokeWidth });
  const marker = useMarker({ color, strokeWidth });
  const watercolor = useWatercolor({ color, strokeWidth });
  const airbrush = useAirbrush({ color, strokeWidth });
  const eraser = useEraser({ strokeWidth });
  const shading = useShadingBrush({
    color,
    spreadFactor: (1 / 45) * strokeWidth,
    distanceThreshold: 100,
  });

  const tools: Array<[ToolHandlers, IconType]> = [
    // Traditional drawing tools
    [pencil, FaPencilAlt],
    [charcoal, GiCoalWagon],
    [crayon, GiWaxSeal],
    [shading, FaFeather],
    
    // Paint brushes
    [brush, FaPaintBrush],
    [oilPaint, GiPaintBrush],
    [acrylic, FaPalette],
    [watercolor, IoMdWater],
    
    // Pens and markers
    [inkPen, GiInkSwirl],
    [calligraphy, FaPen],
    [marker, FaMarker],
    [airbrush, FaSprayCan],
    
    // Special tools
    [smudge, GiFingerPrint],
    [eraser, FaEraser],
  ];

  const [currentTool, setCurrentTool] = useState(0);

  const { undo, redo, history, canUndo, canRedo } = useHistory();

  return (
    <div id="app">
      <div id="toolbar">
        <div id="tools" className="toolbarSection">
          {tools.map(([tool, Icon], i) => (
            <button
              key={tool.name}
              onClick={() => setCurrentTool(i)}
              className={currentTool === i ? "selected" : ""}
            >
              <Icon size={12} title={tool.name} />
            </button>
          ))}
        </div>
        <div id="options" className="toolbarSection">
          <label>
            Color:
            <button
              onClick={() => setColorOpen(true)}
              style={{ backgroundColor: color, color: "white" }}
            >
              &nbsp;&nbsp;&nbsp;
            </button>
            <Modal open={colorOpen} onClose={() => setColorOpen(false)}>
              <HexColorPicker color={color} onChange={setColor} />
            </Modal>
          </label>
          <label>
            Size:
            <button onClick={() => setSizeOpen(true)}>{strokeWidth}</button>
            <Modal open={sizeOpen} onClose={() => setSizeOpen(false)}>
              <div
                style={{
                  width: 150,
                  padding: "30px 20px 10px 20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Slider
                  min={5}
                  max={100}
                  value={strokeWidth}
                  onChange={setStrokeWidth}
                />
                <div
                  style={{
                    flex: 1,
                    minHeight: 150,
                    justifyContent: "center",
                    flexDirection: "column",
                    display: "flex",
                    placeItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: strokeWidth,
                      height: strokeWidth,
                      backgroundColor: color,
                      borderRadius: strokeWidth,
                    }}
                  ></div>
                </div>
              </div>
            </Modal>
          </label>
        </div>
        <div id="controls" className="toolbarSection">
          <button onClick={undo} disabled={!canUndo}>
            <FaUndo size={12} title="Undo" />
          </button>
          <button onClick={redo} disabled={!canRedo}>
            <FaRedo title="Redo" />
          </button>
          <button onClick={() => artboardRef?.download()}>
            <FaDownload title="Download" />
          </button>
          <button onClick={() => artboardRef?.clear()}>
            <FaTrash title="Clear" />
          </button>
        </div>
      </div>
      <div id="artboard">
        <Artboard
          tool={tools[currentTool][0]}
          ref={setArtboardRef}
          history={history}
          style={{ border: "1px gray solid" }}
        />
      </div>
      <div id="footer">
        <a href="https://github.com/kebroad/react-artboard" target="_blank" rel="noopener">
          <FaGithub title="Source Code" />
        </a>
        <span>Current Tool: {tools[currentTool][0].name}</span>
      </div>
    </div>
  );
}
