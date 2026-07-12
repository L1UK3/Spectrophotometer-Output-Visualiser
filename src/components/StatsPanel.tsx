import type { Graph } from '../types/Graph';

interface StatsPanelProps {
    graphs: Graph[];
    visibleGraphIds: Record<string, boolean>;
    focusedGraphId: string | null;
    graphColors: Record<string, string>;
    uploadedCount: number;
    onToggleVisibility: (id: string) => void;
    onDeleteGraph: (id: string) => void;
}

/**
 * Displays the statistics and controls for uploaded spectrophotometer readings.
 */
function StatsPanel({
    graphs,
    visibleGraphIds,
    focusedGraphId,
    graphColors,
    uploadedCount,
    onToggleVisibility,
    onDeleteGraph,
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
                Spectral Analysis <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({graphs.length} dataset{graphs.length > 1 ? 's' : ''})</span>
                {uploadedCount > 0 && (
                    <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                        {uploadedCount} file{uploadedCount > 1 ? 's' : ''} loaded
                    </div>
                )}
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
                            onClick={() => onToggleVisibility(graph.id)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = isFocused ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.15)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '70%' }}>

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

