/**
 * Represents a graph with an ID and a set of coordinates.
 * @param {string} id - The unique identifier for the graph.
 * @param {Array<{ x: number; y: number }>} coordinates - An array of coordinate objects, each containing x and y values.
 */
export interface Graph {
    id: string;
    coordinates: Array<{
        x: number;
        y: number;
    }>;
}

/**
 * Represents a collection of graph data.
 * @param {Array<Graph>} data - An array of Graph objects.
 */
export interface GraphData {
    data: Graph[];
}
