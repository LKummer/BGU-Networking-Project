import pandas as pd
from random import randrange, uniform, choice

# time, src, isCached, processingTime

requests = []
for i in range(30000):
    requests.append(
        [
            uniform(0, 49500),
            f"158.61.{randrange(1, 254)}.{randrange(1, 254)}",
            False,
            uniform(30, 60),
            True,
        ]
    )

requests.sort(key=lambda v: v[0])

attackTrace = pd.DataFrame(
    requests, columns=["time", "src", "isCached", "processingTime", "isAttack"]
)

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
trace["processingTime"] = processing_times

del trace["dst"]
combined_trace = pd.concat([attackTrace, trace]).sort_values("time")
print(combined_trace)

combined_trace.to_json("traceWithAttack.json", orient="records")
