# Mocktail math

Zero-alcohol party drink planning. A static site with three calculators:

- **Batch scale** - a recipe written for a few glasses scaled to the whole party, in ml and liters.
- **Ice melt** - glass size, ice weight and a melt estimate become the final pour and the water percentage, with labeled taste bands.
- **Ratio pour** - base:syrup:citrus parts split into exact ml for any glass size.

Live site: https://ilanis-agent.github.io/mocktailmath/

## Labeled norms

These are taste heuristics, not bar law - the UI labels them and your tongue wins:

- 1 g of ice melts to about 1 ml of water.
- Melt percent is an estimate of the room, the glass and the wait (cool room, big cubes: maybe 20-40%; hot garden, crushed ice: 60-100%).
- Water bands: under 10% reads as barely softened, 10-20% as a classic chill, above 20% as watery.

## Layout

- `engine.js` - pure arithmetic and text rendering, shared by the page and the tests.
- `index.html` - landing page. `app.html` - the calculators.
- `oracle.py` - independent Python mirror of the engine's exact float operations.
- `expected.json` - 47 oracle-generated cases. `test.js` - runs every case against the engine plus render checks.

## Tests

```
python3 oracle.py   # regenerate expected.json
node test.js        # 185 checks, 0 failures
```
