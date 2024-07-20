
GET https://www.hero-wars.com/

Нужны свойства у глобального объекта window.NXFlashVars

* index_url: "https://heroesru-a.akamaihd.net/mg/index.v1106.json.gz"
* static_url: "https://heroesru-a.akamaihd.net/mg/"

```js
let gameData = fetch(window.NXFlashVars.index_url).json()

"lib/lib.json": {"path": "v1106/lib/lib.json","size": 18038132,"md5": "a9621bd23d35f26d9b1842d23d7e7925","s": "85b76f24cedef29f1c81bc7c670e1683"},
"lib/lib.json.gz": {"path": "v1106/lib/lib.json.gz","size": 1397033,"md5": "9063b37a650216273e1c5ae9827cb82b","s": "fa9f16aea83bcfa5de82d83b321f7166"},
```

lib_url = window.NXFlashVars.static_url + gameData["lib/lib.json"].path

```js
let libUrl = "https://heroesru-a.akamaihd.net/mg/" + "v1106/lib/lib.json"
let libData = fetch(libUrl).json()
```

В `libData` лежат данные для всей игры.

* `libData.seasonAdventure` - это данные для острова приключений
* `libData.seasonAdventure.level` - это все узлы всех островов
* `libData.seasonAdventure.list` - это массив островов

### libData.seasonAdventure.level

объект

* key, имя свойства это ID ячейки/узла?
* value, значение свойства это объект вида

```js
{
  id: 3159,
  level: 859,
  season: 4,
  steps: [
    {
      id: 1,
      cost: {
        coin: { 41: "1" }
      },
      reward: { gold: 1000000 }
      или
      reward: {
        bannerStone: { 4: "1" }
        coin: { 9: "300" }
  ​      consumable: { 412: "1" }
        fragmentGear: { 223: "50" }
      }
    }
  ​  ​...
  ]
}
```

* id - уникальный ID
* level - ?
* season это номер острова (карты), начинается с 1
* steps это ходы с наградами за стоимость, как правило равную предмету id = 41

`steps[i].reward` - награды, может быть несколько, объект где ключ это тип предмета, а значение это
1. для типа gold это количество
2. для остальных типов это объект где ключ это ID предмета, значение это количество

**где взять описание предмета по ID?**

...

### libData.seasonAdventure.list

libData.seasonAdventure.list - это массив островов

let island = libData.seasonAdventure.list[i]

island.map.cells - массив, это ячейки (узлы) карты
key = index
value = ID?

island.map.regions - массив, это части карты?
island.map.regions[i].levels - ...
island.map.regions[i].initLevels - ...
