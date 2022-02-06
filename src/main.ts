import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import jsyaml from 'js-yaml'
import {
  Config,
  FileLayerPathGetter,
  getLayerFolder,
  getLayerImage,
  Maps,
  MapWithName,
  WebmapBuilder,
} from 'kartograf'

const dataUri =
  'https://raw.githubusercontent.com/igorsaux/webmap/master/sputnik.yaml'
const imagesBaseUri =
  'https://raw.githubusercontent.com/igorsaux/webmap/master/images/'

const TopLeftCRS = L.extend({}, L.CRS, {
  projection: L.Projection.LonLat,
  transformation: new L.Transformation(1, 0, 1, 0),
})

function showMap(config: Config, map: MapWithName) {
  const element = document.createElement('div')
  element.id = 'webmap'
  document.body.appendChild(element)

  let pathGetter: FileLayerPathGetter

  if (config.layerSettings?.type === 'Tiles') {
    pathGetter = (mapName, levelName, layerName) =>
      `${imagesBaseUri}${getLayerFolder(mapName, levelName, layerName)}`
  } else {
    pathGetter = (mapName, levelName, layerName) =>
      `${imagesBaseUri}${getLayerImage(mapName, levelName, layerName)}`
  }

  const webmap = WebmapBuilder.new({
    webmap: new L.Map(element, {
      center: [0, 0],
      crs: TopLeftCRS,
      maxZoom: 4,
    }),
    map,
    config,
    pathGetter: pathGetter,
  })
    .andSetAttributionPrefix(
      'OnyxBay • Igor Spichkin 2021 • <a href="https://github.com/igorsaux/webmap">GitHub</a>'
    )
    .andAddLayer(
      L.tileLayer('./space.png', {
        tileSize: L.point(322, 322),
        noWrap: false,
      })
    )
    .andBuild()

  webmap.initialize()
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

  showMap(data, [data.groups[mapToShow], mapToShow])
}

main()

window.onhashchange = function () {
  location.reload()
}
