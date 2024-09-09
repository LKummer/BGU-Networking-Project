import pandas as pd

original = pd.read_json("traceWithAttack.json")
print(original)

renamed = pd.DataFrame()

renamed["arrivedAtMS"] = original["time"]
renamed["processingTimeMS"] = original["processingTime"]
renamed["sourceIP"] = original["src"]
renamed["isCached"] = original["isCached"]
renamed["isAttack"] = original["isAttack"]

print(renamed)
renamed.to_json("trace.json", orient="records")
