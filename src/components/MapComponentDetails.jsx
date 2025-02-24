"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"



export function MapComponent({ onAreaSelect, savedArea }) {
  const mapRef = useRef (null)
  const drawnItemsRef = useRef(null)
  const [mapType, setMapType] = useState("street")
  const layersRef = useRef ({
    street: null,
    satellite: null,
    hybrid: null,
  })

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([41.3111, 69.2406], 13)

      // Create base layers
      layersRef.current.street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      })

      layersRef.current.satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        },
      )

      layersRef.current.hybrid = L.layerGroup([
        layersRef.current.satellite,
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          opacity: 0.7,
        }),
      ])

      const baseMaps = {
        "Ko'cha": layersRef.current.street,
        "Sun'iy yo'ldosh": layersRef.current.satellite,
        Gibrid: layersRef.current.hybrid,
      }

      L.control.layers(baseMaps).addTo(mapRef.current)
      layersRef.current.street.addTo(mapRef.current)

      // Setup draw controls
      drawnItemsRef.current = new L.FeatureGroup()
      mapRef.current.addLayer(drawnItemsRef.current)

      const drawControl = new L.Control.Draw({
        draw: {
          polygon: true,
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItemsRef.current,
        },
      })
      mapRef.current.addControl(drawControl)

      mapRef.current.on(L.Draw.Event.CREATED, (e) => {
        const layer = e.layer
        drawnItemsRef.current?.addLayer(layer)
        const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0])
        onAreaSelect(area / 10000) // Convert square meters to hectares
      })
    }

    // Load saved area if provided
    if (savedArea && mapRef.current && drawnItemsRef.current) {
      // Clear existing drawings
      drawnItemsRef.current.clearLayers()

      // Create polygon from saved coordinates
      const polygon = L.polygon(savedArea.coordinates, {
        color: "green",
        fillColor: "#3388ff",
        fillOpacity: 0.2,
      })

      // Add polygon to the map
      drawnItemsRef.current.addLayer(polygon)

      // Fit map bounds to show the polygon
      mapRef.current.fitBounds(polygon.getBounds())

      // Display the area
      onAreaSelect(savedArea.area)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [onAreaSelect, savedArea])

  useEffect(() => {
    if (mapRef.current) {
      // Remove all current layers
      Object.values(layersRef.current).forEach((layer) => {
        if (layer) {
          mapRef.current?.removeLayer(layer)
        }
      })

      // Add the selected layer
      switch (mapType) {
        case "street":
          layersRef.current.street?.addTo(mapRef.current)
          break
        case "satellite":
          layersRef.current.satellite?.addTo(mapRef.current)
          break
        case "hybrid":
          layersRef.current.hybrid?.addTo(mapRef.current)
          break
      }
    }
  }, [mapType])

  return (
    <div>
      <div className="mb-4">
        <button
          className={`px-4 py-2 mr-2 ${mapType === "street" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setMapType("street")}
        >
          Ko'cha
        </button>
        <button
          className={`px-4 py-2 mr-2 ${mapType === "satellite" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setMapType("satellite")}
        >
          Sun'iy yo'ldosh
        </button>
        <button
          className={`px-4 py-2 ${mapType === "hybrid" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setMapType("hybrid")}
        >
          Gibrid
        </button>
      </div>
      <div id="map" className="h-[400px] w-full rounded-lg border" />
    </div>
  )
}

