import React, { Component } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
const L = typeof window === 'object' ? require('leaflet') : null
const LDraw = typeof window === 'object' ? require('leaflet-draw') : null

export default class extends Component {
  static propTypes = {
    imageId: PropTypes.string,
    contentId: PropTypes.string,
    storyId: PropTypes.string,
    selectedContentId: PropTypes.string,
    mode: PropTypes.string,
    onContentSelection: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.mapRef = React.createRef()
    this.state = {}
    this.state = {
      ...this.stateFromProps(props)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ...this.stateFromProps(nextProps) })
  }

  render() {
    if (!this.state.image && !this.props.content) {
      return <div />
    } else {
      return (
        <ZoomerMap
          innerRef={mapRef => {
            this.mapRef = mapRef
          }}
        />
      )
    }
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove()
    }
  }

  stateFromProps = props => {
    let newState = {}

    let image = false

    let content = false

    let markers = false

    if (props.image) {
      image = props.image
    }

    if (props.content) {
      content = props.content
      if (props.content.image0) {
        image = props.content.image0
      }
    }

    if (props.story) {
      let selectedContent = props.story.contents.find(
        content => content.id === props.selectedContentId
      )

      if (selectedContent) {
        content = selectedContent
        if (selectedContent.image0) {
          image = selectedContent.image0
        }
      } else {
        if (props.story.primaryImage) {
          image = props.story.primaryImage
        } else {
          let firstDetail = props.story.contents.find(content => {
            if (content.type === 'detail' && content.image0) {
              return true
            } else {
              return false
            }
          })
          if (firstDetail) {
            image = firstDetail.image0
          }
        }
      }
    }

    if (props.story && image) {
      let markers = props.story.contents.filter(content => {
        if (content.image0) {
          if (content.image0.id === image.id) {
            return true
          }
        }
        return false
      })

      Object.assign(newState, { markers })
    }

    if (!props.selectedContentId) {
      Object.assign(newState, { content: false })
    }

    if (!this.state.image) {
      Object.assign(newState, { image })
    }

    if (!this.state.content) {
      Object.assign(newState, { content })
    }

    if (this.state.image && image) {
      if (this.state.image.id !== image.id) {
        Object.assign(newState, { image })
      }
    }

    if (this.state.content && content) {
      if (this.state.content !== content.id) {
        Object.assign(newState, { content })
      }
    }

    if (!image) {
      Object.assign(newState, { image })
    }

    return newState
  }

  componentDidMount() {
    this.setup({})
  }

  componentDidUpdate(prevProps, prevState) {
    this.setup(prevState)
  }

  setup = async prevState => {
    try {
      if (this.props.content) {
        if (this.props.content.type === 'map') {
          if (
            this.props.content.mapUrl ||
            prevState.content.mapUrl !== this.props.content.mapUrl
          ) {
            await this.setupMap()
          }
          if (this.props.mode === 'editor') {
            await this.createMapEditor()
          } else {
            await this.showMapContent()
          }
        }
      }

      if (this.state.image) {
        if (prevState.image) {
          if (prevState.image.id !== this.state.image.id) {
            this.map.remove()
            await this.setupImage()
          }
        } else {
          await this.setupImage()
        }

        if (this.map) {
          if (this.state.content) {
            if (this.props.mode === 'editor') {
              await this.createDetailEditor()
            } else {
              await this.createContentLayer()

              if (this.detailBounds) {
                this.map.flyToBounds(this.detailBounds, {
                  animate: false
                })
              }
            }
          }

          if (this.state.markers) {
            await this.createMarkers()
          }
        }
      }
    } catch (ex) {
      console.error(ex)
    }
  }

  setupImage = async () => {
    try {
      let config = await this.config()
      await this.createZoomer(config)
    } catch (ex) {
      console.error(ex)
    }
  }

  config = async image => {
    try {
      if (process.env.FILE_STORAGE === 'local') {
        return await this.localTileConfig()
      } else if (this.state.image.host === 'mia') {
        return await this.miaTileConfig()
      } else {
        return await this.lumeTileConfig()
      }
    } catch (ex) {
      console.error(ex)
    }
  }

  miaTileConfig = async () => {
    try {
      const response = await fetch(
        `https://tiles.dx.artsmia.org/${this.state.image.localId}.tif`,
        {
          method: 'GET'
        }
      )

      let json = await response.json()

      return {
        height: json.height,
        width: json.width,
        tileUrl: json.tileUrl || json.tiles[0],
        tileSize: json.tileSize || 256
      }
    } catch (ex) {
      console.error(ex)
    }
  }

  localTileConfig = async () => {
    try {
      const response = await fetch(
        `${process.env.LOCAL_TILE_URL}/static/${
          this.state.image.id
        }/ImageProperties.xml`,
        {
          method: 'GET'
        }
      )

      let text = await response.text()

      return {
        height: new RegExp(/HEIGHT="(\d*)"/g).exec(text)[1],
        width: new RegExp(/WIDTH="(\d*)"/g).exec(text)[1],
        tileUrl: `${process.env.LOCAL_TILE_URL}/static/${
          this.state.image.id
        }/TileGroup0/{z}-{x}-{y}.png`,
        tileSize: 512
      }
    } catch (ex) {
      console.error(ex)
    }
  }

  lumeTileConfig = async () => {
    try {
      const response = await fetch(
        `${process.env.S3_URL}/mia-lume/${this.state.image.id}/info.json`,
        {
          method: 'GET'
        }
      )

      let json = await response.json()

      return {
        height: json.height,
        width: json.width,
        tileUrl: `${process.env.S3_URL}/mia-lume/${
          this.state.image.id
        }/{z}_{x}_{y}.png`,
        tileSize: 512
      }
    } catch (ex) {
      console.error(ex)
    }
  }

  showMapContent = async () => {
    try {
      if (this.mapContentLayer) {
        this.map.removeLayer(this.mapContentLayer)
      }

      let layers = this.state.content.geoJSON
        ? this.state.content.geoJSON.features.map(feature => {
            return L.GeoJSON.geometryToLayer(feature)
          })
        : []

      this.mapContentLayer = new L.FeatureGroup(layers)

      if (this.state.content.title) {
        this.mapContentLayer.bindTooltip(this.state.content.title)
      }

      this.map.addLayer(this.mapContentLayer)
    } catch (e) {
      console.error(e)
    }
  }

  createMapEditor = async () => {
    try {
      if (this.editableLayers) {
        this.map.removeLayer(this.editableLayers)
      }

      let layers = this.state.content.geoJSON
        ? this.state.content.geoJSON.features.map(feature => {
            return L.GeoJSON.geometryToLayer(feature)
          })
        : []

      this.editableLayers = new L.FeatureGroup(layers)

      this.map.addLayer(this.editableLayers)

      this.map.on(L.Draw.Event.CREATED, e => {
        this.editableLayers.addLayer(e.layer)

        this.props.editContent({
          geoJSON: this.editableLayers.toGeoJSON()
        })
      })

      this.map.on(L.Draw.Event.EDITED, async e => {
        await this.props.editContent({
          geoJSON: this.editableLayers.toGeoJSON()
        })
      })

      this.map.on(L.Draw.Event.DELETED, e => {
        this.props.editContent({
          geoJSON: this.editableLayers.toGeoJSON()
        })
      })

      if (this.drawControl) {
        this.map.removeControl(this.drawControl)
      }

      this.drawControl = new L.Control.Draw({
        draw: {
          polygon: {
            allowIntersection: false
          },
          rectangle: false,
          polyline: false,
          circle: false,
          circlemarker: false
        },
        position: 'topright',
        edit: {
          featureGroup: this.editableLayers
        }
      })

      this.map.addControl(this.drawControl)
    } catch (ex) {
      console.error(ex)
    }
  }

  setupMap = async () => {
    try {
      if (this.tileMap) {
        this.map.removeLayer(this.tileMap)
      }

      if (!this.map) {
        this.map = L.map(this.mapRef).setView([0, 0], 2)
      }

      this.tileMap = L.tileLayer(this.props.content.mapUrl, {
        maxZoom: 18,
        accessToken: this.props.content.mapKey || process.env.MAPBOX_API_TOKEN
      })

      this.tileMap.addTo(this.map)
    } catch (e) {
      console.error(e)
    }
  }

  createZoomer = async config => {
    try {
      let { height, width, tileUrl, tileSize } = config

      let larger = Math.max(height, width)

      let maxTiles = Math.ceil(larger / tileSize)

      let maxZoom = Math.ceil(Math.log2(maxTiles))

      while (height > tileSize || width > tileSize) {
        height = height / 2
        width = width / 2
      }

      let ne = L.latLng(0, width)
      let sw = L.latLng(-1 * height, 0)

      this.bounds = L.latLngBounds(sw, ne)

      this.map = L.map(this.mapRef, {
        crs: L.CRS.Simple,
        maxBounds: this.bounds,
        attributionControl: false,
        maxZoom,
        zoomSnap: 0
        //detectRetina: true
      })

      const container = this.map.getContainer()

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      const longDimension = Math.max(containerWidth, containerHeight)

      const fitX = Math.log2(containerWidth / width)

      const fitY = Math.log2(containerHeight / height)

      let fitZoom = Math.floor(Math.min(fitX, fitY) * 100) / 100
      let minZoom = Math.floor(Math.min(fitX, fitY))

      if (tileSize !== 512) {
        minZoom = 2
      }

      this.tiles = L.tileLayer.knight(tileUrl, {
        tileSize,
        //maxNativeZoom: maxZoom,
        // minNativeZoom: 0,
        noWrap: true,
        bounds: this.bounds,
        //detectRetina: true,
        minZoom,
        //maxZoom,
        errorTileUrl: '/static/spinner.gif'
      })

      const initialLatLng = [height / 2, -1 * width / 2]

      this.map.setView(initialLatLng, fitZoom)

      this.tiles.addTo(this.map)

      this.map.invalidateSize()

      this.map.setZoom(fitZoom)

      this.map.options.zoomSnap = 1
      this.map.options.minZoom = fitZoom
    } catch (ex) {
      console.error(ex)
    }
  }

  createDetailEditor = async () => {
    try {
      if (this.editableLayers) {
        this.map.removeLayer(this.editableLayers)
      }

      let layers = this.state.content.geoJSON
        ? this.state.content.geoJSON.features.map(feature => {
            return L.GeoJSON.geometryToLayer(feature)
          })
        : []

      this.editableLayers = new L.FeatureGroup(layers)

      this.map.addLayer(this.editableLayers)

      this.map.on(L.Draw.Event.CREATED, e => {
        this.editableLayers.addLayer(e.layer)

        this.props.editContent({
          geoJSON: this.editableLayers.toGeoJSON()
        })
      })

      this.map.on(L.Draw.Event.EDITED, e => {
        this.props.editContent({
          geoJSON: this.editableLayers.toGeoJSON()
        })
      })

      this.map.on(L.Draw.Event.DELETED, e => {
        this.props.editContent({
          geoJSON: this.editableLayers.toGeoJSON()
        })
      })

      if (this.drawControl) {
        this.map.removeControl(this.drawControl)
      }
      this.drawControl = new L.Control.Draw({
        draw: {
          polygon: {
            allowIntersection: false
          },
          polyline: false,
          circle: false,
          marker: false,
          circlemarker: false
        },
        position: 'topright',
        edit: {
          featureGroup: this.editableLayers
        }
      })

      this.map.addControl(this.drawControl)
    } catch (ex) {
      console.error(ex)
    }
  }

  createContentLayer = async () => {
    try {
      if (this.contentLayer) {
        this.map.removeLayer(this.contentLayer)
      }

      if (!this.state.content.geoJSON) {
        return
      }

      let details = this.state.content.geoJSON
        ? this.state.content.geoJSON.features.map(feature => {
            return L.GeoJSON.geometryToLayer(feature)
          })
        : []

      details = details.map(detail => detail._latlngs)

      this.detailBounds = L.polygon(details).getBounds()

      let outline = L.rectangle(this.bounds)

      this.contentLayer = L.polygon([outline._latlngs, ...details], {
        fillColor: 'black',
        stroke: 0,
        fillOpacity: 0.8
      })

      this.map.addLayer(this.contentLayer)
    } catch (ex) {
      console.error(ex)
    }
  }

  createMarkers = async () => {
    try {
      let markers = this.state.markers.map(marker => {
        return {
          sw: L.geoJSON(marker.geoJSON)
            .getBounds()
            .getSouthWest(),
          marker
        }
      })

      this.indexMarkers = []

      markers.forEach(({ sw, marker }) => {
        let markerIndex = marker.index

        if (this.state.markers[0]) {
          if (this.state.markers[0].type !== 'obj') {
            markerIndex = markerIndex + 1
          }
        }

        let html = `<div class="index-icon"> ${markerIndex} </div>`

        let icon = L.divIcon({
          html
        })

        let indexMarker = L.marker(sw, {
          icon,
          opacity: 0.75
        })

        indexMarker.addTo(this.map)

        this.indexMarkers.push(indexMarker)

        indexMarker.on('click', () => {
          this.props.onContentSelection(marker)
        })
      })
    } catch (ex) {
      console.error(ex)
    }
  }
}

