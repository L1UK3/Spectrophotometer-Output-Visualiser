import { useState } from 'react';
import Header from './components/Header';
import UploadBox from './components/UploadBox';
import StatsPanel from './components/StatsPanel';
import GraphPanel from './components/GraphPanel';
import type { Graph } from './types/Graph';

const COLOR_PALETTE = [
    '#6366f1',
    '#06b6d4',
    '#10b981',
    '#ec4899',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
];

function App() {
    const [graphs, setGraphs] = useState<Graph[]>([]);
    const [visibleGraphIds, setVisibleGraphIds] = useState<Record<string, boolean>>({});
    const [focusedGraphId, setFocusedGraphId] = useState<string | null>(null);
    const [graphColors, setGraphColors] = useState<Record<string, string>>({});

    const handleUploadFiles = (files: File[]) => {
        import('./utils/getData').then(({ getData }) => {
            Promise.all(
                files.map((file) =>
                    getData(file).catch((err) => {
                        console.error(err);
                        alert(err instanceof Error ? err.message : 'Error reading file');
                        return null;
                    })
                )
            ).then((parsedGraphs) => {
                const validGraphs = parsedGraphs.filter((g): g is Graph => g !== null);
                if (validGraphs.length === 0) return;

                setGraphs((prev) => {
                    // Filter out existing duplicates (by filename / id) to overwrite them
                    const filteredPrev = prev.filter(
                        (p) => !validGraphs.some((n) => n.id === p.id)
                    );
                    const combined = [...filteredPrev, ...validGraphs];

                    // Assign stable colors to each graph in the list
                    const newColors: Record<string, string> = {};
                    combined.forEach((g, idx) => {
                        newColors[g.id] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
                    });
                    setGraphColors(newColors);

                    return combined;
                });

                setVisibleGraphIds((prev) => {
                    const next = { ...prev };
                    validGraphs.forEach((g) => {
                        next[g.id] = true;
                    });
                    return next;
                });
            });
        });
    };

    const handleToggleVisibility = (id: string) => {
        setVisibleGraphIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleDeleteGraph = (id: string) => {
        setGraphs((prev) => {
            const updated = prev.filter((g) => g.id !== id);

            // Re-assign colors to keep them tidy
            const newColors: Record<string, string> = {};
            updated.forEach((g, idx) => {
                newColors[g.id] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
            });
            setGraphColors(newColors);

            return updated;
        });

        setVisibleGraphIds((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        if (focusedGraphId === id) {
            setFocusedGraphId(null);
        }
    };

    return (
        <div className="container animate-fade-in">
            <Header />
            <div className="content">
                {/* Left Side: Graph Panel */}
                <GraphPanel
                    graphs={graphs}
                    visibleGraphIds={visibleGraphIds}
                    focusedGraphId={focusedGraphId}
                    graphColors={graphColors}
                    onToggleVisibility={handleToggleVisibility}
                />

                {/* Right Side: Sidebar Upload & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <UploadBox
                        onUploadFiles={handleUploadFiles}
                    />
                    <StatsPanel
                        graphs={graphs}
                        visibleGraphIds={visibleGraphIds}
                        focusedGraphId={focusedGraphId}
                        graphColors={graphColors}
                        onToggleVisibility={handleToggleVisibility}
                        onDeleteGraph={handleDeleteGraph}
                        uploadedCount={graphs.length}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;


