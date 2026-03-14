from flask import Flask, request, jsonify
import xarray as xr
import plotly.express as px
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/upload", methods=["POST"])
def upload_file():
    uploaded_file = request.files['file']
    ds = xr.open_dataset(uploaded_file)
    
    # Example: pick first timestep & variable 'temperature'
    data = ds['temperature'][0, :, :]
    
    fig = px.imshow(data)
    fig_json = json.loads(fig.to_json())
    return jsonify({"fig": fig_json})

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))  # Railway sets PORT env variable
    app.run(host="0.0.0.0", port=port, debug=True)
