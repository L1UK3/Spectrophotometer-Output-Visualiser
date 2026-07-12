import type { Graph } from '../types/Graph';

interface StatsPanelProps {
    graphs: Graph[];
    visibleGraphIds: Record<string, boolean>;
    focusedGraphId: string | null;
    graphColors: Record<string, string>;
    onToggleVisibility: (id: string) => void;
    onDeleteGraph: (id: string) => void;
    onFocusGraph: (id: string | null) => void;
}

/**
 * Displays the statistics and controls for uploaded spectrophotometer readings.
 */
function StatsPanel({
    graphs,
    visibleGraphIds,
    focusedGraphId,
    graphColors,
    onToggleVisibility,
    onDeleteGraph,
    onFocusGraph,
}: StatsPanelProps) {

    if (graphs.length === 0) {
        return (
            <div className="section animate-fade-in" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No active datasets to analyze.</p>
            </div>
        );
    }

    return (
        <div className="section animate-fade-in">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
                Spectral Analysis
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {graphs.map((graph) => {
                    const isVisible = !!visibleGraphIds[graph.id];
                    const isFocused = focusedGraphId === graph.id;
                    const color = graphColors[graph.id] || '#ffffff';

                    return (
                        <div
                            key={graph.id}
                            style={{
                                borderLeft: `4px solid ${color}`,
                                background: isFocused ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.15)',
                                padding: '12px',
                                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                                borderTop: isFocused ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
                                borderRight: isFocused ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
                                borderBottom: isFocused ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                            }}
                            onClick={() => onFocusGraph(isFocused ? null : graph.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '70%' }}>
                                    <input
                                        type="checkbox"
                                        checked={isVisible}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onToggleVisibility(graph.id);
                                        }}
                                        style={{ cursor: 'pointer', accentColor: color }}
                                    />
                                    <span
                                        title={graph.id}
                                        style={{
                                            fontWeight: '600',
                                            fontSize: '0.875rem',
                                            color: isVisible ? 'var(--text-primary)' : 'var(--text-muted)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {graph.id}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteGraph(graph.id);
                                    }}
                                    className="custom-btn danger"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                >
                                    Remove
                                </button>
                            </div>

                        </div>

                    );
                })}
            </div>
        </div>
    );
}

export default StatsPanel;

