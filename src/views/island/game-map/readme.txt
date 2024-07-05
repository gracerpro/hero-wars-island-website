view-source:https://www.hero-wars.com/

Нужны эти свойства у глобального объекта window.NXFlashVars

index_url: "https://heroesru-a.akamaihd.net/mg/index.v1106.json.gz"
static_url: "https://heroesru-a.akamaihd.net/mg/"

let gameData = fetch(index_url).json()

"lib/lib.json": {"path": "v1106/lib/lib.json","size": 18038132,"md5": "a9621bd23d35f26d9b1842d23d7e7925","s": "85b76f24cedef29f1c81bc7c670e1683"},
"lib/lib.json.gz": {"path": "v1106/lib/lib.json.gz","size": 1397033,"md5": "9063b37a650216273e1c5ae9827cb82b","s": "fa9f16aea83bcfa5de82d83b321f7166"},
=>
static_url + gameData["lib/lib.json"].path
=>
"https://heroesru-a.akamaihd.net/mg/" + "v1106/lib/lib.json"
=>
let libUrl = "https://heroesru-a.akamaihd.net/mg/v1106/lib/lib.json"

let libData = fetch(libUrl).json()

libData.seasonAdventure - это данные для острова приключений

libData.seasonAdventure.level - это все узлы всех островов
объект,
имя свойства это ID ячейки/узла? от 1 до 3159
значение свойства это объект вида
id: 3159
level: 859
season: 4
steps: []
clientData: {
  graphics: {
    tile: "hex_empty"
    fog: "fog_default"
    fogged: []
    visible: []
  }
}

где season это номер острова (карты), начинается с 1

libData.seasonAdventure.list - это массив островов

let island = libData.seasonAdventure.list[i]

island.map.cells - массив, это ячейки (узлы) карты
key = index
value = ID?

island.map.regions - массив, это части карты?
island.map.regions[i].levels - ...
island.map.regions[i].initLevels - ...
