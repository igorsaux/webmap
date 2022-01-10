import L from 'leaflet'
import {
  BaseLayers,
  Config,
  FileLayerPathGetter,
  getLayerFileName,
  LayerWithName,
  Map,
  MapWithName,
  Maybe,
  Overlays,
} from '.'

type WebmapParameters = {
  webmap: L.Map
  config: Config
  map: MapWithName
  pathGetter?: FileLayerPathGetter
}

export class WebmapBuilder {
  #instance: Webmap

  constructor(params: WebmapParameters) {
    this.#instance = new Webmap(params)
  }

  static new(params: WebmapParameters): WebmapBuilder {
    return new WebmapBuilder(params)
  }

  andSetAttributionPrefix(prefix: string): WebmapBuilder {
    this.#instance.webmap.attributionControl.setPrefix(prefix)

    return this
  }

  andAddLayer(layer: L.Layer): WebmapBuilder {
    this.#instance.webmap.addLayer(layer)

    return this
  }

  andBuild(): Webmap {
    return this.#instance
  }
}

class Webmap {
  #webmap: L.Map
  #map: MapWithName
  #config: Config
  #baseLayers: BaseLayers = {}
  #overlays: Overlays = {}
  #layersControl: L.Control.Layers
  #pathGetter: FileLayerPathGetter
  #mainBaseLayer: Maybe<LayerWithName>

  get webmap(): L.Map {
    return this.#webmap
  }

  get map(): Map {
    return this.#map[0]
  }

  get mapName(): string {
    return this.#map[1]
  }

  get config(): Config {
    return this.#config
  }

  constructor(params: WebmapParameters) {
    this.#webmap = params.webmap
    this.#config = params.config
    this.#map = params.map
    this.#layersControl = L.control.layers().addTo(this.#webmap)
    this.#pathGetter = params.pathGetter || getLayerFileName
  }

  initialize() {
    this.webmap.setMaxBounds(this.map.bounds)
    this.webmap.fitBounds(this.map.bounds)

    this.#baseLayers = this.#getBaseLayersForMap()
    this.#addBaseLayersToControl()

    this.#overlays = this.#getOverlays()

    this.#mainBaseLayer = this.#findMainBaseLayer()

    if (this.#mainBaseLayer) {
      this.#updateOverlays(this.#mainBaseLayer[1])
      this.#mainBaseLayer[0].addTo(this.webmap)
    }

    this.webmap.on('baselayerchange', (event: L.LayersControlEvent) =>
      this.#updateOverlays(event.name)
    )
  }

  #findMainBaseLayer(): Maybe<LayerWithName> {
    for (const layerName in this.#baseLayers) {
      if (layerName === this.map.mainLevel) {
        return [this.#baseLayers[layerName], layerName]
      }
    }

    return undefined
  }

  #addBaseLayersToControl() {
    for (const layerName in this.#baseLayers) {
      const layer = this.#baseLayers[layerName]
      this.#layersControl.addBaseLayer(layer, layerName)
    }
  }

  #getBaseLayersForMap(): BaseLayers {
    const baseLayers: BaseLayers = {}

    for (const levelName in this.map.levels) {
      const level = this.map.levels[levelName]
      const underlays: L.ImageOverlay[] = []

      if (level.underlays) {
        for (const underlayName of level.underlays) {
          underlays.push(
            L.imageOverlay(
              this.#pathGetter(this.mapName, underlayName, this.map.layers[0]),
              this.map.bounds,
              {
                className: 'UnderlayLayer',
              }
            )
          )
        }
      }

      baseLayers[levelName] = L.layerGroup(underlays).addLayer(
        L.imageOverlay(
          this.#pathGetter(this.mapName, levelName, this.map.layers[0]),
          this.map.bounds
        )
      )
    }

    return baseLayers
  }

  #getOverlays(): Overlays {
    const overlays: Overlays = {}

    for (const levelName in this.map.levels) {
      const level = this.map.levels[levelName]

      overlays[levelName] = {}

      for (const layerName of this.map.layers.slice(1)) {
        const layer = this.config.layers[layerName]
        overlays[levelName][layer.display] = L.imageOverlay(
          this.#pathGetter(this.mapName, levelName, layerName),
          this.map.bounds
        )
      }
    }

    return overlays
  }

  #updateOverlays(targetLevel: string) {
    for (const levelName in this.#overlays) {
      for (const overlayName in this.#overlays[levelName]) {
        const overlay = this.#overlays[levelName][overlayName]

        this.#layersControl.removeLayer(overlay)
      }
    }

    for (const overlayName in this.#overlays[targetLevel]) {
      const overlay = this.#overlays[targetLevel][overlayName]

      this.#layersControl.addOverlay(overlay, overlayName)
    }
  }
}