const ZoomerMap = styled.div`
  min-height: 500px;
  height: 100%;
  width: 100%;
  position: relative;
  display: block;
  z-index: 98;
  .crop-button {
    height: 30px;
    width: 30px;
    background: url('/static/crop.png') center;
    background-size: cover;
    background-color: white;
    border: 1px solid ${({ theme }) => theme.color.gray30};
    box-shadow: 0 0 2px ${({ theme }) => theme.color.gray60};
    border-radius: 2px;
    &:active {
      background-color: grey;
    }
  }
  .index-icon {
    height: 35px;
    width: 35px;
    color: white;
    background-color: black;
    border-radius: 20px;
    border: 2px solid white;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .leaflet-div-icon {
    background-color: rgba(0, 0, 0, 0);
    border: none;
  }

  .leaflet-draw-toolbar {
    a {
      span {
        display: none;
      }
    }
  }
`
if (typeof window === 'object') {
  // L.Control.Cropper = L.Control.extend({
  //   onAdd(map) {
  //     map.cropStart = false
  //     map.cropEnd = false
  //     map.cropping = false
  //
  //     this.button = L.DomUtil.create("button")
  //     L.DomUtil.setClass(this.button, "crop-button")
  //
  //     L.DomEvent.on(this.button, "click", e => this.cropButtonClick(e, map))
  //
  //     return this.button
  //   },
  //
  //   cropButtonClick(e, map) {
  //     if (map.highlight) {
  //       map.highlight.remove()
  //       map.highlight = false
  //     }
  //     if (map.cropStart) {
  //       map.cropStart.remove()
  //       map.cropStart = false
  //     }
  //
  //     if (map.cropEnd) {
  //       map.cropEnd.remove()
  //       map.cropEnd = false
  //     }
  //
  //     if (map.cropping === false) {
  //       map.cropping = true
  //       map._container.style.cursor = "crosshair"
  //       map.dragging._draggable._enabled = false
  //     }
  //   }
  // })
  //
  // L.control.cropper = function(...args) {
  //   return new L.Control.Cropper(...args)
  // }

  L.TileLayer.Knight = L.TileLayer.extend({
    createTile({ z, x, y }) {
      let tile = document.createElement('div')
      let image = document.createElement('img')
      image.src = this._url
        .replace('{z}', z)
        .replace('{x}', x)
        .replace('{y}', y)
        .replace('{s}', 0)
      image.style['object-fit'] = 'contain'
      //image.style['object-position'] = 'left top'
      tile.appendChild(image)
      return tile
    }
  })

  L.tileLayer.knight = function(...args) {
    return new L.TileLayer.Knight(...args)
  }
}
