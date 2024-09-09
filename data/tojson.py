import pandas as pd

df = pd.read_csv("ips.tsv", sep="\t")

df["time"] = pd.to_datetime(df["time"])
df["time"] = df["time"] - df["time"].min()

df["time"] = df["time"].dt.total_seconds() * 1000
df.to_json("ips.json", orient="records")
