import xarray as xr
import plotly.express as px
import numpy as np
import plotly.graph_objects as go

def generate_visuals(nc_file_path, var_name=None):
    ds = xr.open_dataset(nc_file_path)

    # Pick first variable if not specified
    if var_name is None:
        var_name = list(ds.data_vars.keys())[0]

    data = ds[var_name]

    # ---------- HEATMAP ----------
    heatmap_data = data
    while len(heatmap_data.shape) > 2:
        heatmap_data = heatmap_data.isel({heatmap_data.dims[0]: 0})

    heatmap_clean = np.nan_to_num(heatmap_data.values)
    heatmap_fig = px.imshow(
        heatmap_clean,
        origin="lower",
        color_continuous_scale="Viridis",
        title=f"{var_name.upper()} Heatmap"
    )
    heatmap_fig.update_layout(
        template="plotly_dark",
        title={"x": 0.5, "xanchor": "center"},
        margin=dict(l=20, r=20, t=50, b=20),
        xaxis_title="Longitude",
        yaxis_title="Latitude",
        coloraxis_colorbar=dict(title=var_name, thickness=15, len=0.8)
    )

    # ---------- TIME SERIES ----------
    if "lat" in data.dims and "lon" in data.dims:
        graph_data = data.mean(dim=("lat","lon"))
    else:
        graph_data = data
    while len(graph_data.shape) > 1:
        graph_data = graph_data.isel({graph_data.dims[1]:0})

    values = np.array(graph_data.values).flatten()
    x_vals = list(range(len(values)))
    graph_fig = px.line(x=x_vals, y=values, title=f"{var_name.upper()} Time Series")
    graph_fig.update_traces(line=dict(width=3, shape="spline"))
    graph_fig.update_layout(
        template="plotly_dark",
        title={"x":0.5, "xanchor":"center"},
        xaxis_title="Time",
        yaxis_title=var_name,
        margin=dict(l=20,r=20,t=50,b=40),
        hovermode="x unified"
    )

    # ---------- TABLE ----------
    table_data = None
    if "time" in data.dims:
        yearly = data
        if "lat" in data.dims and "lon" in data.dims:
            yearly = yearly.mean(dim=("lat","lon"))
        yearly = yearly.groupby("time.year").mean()
        years = yearly["year"].values.tolist()
        values = yearly.values.flatten().tolist()
        table_data = {"year": years, "value": values}

    # ---------- GLOBE ----------
    if "lat" in heatmap_data.coords and "lon" in heatmap_data.coords:
        lat = heatmap_data["lat"].values
        lon = heatmap_data["lon"].values
        lat_grid, lon_grid = np.meshgrid(lat, lon)
        globe_fig = go.Figure(go.Scattergeo(
            lat=lat_grid.flatten(),
            lon=lon_grid.flatten(),
            mode="markers",
            marker=dict(size=2, color=heatmap_clean.flatten(),
                        colorscale="Viridis", colorbar=dict(title=var_name),
                        opacity=0.8)
        ))
        globe_fig.update_layout(
            template="plotly_dark",
            title={"text":f"{var_name.upper()} Globe","x":0.5,"xanchor":"center"},
            margin=dict(l=80,r=80,t=70,b=60),
            geo=dict(projection_type="orthographic",
                     showland=True, landcolor="rgb(230,230,230)",
                     showocean=True, oceancolor="rgb(200,220,255)",
                     showcountries=True, countrycolor="rgb(120,120,120)",
                     showcoastlines=True, coastlinecolor="rgb(120,120,120)")
        )
    else:
        globe_fig = go.Figure()

    return heatmap_fig, graph_fig, globe_fig, table_data