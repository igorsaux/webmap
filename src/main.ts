import 'leaflet/dist/leaflet.css'
import L, {
  ImageOverlay,
  LatLngBoundsExpression,
  LayerGroup,
  map,
} from 'leaflet'

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
  name: string
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

type Selector = {
  rules: Rule[]
}

type Rule = {
  exclude?: string[]
  include: string[]
  type: any
}

type Config = {
  dme: string
  layers: Layers
  maps: Maps
  selectors: Selectors
}

const dataUri =
  'https://raw.githubusercontent.com/igorsaux/webmap/master/dmm-renderer.json'
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
  })

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

  for (const index in map.levels) {
    const level = map.levels[index]
    const underlays = []

    overlays[level.name] = {}

    for (const name of map.layers.slice(1)) {
      const layer = layers[name]
      overlays[level.name][layer.display] = L.imageOverlay(
        getImageFileOfMap(mapName, level.name, name),
        map.bounds
      )
    }

    if (level.underlays) {
      for (const underlayIndex of level.underlays) {
        const underlay = map.levels[underlayIndex]
        underlays.push(
          L.imageOverlay(
            getImageFileOfMap(mapName, underlay.name, map.layers[0]),
            map.bounds,
            {
              className: 'UnderlayLayer',
            }
          )
        )
      }
    }

    baseLayers[level.name] = L.layerGroup(underlays).addLayer(
      L.imageOverlay(
        getImageFileOfMap(mapName, level.name, map.layers[0]),
        map.bounds
      )
    )

    mainControl.addBaseLayer(baseLayers[level.name], level.name)

    if (index === map.mainLevel) {
      mainLayer = baseLayers[level.name]
      updateOverlays(level.name)
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
  const data = (await (await fetch(dataUri)).json()) as Config

  const hash = location.hash.replace('#/', '').toLowerCase()
  const mapToShow = Object.keys(data.maps).find(
    mapName => mapName.toLowerCase() === hash
  )

  if (!mapToShow || !hash) {
    return showListOfMaps(data.maps)
  }

  showMap(mapToShow!, data.maps[mapToShow], data.layers)
}

main()

window.onhashchange = function () {
  location.reload()
}
