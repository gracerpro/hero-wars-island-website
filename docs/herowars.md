# Simple Hero Wars documentation

> GET https://www.hero-wars.com/

Find two property in global object `window.NXFlashVars`

1. index_url.lib_index, "https://heroesru-a.akamaihd.net/mg/lib/index.lib.b2cc48697f15d1a957263a708839645b.json.gz"
2. static_url, "https://heroesru-a.akamaihd.net/mg/"

Get json for index file

```js
const indexData = fetch(window.NXFlashVars.index_url.lib_index).json()
```

Get game data and localization

```js
const staticUrl = window.NXFlashVars.static_url

const libUrl =  staticUrl + "/lib/" + indexData["lib.json.gz"].path
const libData = fetch(libUrl).json();

const ruUrl = staticUrl + "/lib/" + indexData["ru.json.gz"].path
const ruData = fetch(libUrl).json();

const enUrl = staticUrl + "/lib/" + indexData["en.json.gz"].path
const enData = fetch(libUrl).json();
```

In `libData` store the game data

- `libData.seasonAdventure` this is adventure island data
- `libData.seasonAdventure.level` this is all cells of all islands
- `libData.seasonAdventure.list` this is list of islands, seasons


### libData.seasonAdventure.level

object

- `key` this is cell`s ID
- `value` this is cell`s data

```js
const cell = {
  id: 3159,
  level: 859,
  season: 4,
  steps: [
    {
      id: 1,
      cost: {
        coin: { 41: "1" }
      },
      reward: {
        bannerStone: { 4: "1" }
        coin: { 9: "300" }
  ​      consumable: { 412: "1" }
        fragmentGear: { 223: "50" }
      }
    }
  ]
}
```

* `id` this is cell`s ID
* `level` level
* `season` this is island number or season, start with 1
* `steps` this is steps with rewards by cost

`steps[i].reward` - rewars array, may be some, object

* `key` this is item type
* `value` this is
  * if types equals `gold`, `starmoney`, `stamina` this is a quantity
  * else this is an object, where a key is an item id, value is a quantity


### libData.seasonAdventure.list

This is island list, object

* `key` this is island ID or season
* `value` this is island data

```js
const island = libData.seasonAdventure.list[i]
```

* `island.map.cells` - array, this is cell`s coordinates, length equals cells quantity * 2
* `island.map.cells[i]` on even index this is X coordinate, else this is Y coordinate.
* `island.map.regions` - array, this is island`s parts
* `island.map.regions[i].levels` - ?
* `island.map.regions[i].initLevels` - this is start visible cells


## Assets

asset_url = https://heroesru-a.akamaihd.net/mg/assets/

Consumable icons

asset_url + ["inventory_icons/consumable.png"]["path"]
