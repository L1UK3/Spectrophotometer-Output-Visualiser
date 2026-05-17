

// TODO: #3 Document script

const DROP_ZONE = document.getElementById('dropZone');
const FILE_INPUT = document.getElementById('fileInput');
const FILE_INFO = document.getElementById('fileInfo');
const GRAPH_ZONE = document.getElementById('graphContainer');



DROP_ZONE.addEventListener('dragover', (e) => {
    e.preventDefault();
    DROP_ZONE.classList.add('dragover');
});

DROP_ZONE.addEventListener('dragleave', () => {
    DROP_ZONE.classList.remove('dragover');
});

DROP_ZONE.addEventListener('drop', (e) => {
    e.preventDefault();
    DROP_ZONE.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

FILE_INPUT.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    getData();
    outputGraph();
});

// TODO: #2 Add error handling for file reading and parsing

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        FILE_INFO.innerHTML = `<p><strong>File:</strong> ${file.name}<br><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>`;
    }
};

function getData() {
    const file = FILE_INPUT.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const lines = content.split('\n');
            
            const x = [];
            const y = [];
            
            for (let i = lines.length - 1; i >= 0; i--) {
                const data = lines[i].trim().split(/\s+/);
                if (data.length === 2) {
                    FILE_INFO.innerHTML += `<p>${lines[i]}</p>`;
                    try {
                        x.push(parseFloat(data[0]));
                        y.push(parseFloat(data[1]));
                    } catch (error) {
                        break;
                    }
                }
            }

            FILE_INFO.dataset.x = JSON.stringify(x);
            FILE_INFO.dataset.y = JSON.stringify(y);
        };

        reader.readAsText(file);
    }
}

function outputGraph() {
    const xData = JSON.parse(FILE_INFO.dataset.x || '[]');
    const yData = JSON.parse(FILE_INFO.dataset.y || '[]');

    if (xData.length === 0 || yData.length === 0) {
        setTimeout(outputGraph, 100); // Wait for FileReader to finish if data isn't ready
        return;
    }

    const trace = {
        x: xData,
        y: yData,
        type: 'scatter',
        mode: 'lines',
        name: 'Spectrometer Reading'
    };

    const layout = {
        title: 'Spectrometer Data Visualization',
        xaxis: { title: 'Wavelength' },
        yaxis: { title: 'Intensity' },
        autosize: true
    };

    Plotly.newPlot(GRAPH_ZONE, [trace], layout);
    
}
