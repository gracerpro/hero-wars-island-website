GET https://www.hero-wars.com/

Нужны свойства у глобального объекта window.NXFlashVars

- index_url: "https://heroesru-a.akamaihd.net/mg/index.v1161.json.gz"
- static_url: "https://heroesru-a.akamaihd.net/mg/"

Получаем json индексного файла, в котором нужны поля `lib/lib.json` или `lib/lib.json.gz`, `locale/ru.json`, `locale/en.json`

```js
const indexData = fetch(window.NXFlashVars.index_url).json()
const libUrl = window.NXFlashVars.static_url + indexData["lib/lib.json"].path
const libData = fetch(libUrl).json();
```

В `libData` лежат данные для всей игры.

- `libData.seasonAdventure` - это данные для острова приключений
- `libData.seasonAdventure.level` - это все ячейки всех островов
- `libData.seasonAdventure.list` - это список островов


### libData.seasonAdventure.level

объект

- key, имя свойства это ID ячейки
- value, значение свойства это данные для ячейки, например

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

* `id` это уникальный ID
* `level` - ?
* `season` это номер острова или номер сезона, начинается с 1
* `steps` это ходы с наградами за стоимость, как правило равную предмету id = 41

`steps[i].reward` - награды, может быть несколько, объект где

* ключ это тип предмета
* значение это
  * для типа gold, starmoney это количество
  * для остальных типов это объект где ключ это ID предмета, значение это количество


### libData.seasonAdventure.list

Это список островов, объект

* ключ это ID острова или номеро сезона или номер острова
* значение это данные острова

```
const island = libData.seasonAdventure.list[i]
```

* `island.map.cells` - массив, это координаты ячеек, размер равен количеству ячеек умноденным на 2
* `island.map.cells[i]` при четном индексе это координата X, при нечетном индексе это координата Y.
* `island.map.regions` - массив, это части карты
* `island.map.regions[i].levels` - ?
* `island.map.regions[i].initLevels` - это доступные ячейки в начале (когда ни разу не открывали ячейки), по ним можно кликать
