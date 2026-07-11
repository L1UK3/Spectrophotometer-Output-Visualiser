import type { Graph } from "../types/Graph";

/**
 * Reads a text file and extracts graph data from it.
 * Supports space, tab, and comma separations, and handles lines with 2 or more columns.
 * @param {File} file - The text file containing graph data.
 * @returns {Promise<Graph>} A promise that resolves to a Graph object containing the extracted data.
 */
export function getData(file: File): Promise<Graph> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split(/\r?\n/);
                const x: number[] = [];
                const y: number[] = [];

                for (let line of lines) {
                    line = line.trim();
                    if (!line) continue;
                    // Split by whitespace or commas, ignoring multiple separators
                    const parts = line.split(/[\s,]+/);
                    if (parts.length >= 2) {
                        const parsedX = parseFloat(parts[0]);
                        const parsedY = parseFloat(parts[parts.length - 1]);
                        if (!isNaN(parsedX) && !isNaN(parsedY)) {
                            x.push(parsedX);
                            y.push(parsedY);
                        }
                    }
                }

                if (x.length === 0) {
                    reject(new Error(`No valid numerical data points found in ${file.name}`));
                    return;
                }

                // Sort coordinates by wavelength (x) to ensure correct plotting
                const paired = x.map((xVal, index) => ({
                    x: xVal,
                    y: y[index],
                })).sort((a, b) => a.x - b.x);

                const graphObj: Graph = {
                    id: file.name,
                    coordinates: paired,
                };

                resolve(graphObj);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => {
            reject(new Error(`Failed to read file: ${file.name}`));
        };
        reader.readAsText(file);
    });
}

