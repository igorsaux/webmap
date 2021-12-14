import 'leaflet/dist/leaflet.css'
import L, { ImageOverlay, LatLngBoundsExpression, map } from 'leaflet'

type Level = {
  name: string
  path: string
  bounds: LatLngBoundsExpression
}

type SSMap = {
  mainLevel: string
  name: string
  bounds: LatLngBoundsExpression
  levels: {
    [index: string]: Level
  }
}

type Data = {
  maps: SSMap[]
}

const dataUri = 'https://github-cdn.vercel.app/igorsaux/webmap/master/maps.json'
const imagesBaseUri =
  'https://raw.githubusercontent.com/igorsaux/webmap/master/images/'

function showMap(map: SSMap) {
  const el = document.createElement('div')
  el.id = 'webmap'
  document.body.appendChild(el)

  const webmap = L.map(el, {
    center: [-125, 125],
    zoom: 4,
    crs: L.CRS.Simple,
    maxZoom: 6,
  })

  const mapName = map.name.toLocaleLowerCase()
  let mainLayer

  webmap.fitBounds(map.bounds)
  webmap.setMaxBounds(map.bounds)

  const layers: {
    [name: string]: ImageOverlay
  } = {}

  L.tileLayer('./static/space.png', {
    tileSize: L.point(322, 322),
    noWrap: false,
  }).addTo(webmap)

  for (const index in map.levels) {
    const level = map.levels[index]

    layers[level.name] = L.imageOverlay(
      `${imagesBaseUri}${mapName}/${mapName}-${index}-1.png`,
      level.bounds
    )

    if (index === map.mainLevel) {
      mainLayer = layers[level.name]
    }
  }

  mainLayer?.addTo(webmap)
  L.control.layers(layers).addTo(webmap)
}

function showListOfMaps(maps: SSMap[]) {
  const list = document.createElement('div')
  list.id = 'ListOfMaps'

  const title = document.createElement('h1')
  title.innerText = '- Список карт -'

  list.appendChild(title)

  for (const map of maps) {
    const link = document.createElement('a')
    link.innerText = map.name
    link.href = `#/${map.name.toLowerCase()}`

    list.appendChild(link)
  }

  document.body.appendChild(list)
}

async function main() {
  const data = (await (await fetch(dataUri)).json()) as Data

  const hash = location.hash.replace('#/', '').toLowerCase()
  const mapToShow = data.maps.find(map => map.name.toLowerCase() === hash)

  if (!mapToShow || !hash) {
    return showListOfMaps(data.maps)
  }

  showMap(mapToShow!)
}

main()

window.onhashchange = function () {
  location.reload()
}
