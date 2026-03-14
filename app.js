const uploadInput = document.getElementById("upload-btn");

uploadInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const backendURL = "http://localhost:5000/upload"; // or your hosted URL

    try {
        const response = await fetch(backendURL, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        // Render Plotly figure from backend JSON
        Plotly.react('total_heatmap_box', data.fig.data, data.fig.layout);

    } catch (err) {
        console.error("Upload failed:", err);
    }
});
console.log("hello")