# Mocktail math oracle - mirrors engine.js float ops exactly (math.floor(x+0.5) == JS Math.round for positive magnitudes).
import json

def round1(x):
    return math.floor(x * 10 + 0.5) / 10
import math

def batch_scale(juiceMl, syrupMl, sodaMl, servings, guests):
    if not (juiceMl >= 0 and syrupMl >= 0 and sodaMl >= 0): return {"error": "amounts must not be negative"}
    if not (juiceMl + syrupMl + sodaMl > 0): return {"error": "the recipe is empty"}
    if not (servings > 0): return {"error": "servings must be positive"}
    if not (guests > 0): return {"error": "guests must be positive"}
    f = guests / servings
    juice = round1(juiceMl * f); syrup = round1(syrupMl * f); soda = round1(sodaMl * f)
    total = round1(juice + syrup + soda)
    liters = round1(total / 10) / 100
    return {"juice": juice, "syrup": syrup, "soda": soda, "total": total, "liters": liters}

def ice_melt(drinkMl, iceG, meltPct):
    if not (drinkMl > 0): return {"error": "drink must be positive"}
    if not (iceG >= 0): return {"error": "ice must not be negative"}
    if not (meltPct >= 0): return {"error": "melt must not be negative"}
    if meltPct > 100: return {"error": "melt cannot exceed 100%"}
    meltMl = round1(iceG * meltPct / 100)
    final = round1(drinkMl + meltMl)
    pct = round1(100 * meltMl / final)
    band = "barely softened" if pct < 10 else ("classic chill" if pct <= 20 else "watery - serve colder or use bigger cubes")
    return {"meltMl": meltMl, "finalMl": final, "pct": pct, "band": band}

def ratio_split(totalMl, baseParts, syrupParts, citrusParts):
    if not (totalMl > 0): return {"error": "total must be positive"}
    if not (baseParts > 0 and syrupParts >= 0 and citrusParts >= 0): return {"error": "parts must be positive (syrup and citrus may be 0)"}
    if syrupParts + citrusParts == 0: return {"error": "add some syrup or citrus"}
    s = baseParts + syrupParts + citrusParts
    return {"base": round1(totalMl * baseParts / s), "syrup": round1(totalMl * syrupParts / s), "citrus": round1(totalMl * citrusParts / s)}

cases = []
def ba(*a): cases.append({"tool": "batch", "args": list(a), "expect": batch_scale(*a)})
def ic(*a): cases.append({"tool": "ice", "args": list(a), "expect": ice_melt(*a)})
def ra(*a): cases.append({"tool": "ratio", "args": list(a), "expect": ratio_split(*a)})

# batch: happy
ba(120, 30, 90, 2, 10)      # defaults x5
ba(120, 30, 90, 2, 2)       # no scale
ba(150, 25, 0, 4, 6)        # no soda, x1.5
ba(100, 20, 50, 1, 7)       # x7 odd
ba(33.3, 10.5, 22.2, 3, 5)  # decimals
ba(200, 40, 100, 8, 1)      # scale down
ba(0, 60, 240, 2, 12)       # syrup+soda only
ba(500, 100, 400, 10, 25)   # big party
ba(75.5, 15.5, 60.5, 2, 3)
ba(90, 0, 0, 1, 4)          # juice only
# batch: errors
ba(-10, 30, 90, 2, 10)
ba(120, -5, 90, 2, 10)
ba(0, 0, 0, 2, 10)
ba(120, 30, 90, 0, 10)
ba(120, 30, 90, 2, 0)
ba(120, 30, 90, 2, -4)

# ice: happy
ic(240, 120, 50)            # classic chill boundary (20.0)
ic(240, 0, 50)              # no ice -> 0%
ic(200, 100, 30)            # 30/230 = 13.0
ic(300, 200, 80)            # 160/460 = 34.8 watery
ic(150, 50, 20)             # 10/160 = 6.3 barely
ic(240, 90, 100)            # all melts: 90/330=27.3
ic(100, 25, 40)             # 10/110 = 9.1 barely
ic(100, 28.947, 40)         # decimals
ic(350, 140, 55)
ic(180, 60, 15)             # 9/189 = 4.8
# ice: errors
ic(0, 120, 50)
ic(-10, 120, 50)
ic(240, -5, 50)
ic(240, 120, -1)
ic(240, 120, 100.1)
ic(240, 120, 150)

# ratio: happy
ra(300, 4, 1, 1)            # 200/50/50
ra(250, 3, 1, 0)            # 187.5/62.5/0
ra(200, 5, 2, 3)            # 100/40/60
ra(500, 8, 1, 1)
ra(150, 2, 0, 1)            # no syrup: 100/0/50
ra(330, 7, 2, 2)
ra(120, 1, 1, 1)
ra(275.5, 6, 1.5, 0.5)      # decimal parts
ra(400, 10, 3, 2)
# ratio: errors
ra(0, 4, 1, 1)
ra(-50, 4, 1, 1)
ra(300, 0, 1, 1)
ra(300, -2, 1, 1)
ra(300, 4, -1, 1)
ra(300, 4, 0, 0)

with open("expected.json", "w") as f:
    json.dump(cases, f, indent=1)
print(len(cases), "cases written")
