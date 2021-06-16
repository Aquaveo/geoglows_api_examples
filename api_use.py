# api call and display using Python (requests and plotly)
import os
import requests
import plotly.graph_objects as go
import pandas as pd


request_params = dict(reach_id='5068098', return_format='csv')
res = requests.get('https://geoglows.ecmwf.int/api/ForecastStats/', params=request_params)

print(res.text)

file_name = os.path.join(os.path.expanduser('~'), 'test_csv.csv')
with open(file_name, 'w') as f:
    for line in res.text.splitlines():
        f.write(f'{line}\n')

df = pd.read_csv(file_name, index_col=0)
print(df.head())

df.index = pd.to_datetime(df.index)
data = dict(x=df['flow_avg_m^3/s'].dropna(axis=0).index, y=df['flow_avg_m^3/s'].dropna(axis=0),
            high_x=df.index, high_y=df['high_res_m^3/s'])

fig = go.Figure(data=go.Scatter(x=data['x'], y=data['y']))
fig.add_trace(go.Scatter(x=data['high_x'], y=data['high_y'], line=dict(color='black', width=2)))
fig.show()

# # api call and display using geoglows package
# import geoglows
#
#
# res = geoglows.streamflow.forecast_stats(5068098)
# print(res.head())
#
# fig = geoglows.plots.forecast_stats(stats=res, titles={'Reach ID': 5068098})
# fig.show()
