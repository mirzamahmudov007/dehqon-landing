"use client"

import { useEffect, useRef, useState } from "react"
import { Button, Space } from "antd"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"
import "leaflet-geometryutil"

export function MapComponentDetails({ initialPolygon, readOnly = true }) {
  const mapRef = useRef(null)
  const drawnItemsRef = useRef(null)
  const [mapType, setMapType] = useState("street")
  const layersRef = useRef({
    street: null,
    satellite: null,
    hybrid: null,
  })

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map("map", {
        zoomControl: false,
      }).setView([41.3111, 69.2406], 13)

      // Add zoom control to top right
      L.control.zoom({ position: "topright" }).addTo(mapRef.current)

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

      L.control.layers(baseMaps, null, { position: "topright" }).addTo(mapRef.current)
      layersRef.current.street.addTo(mapRef.current)

      // Initialize drawing feature group
      drawnItemsRef.current = new L.FeatureGroup()
      mapRef.current.addLayer(drawnItemsRef.current)
    }

    // Load initial polygon if provided
    if (initialPolygon?.geometry?.coordinates?.[0] && mapRef.current && drawnItemsRef.current) {
      // Clear existing drawings
      drawnItemsRef.current.clearLayers()

      try {
        // Create polygon from GeoJSON
        const layer = L.geoJSON(initialPolygon, {
          style: {
            color: "#1890ff", // Ant Design primary color
            fillColor: "#1890ff",
            fillOpacity: 0.2,
            weight: 2,
          },
        })

        // Add polygon to the map
        drawnItemsRef.current.addLayer(layer)

        // Fit map bounds to show the polygon
        mapRef.current.fitBounds(layer.getBounds())

        // Calculate area
        const latLngs = initialPolygon.geometry.coordinates[0].map((coord) => L.latLng(coord[1], coord[0]))
        const area = L.GeometryUtil.geodesicArea(latLngs)
        const hectares = (area / 10000).toFixed(2)

        // Add area information popup
        layer
          .bindPopup(`
            <div style="text-align: center">
              <strong>Maydon:</strong> ${hectares} gektar
            </div>
          `)
          .openPopup()
      } catch (error) {
        console.error("Error loading polygon:", error)
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [initialPolygon])

  // Handle map type changes
  useEffect(() => {
    if (mapRef.current) {
      Object.values(layersRef.current).forEach((layer) => {
        if (layer) {
          mapRef.current?.removeLayer(layer)
        }
      })

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
      <Space className="mb-4">
        <Button type={mapType === "street" ? "primary" : "default"} onClick={() => setMapType("street")}>
          Ko'cha
        </Button>
        <Button type={mapType === "satellite" ? "primary" : "default"} onClick={() => setMapType("satellite")}>
          Sun'iy yo'ldosh
        </Button>
        <Button type={mapType === "hybrid" ? "primary" : "default"} onClick={() => setMapType("hybrid")}>
          Gibrid
        </Button>
      </Space>
      <div id="map" className="h-[400px] w-full rounded-lg border" />
    </div>
  )
}

