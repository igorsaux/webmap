import 'leaflet/dist/leaflet.css'
import L, { ImageOverlay, LatLngBoundsExpression, LayerGroup } from 'leaflet'
import jsyaml from 'js-yaml'

type Maps = {
  [key: string]: Map
}

type Layers = {
  [key: string]: Layer
}

type Selectors = {
  [key: string]: Selector
}

type Level = {
  path: string
  underlays?: any[]
}

type Layer = {
  display: string
  selectors: string[]
}

type Map = {
  bounds: LatLngBoundsExpression
  layers: string[]
  levels: Level[]
  mainLevel?: string
}

type ByPath = {
  exclude?: string[]
  include: string[]
  type: any
}

type UseSelector = {
  name: string
  negate: boolean
}

type Selector = {
  rules: Rule[]
}

type Rule = ByPath | UseSelector

type Config = {
  dme: string
  layers: Layers
  groups: Maps
  selectors: Selectors
}

const dataUri =
  'https://raw.githubusercontent.com/igorsaux/webmap/master/dmm-renderer.yaml'
const imagesBaseUri =
  'https://raw.githubusercontent.com/igorsaux/webmap/master/images/'

function getImageFileOfMap(
  mapName: string,
  levelName: string,
  layerName: string
) {
  return `${imagesBaseUri}${mapName}-${levelName}-${layerName}.png`
}

function showMap(mapName: string, map: Map, layers: Layers) {
  const el = document.createElement('div')
  el.id = 'webmap'
  document.body.appendChild(el)

  const webmap = L.map(el, {
    center: [-125, 125],
    zoom: 4,
    crs: L.CRS.Simple,
    maxZoom: 6,
    minZoom: 2,
  })

  webmap.attributionControl.setPrefix(
    'OnyxBay • Igor Spichkin 2021 • <a href=""https://github.com/igorsaux/webmap>GitHub</a>'
  )

  let mainLayer
  let mainLevel

  webmap.fitBounds(map.bounds)
  webmap.setMaxBounds(map.bounds)
  let mainControl = L.control.layers().addTo(webmap)

  const baseLayers: {
    [name: string]: ImageOverlay | LayerGroup
  } = {}

  const overlays: {
    [name: string]: {
      [name: string]: ImageOverlay
    }
  } = {}

  const updateOverlays = (targetLevel: string) => {
    for (const level of Object.keys(overlays)) {
      for (const overlay of Object.values(overlays[level])) {
        mainControl.removeLayer(overlay)
      }
    }

    const levelOverlays = overlays[targetLevel]

    for (const name in levelOverlays) {
      const overlay = levelOverlays[name]
      mainControl.addOverlay(overlay, name)
    }
  }

  for (const levelName in map.levels) {
    const level = map.levels[levelName]
    const underlays = []

    overlays[levelName] = {}

    for (const name of map.layers.slice(1)) {
      const layer = layers[name]
      overlays[levelName][layer.display] = L.imageOverlay(
        getImageFileOfMap(mapName, levelName, name),
        map.bounds
      )
    }

    if (level.underlays) {
      for (const underlayName of level.underlays) {
        underlays.push(
          L.imageOverlay(
            getImageFileOfMap(mapName, underlayName, map.layers[0]),
            map.bounds,
            {
              className: 'UnderlayLayer',
            }
          )
        )
      }
    }

    baseLayers[levelName] = L.layerGroup(underlays).addLayer(
      L.imageOverlay(
        getImageFileOfMap(mapName, levelName, map.layers[0]),
        map.bounds
      )
    )

    mainControl.addBaseLayer(baseLayers[levelName], levelName)

    if (levelName === map.mainLevel) {
      mainLayer = baseLayers[levelName]
      updateOverlays(levelName)
    }
  }

  mainLayer?.addTo(webmap)
  webmap.on('baselayerchange', (event: L.LayersControlEvent) =>
    updateOverlays(event.name)
  )
}

function showListOfMaps(maps: Maps) {
  const list = document.createElement('div')
  list.id = 'ListOfMaps'

  const title = document.createElement('h1')
  title.innerText = '- Список карт -'

  list.appendChild(title)

  for (const mapName in maps) {
    const link = document.createElement('a')
    link.innerText = mapName
    link.href = `#/${mapName.toLowerCase()}`

    list.appendChild(link)
  }

  document.body.appendChild(list)
}

async function main() {
  const rawData = await (await fetch(dataUri)).text()
  const data = jsyaml.load(rawData) as Config

  const hash = location.hash.replace('#/', '').toLowerCase()
  const mapToShow = Object.keys(data.groups).find(
    mapName => mapName.toLowerCase() === hash
  )

  if (!mapToShow || !hash) {
    return showListOfMaps(data.groups)
  }

  showMap(mapToShow!, data.groups[mapToShow], data.layers)
}

main()

window.onhashchange = function () {
  location.reload()
}
