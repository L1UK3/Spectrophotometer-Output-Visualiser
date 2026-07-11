import React, { useRef, useState, useMemo } from 'react';
import type { Graph } from '../types/Graph';

interface GraphPanelProps {
    graphs: Graph[];
    visibleGraphIds: Record<string, boolean>;
    focusedGraphId: string | null;
    graphColors: Record<string, string>;
}

// Binary search to find nearest data point
const findNearestPoint = (coords: Array<{x: number; y: number}>, targetX: number) => {
    if (coords.length === 0) return null;
    let low = 0;
    let high = coords.length - 1;
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (coords[mid].x < targetX) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    if (low > 0 && Math.abs(coords[low - 1].x - targetX) < Math.abs(coords[low].x - targetX)) {
        return coords[low - 1];
    }
    return coords[low];
};

function GraphPanel({ graphs, visibleGraphIds, focusedGraphId, graphColors }: GraphPanelProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Crosshair hover state
    const [hoverPoint, setHoverPoint] = useState<{
        xVal: number;
        clientX: number;
        clientY: number;
    } | null>(null);

    const activeGraphs = useMemo(() => {
        return graphs.filter(g => !!visibleGraphIds[g.id]);
    }, [graphs, visibleGraphIds]);

    // Calculate bounds based on active datasets (linear auto-fit)
    const bounds = useMemo(() => {
        if (activeGraphs.length === 0) {
            return { xMin: 200, xMax: 1000, yMin: 0, yMax: 1 };
        }

        let xMin = Infinity;
        let xMax = -Infinity;
        let yMin = Infinity;
        let yMax = -Infinity;

        activeGraphs.forEach((g) => {
            g.coordinates.forEach((c) => {
                if (c.x < xMin) xMin = c.x;
                if (c.x > xMax) xMax = c.x;
                if (c.y < yMin) yMin = c.y;
                if (c.y > yMax) yMax = c.y;
            });
        });

        // Add 5% padding to Y
        const yRange = yMax - yMin;
        const padY = yRange > 0 ? yRange * 0.05 : 0.1;

        return {
            xMin: xMin === Infinity ? 200 : xMin,
            xMax: xMax === -Infinity ? 1000 : xMax,
            yMin: yMin - padY,
            yMax: yMax + padY,
        };
    }, [activeGraphs]);

    const { xMin, xMax, yMin, yMax } = bounds;

    // SVG Layout Dimensions
    const svgWidth = 800;
    const svgHeight = 450;
    const marginLeft = 65;
    const marginRight = 30;
    const marginTop = 30;
    const marginBottom = 50;

    const plotWidth = svgWidth - marginLeft - marginRight;
    const plotHeight = svgHeight - marginTop - marginBottom;

    // Coordinate Mappings (Data -> SVG Pixel)
    const getScreenX = (x: number) => {
        return marginLeft + ((x - xMin) / (xMax - xMin)) * plotWidth;
    };

    const getScreenY = (y: number) => {
        return svgHeight - marginBottom - ((y - yMin) / (yMax - yMin)) * plotHeight;
    };

    // Coordinate Mappings (SVG Pixel -> Data)
    const getDataX = (screenX: number) => {
        return xMin + ((screenX - marginLeft) / plotWidth) * (xMax - xMin);
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * svgWidth;
        const y = ((e.clientY - rect.top) / rect.height) * svgHeight;

        if (
            x >= marginLeft &&
            x <= svgWidth - marginRight &&
            y >= marginTop &&
            y <= svgHeight - marginBottom
        ) {
            const xVal = getDataX(x);
            const parentRect = svgRef.current.parentElement?.getBoundingClientRect();
            setHoverPoint({
                xVal,
                clientX: e.clientX - (parentRect?.left || 0),
                clientY: e.clientY - (parentRect?.top || 0),
            });
        } else {
            setHoverPoint(null);
        }
    };

    // Tick Calculation helpers
    const xTicks = useMemo(() => {
        const ticks = [];
        const step = (xMax - xMin) / 6;
        for (let i = 0; i <= 6; i++) {
            ticks.push(xMin + i * step);
        }
        return ticks;
    }, [xMin, xMax]);

    const yTicks = useMemo(() => {
        const ticks = [];
        const step = (yMax - yMin) / 5;
        for (let i = 0; i <= 5; i++) {
            ticks.push(yMin + i * step);
        }
        return ticks;
    }, [yMin, yMax]);

    // Nearest details for hover tooltip
    const hoverDetails = useMemo(() => {
        if (!hoverPoint || activeGraphs.length === 0) return null;

        const details = activeGraphs.map((g) => {
            const near = findNearestPoint(g.coordinates, hoverPoint.xVal);
            if (!near) return null;
            return {
                id: g.id,
                color: graphColors[g.id],
                x: near.x,
                y: near.y,
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        if (details.length === 0) return null;

        return {
            xVal: details[0].x,
            clientX: hoverPoint.clientX,
            clientY: hoverPoint.clientY,
            points: details,
        };
    }, [hoverPoint, activeGraphs, graphColors]);

    return (
        <div className="section animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Header controls toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>Graph Output</h3>
            </div>

            {/* SVG Graph Drawing Container */}
            <div id="graphContainer">
                {activeGraphs.length > 0 ? (
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        width="100%"
                        height="100%"
                        style={{ display: 'block', userSelect: 'none' }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoverPoint(null)}
                    >
                        {/* Define clip paths for plotting elements inside graph margins */}
                        <defs>
                            <clipPath id="plot-area-clip">
                                <rect x={marginLeft} y={marginTop} width={plotWidth} height={plotHeight} />
                            </clipPath>
                        </defs>

                        {/* Graph Plotting Area Background Gridlines */}
                        {/* Vertical Gridlines */}
                        {xTicks.map((tick, idx) => {
                            const x = getScreenX(tick);
                            return (
                                <g key={`v-grid-${idx}`}>
                                    <line
                                        x1={x}
                                        y1={marginTop}
                                        x2={x}
                                        y2={svgHeight - marginBottom}
                                        stroke="var(--grid-line)"
                                        strokeWidth="1"
                                    />
                                    {/* X-Axis labels */}
                                    <text
                                        x={x}
                                        y={svgHeight - marginBottom + 20}
                                        fill="var(--text-secondary)"
                                        fontSize="11"
                                        textAnchor="middle"
                                        className="mono"
                                    >
                                        {tick.toFixed(0)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Horizontal Gridlines */}
                        {yTicks.map((tick, idx) => {
                            const y = getScreenY(tick);
                            return (
                                <g key={`h-grid-${idx}`}>
                                    <line
                                        x1={marginLeft}
                                        y1={y}
                                        x2={svgWidth - marginRight}
                                        y2={y}
                                        stroke="var(--grid-line)"
                                        strokeWidth="1"
                                    />
                                    {/* Y-Axis labels */}
                                    <text
                                        x={marginLeft - 8}
                                        y={y + 4}
                                        fill="var(--text-secondary)"
                                        fontSize="11"
                                        textAnchor="end"
                                        className="mono"
                                    >
                                        {tick.toFixed(3)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Plotting Area Border Box */}
                        <rect
                            x={marginLeft}
                            y={marginTop}
                            width={plotWidth}
                            height={plotHeight}
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="1"
                        />

                        {/* Draw curves */}
                        {activeGraphs.map((g) => {
                            const color = graphColors[g.id] || '#ffffff';
                            const pathData = g.coordinates.reduce((acc, coord, idx) => {
                                const xPos = getScreenX(coord.x);
                                const yPos = getScreenY(coord.y);
                                return acc + `${idx === 0 ? 'M' : 'L'} ${xPos} ${yPos} `;
                            }, '');

                            const isFocused = focusedGraphId === g.id;

                            return (
                                <g key={g.id} clipPath="url(#plot-area-clip)">
                                    {/* Glowing blur path under focused line */}
                                    <path
                                        d={pathData}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth={isFocused ? 6 : 3}
                                        strokeOpacity={isFocused ? 0.15 : 0.05}
                                        style={{ transition: 'stroke-width 0.2s ease' }}
                                    />
                                    {/* Core curve path */}
                                    <path
                                        d={pathData}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth={isFocused ? 2.5 : 1.5}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ transition: 'stroke-width 0.2s ease' }}
                                    />
                                </g>
                            );
                        })}

                        {/* Vertical Crosshair Line */}
                        {hoverDetails && (
                            <g>
                                <line
                                    x1={getScreenX(hoverDetails.xVal)}
                                    y1={marginTop}
                                    x2={getScreenX(hoverDetails.xVal)}
                                    y2={svgHeight - marginBottom}
                                    stroke="rgba(255, 255, 255, 0.25)"
                                    strokeWidth="1"
                                    strokeDasharray="3 3"
                                />
                                {/* Focus circles at matched Y on each graph line */}
                                {hoverDetails.points.map((pt) => {
                                    const cx = getScreenX(pt.x);
                                    const cy = getScreenY(pt.y);
                                    return (
                                        <g key={`hover-pt-${pt.id}`} clipPath="url(#plot-area-clip)">
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r="6"
                                                fill={pt.color}
                                                opacity="0.3"
                                            />
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r="3"
                                                fill="#ffffff"
                                                stroke={pt.color}
                                                strokeWidth="1.5"
                                            />
                                        </g>
                                    );
                                })}
                            </g>
                        )}

                        {/* X-Axis and Y-Axis Labels */}
                        <text
                            x={marginLeft + plotWidth / 2}
                            y={svgHeight - 12}
                            fill="var(--text-primary)"
                            fontSize="13"
                            fontWeight="500"
                            textAnchor="middle"
                        >
                            Wavelength (nm)
                        </text>

                        <text
                            x={15}
                            y={marginTop + plotHeight / 2}
                            fill="var(--text-primary)"
                            fontSize="13"
                            fontWeight="500"
                            textAnchor="middle"
                            transform={`rotate(-90, 15, ${marginTop + plotHeight / 2})`}
                        >
                            Absorbance / Intensity
                        </text>
                    </svg>
                ) : (
                    <div style={{ height: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '1rem', fontWeight: '500' }}>No active readings loaded</p>
                        <p style={{ fontSize: '0.8125rem', marginTop: '6px' }}>Upload `.txt` files on the left panel to begin plotting.</p>
                    </div>
                )}

                {/* Floating Interactive Hover Tooltip details */}
                {hoverDetails && (
                    <div
                        className="glass-panel"
                        style={{
                            position: 'absolute',
                            left: `${hoverDetails.clientX + 15}px`,
                            top: `${hoverDetails.clientY + 15}px`,
                            padding: '12px 14px',
                            pointerEvents: 'none',
                            fontSize: '0.8125rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            background: 'rgba(10, 15, 30, 0.9)',
                            zIndex: 10,
                            borderRadius: '8px',
                            minWidth: '180px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <div style={{ fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', color: 'var(--text-primary)' }}>
                            Wavelength: <span className="mono">{hoverDetails.xVal.toFixed(1)} nm</span>
                        </div>
                        {hoverDetails.points.map((pt) => (
                            <div key={`tooltip-row-${pt.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', maxWidth: '120px' }}>
                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: pt.color }}></span>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }} title={pt.id}>
                                        {pt.id}
                                    </span>
                                </div>
                                <span className="mono" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                    {pt.y.toFixed(4)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default GraphPanel;
