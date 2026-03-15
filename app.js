const uploadInput = document.getElementById("upload-btn");
const temp_btn = document.querySelector("#temp_btn");
const rain_btn = document.querySelector("#rain_btn");
const hum_btn = document.querySelector("#humidity");
const wind_btn = document.querySelector("#wind_btn");
const data_btn = document.querySelector("#data_show");
const compare_btn = document.querySelector("#compare_btn"); // new button
let tableData = null;

const visualSection = document.querySelector(".visual");
const total = document.querySelector(".total");
const globesection = document.querySelector(".globe_section");
const dataSection = document.querySelector(".data_box");

const heatmapDiv = document.getElementById("heatmap");
const graphDiv = document.getElementById("graph");
const globeDiv = document.getElementById("globe");

let currentHeatmapFig = null;
let currentGraphFig = null;
let currentGlobeFig = null;

// ------------------- SHOW/HIDE FUNCTIONS -------------------
function showGraphs() {
    total.style.display = "flex";
    globesection.style.display = "block";
    dataSection.style.display = "none";
    heatmapDiv.style.display = "block";
    graphDiv.style.display = "block";
    window.dispatchEvent(new Event("resize"));
}

function showTable() {
    total.style.display = "none";
    globesection.style.display = "none";
    dataSection.style.display = "block";
    heatmapDiv.style.display = "none";
    graphDiv.style.display = "none";
}

// ------------------- UPLOAD -------------------
uploadInput.addEventListener("change", async (event) => {

    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        // store current figures
        currentHeatmapFig = JSON.parse(data.heatmap);
        currentGraphFig = JSON.parse(data.graph);
        currentGlobeFig = JSON.parse(data.globe);

        // show normal visuals
        showGraphs();

        Plotly.react("heatmap", currentHeatmapFig.data, currentHeatmapFig.layout, {responsive: true});
        Plotly.react("graph", currentGraphFig.data, currentGraphFig.layout, {responsive: true});
        Plotly.react("globe", currentGlobeFig.data, currentGlobeFig.layout, {responsive: true});

        window.dispatchEvent(new Event("resize"));

        // table data
        tableData = data.table;

        if (!tableData) {
            data_btn.disabled = true;
            compare_btn.disabled = true;
        } else {
            data_btn.disabled = false;
            compare_btn.disabled = false;
        }

        const vars = data.variables;
        updateButtons(vars);

    } catch (err) {
        console.error("Upload failed:", err);
        alert("Upload failed. Make sure your backend is running and CORS is allowed.");
    }

});

// ------------------- UPDATE VARIABLE BUTTONS -------------------
function updateButtons(vars) {

    const tempNames = ["t2m", "temp","temperature","t2m"];
    const rainNames = ["precip","precipitation","rain"];
    const humNames = ["humidity","rhum"];
    const windNames = ["wind","u","v"];

    const hasTemp = vars.some(v => tempNames.includes(v.toLowerCase()));
    const hasRain = vars.some(v => rainNames.includes(v.toLowerCase()));
    const hasHum = vars.some(v => humNames.includes(v.toLowerCase()));
    const hasWind = vars.some(v => windNames.includes(v.toLowerCase()));

    temp_btn.disabled = !hasTemp;
    rain_btn.disabled = !hasRain;
    hum_btn.disabled = !hasHum;
    wind_btn.disabled = !hasWind;

}

// ------------------- DATA TABLE -------------------
data_btn.addEventListener("click", () => {

    if (!tableData) return;

    const container = document.getElementById("data_table_container");

    let html = `
        <table class="data-table">
        <tr>
            <th>Year</th>
            <th>Value</th>
        </tr>
    `;

    for (let i = 0; i < tableData.year.length; i++) {
        html += `
            <tr>
                <td>${tableData.year[i]}</td>
                <td>${tableData.value[i].toFixed(2)}</td>
            </tr>
        `;
    }

    html += "</table>";

    container.innerHTML = html;

    showTable();
});

// ------------------- VARIABLE BUTTONS -------------------
temp_btn.addEventListener("click", () => {
    showGraphs();
    if(currentHeatmapFig && currentGraphFig && currentGlobeFig){
        Plotly.react("heatmap", currentHeatmapFig.data, currentHeatmapFig.layout, {responsive:true});
        Plotly.react("graph", currentGraphFig.data, currentGraphFig.layout, {responsive:true});
        Plotly.react("globe", currentGlobeFig.data, currentGlobeFig.layout, {responsive:true});
    }
});
rain_btn.addEventListener("click", () => {
    showGraphs();
    if(currentHeatmapFig && currentGraphFig && currentGlobeFig){
        Plotly.react("heatmap", currentHeatmapFig.data, currentHeatmapFig.layout, {responsive:true});
        Plotly.react("graph", currentGraphFig.data, currentGraphFig.layout, {responsive:true});
        Plotly.react("globe", currentGlobeFig.data, currentGlobeFig.layout, {responsive:true});
    }
});
hum_btn.addEventListener("click", () => {
    showGraphs();
    if(currentHeatmapFig && currentGraphFig && currentGlobeFig){
        Plotly.react("heatmap", currentHeatmapFig.data, currentHeatmapFig.layout, {responsive:true});
        Plotly.react("graph", currentGraphFig.data, currentGraphFig.layout, {responsive:true});
        Plotly.react("globe", currentGlobeFig.data, currentGlobeFig.layout, {responsive:true});
    }
});
wind_btn.addEventListener("click", () => {
    showGraphs();
    if(currentHeatmapFig && currentGraphFig && currentGlobeFig){
        Plotly.react("heatmap", currentHeatmapFig.data, currentHeatmapFig.layout, {responsive:true});
        Plotly.react("graph", currentGraphFig.data, currentGraphFig.layout, {responsive:true});
        Plotly.react("globe", currentGlobeFig.data, currentGlobeFig.layout, {responsive:true});
    }
});

// ------------------- COMPARISON -------------------
compare_btn.addEventListener("click", () => {

    if (!tableData) {
        alert("No previous upload to compare with!");
        return;
    }

    let years = tableData.year;
    let y1 = prompt("Enter first year to compare", years[0]);
    let y2 = prompt("Enter second year to compare", years[1]);

    if (!years.includes(+y1) || !years.includes(+y2)) {
        alert("Invalid year(s)");
        return;
    }

    let idx1 = years.indexOf(+y1);
    let idx2 = years.indexOf(+y2);

    let values1 = [tableData.value[idx1]];
    let values2 = [tableData.value[idx2]];

    let compFig = {
        data: [
            {x:[y1], y:values1, type:"bar", name:y1},
            {x:[y2], y:values2, type:"bar", name:y2}
        ],
        layout: {
            title:"Year Comparison",
            template:"plotly_dark",
            xaxis: {title:"Year"},
            yaxis: {title:"Value"}
        }
    };

    // Hide everything else
    heatmapDiv.style.display = "none";
    globesection.style.display = "none";
    dataSection.style.display = "none";
    total.style.display = "flex"; // keep total visible to hold graphDiv
    graphDiv.style.display = "block";

    // Render comparison chart
    Plotly.react("graph", compFig.data, compFig.layout, {responsive:true});
});
