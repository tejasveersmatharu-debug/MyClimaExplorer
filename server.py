from flask import Flask, request, jsonify
from flask_cors import CORS
from heatmap import generate_visuals
import tempfile
import os
import xarray as xr

app = Flask(__name__)

# Allow both localhost and 127.0.0.1
CORS(app, origins=["http://127.0.0.1:5500", "http://localhost:5500"])

# Store the path of the last uploaded file in memory
current_file_path = None

@app.route("/upload", methods=["POST"])
def upload():
    global current_file_path

    file = request.files["file"]
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".nc")
    file.save(temp.name)
    current_file_path = temp.name

    ds = xr.open_dataset(current_file_path)
    variables = list(ds.data_vars.keys())

    # Generate visuals for the first variable by default
    first_var = variables[0]
    heatmap_fig, graph_fig, globe_fig, table_data = generate_visuals(current_file_path, var_name=first_var)

    return jsonify({
        "heatmap": heatmap_fig.to_json(),
        "graph": graph_fig.to_json(),
        "globe": globe_fig.to_json(),
        "table": table_data,
        "variables": variables,
        "active_variable": first_var
    })


@app.route("/variable", methods=["POST"])
def switch_variable():
    global current_file_path

    if not current_file_path or not os.path.exists(current_file_path):
        return jsonify({"error": "No file uploaded yet"}), 400

    body = request.get_json()
    var_name = body.get("variable")
    if not var_name:
        return jsonify({"error": "No variable specified"}), 400

    heatmap_fig, graph_fig, globe_fig, table_data = generate_visuals(current_file_path, var_name=var_name)

    return jsonify({
        "heatmap": heatmap_fig.to_json(),
        "graph": graph_fig.to_json(),
        "globe": globe_fig.to_json(),
        "table": table_data,
        "active_variable": var_name
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)