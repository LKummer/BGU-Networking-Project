import pandas as pd
from random import randrange, uniform, choice

# time, src, isCached, processingTime
trace = pd.read_json("ips.json")
trace["isAttack"] = False

processing_times = []
is_cached_values = []
for i in range(len(trace)):
    is_cached = choice([False, False, False, True])
    processing_time = uniform(5, 15) if is_cached else uniform(30, 60)
    is_cached_values.append(is_cached)
    processing_times.append(processing_time)

trace["isCached"] = is_cached_values
trace["processingTimeMs"] = processing_times

trace["sourceIP"] = trace["src"]
trace["arrivedAtMS"] = trace["time"]

del trace["dst"]
del trace["src"]
del trace["time"]

trace.to_json("legitimateTrace.json", orient="records")
