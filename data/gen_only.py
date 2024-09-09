import pandas as pd
from random import randrange, uniform, choice

# time, src, isCached, processingTime

requests = []
for i in range(100000):
    requests.append(
        [
            uniform(0, 1),
            f"158.61.{randrange(1, 254)}.{randrange(1, 254)}",
            False,
            uniform(30, 60),
            True,
        ]
    )

requests.sort(key=lambda v: v[0])

attackTrace = pd.DataFrame(
    requests,
    columns=["arrivedAtMS", "sourceIP", "isCached", "processingTimeMS", "isAttack"],
)

print(attackTrace)

attackTrace.to_json("attackTrace.json", orient="records")
