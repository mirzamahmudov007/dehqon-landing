"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"
import "leaflet-control-geocoder/dist/Control.Geocoder.css"
import "leaflet-control-geocoder"
import { AlertCircle, Maximize2, Minimize2, Undo2, Redo2, Trash2 } from "lucide-react"

export function MapComponent({ onAreaSelect }) {
    // Refs
    const refs = useRef({
        map: null,
        drawnItems: null,
        drawHistory: { undo: [], redo: [] },
    })

    const layersRef = useRef({
        street: null,
        satellite: null,
        hybrid: null,
    })

    // State
    const [mapType, setMapType] = useState("street")
    const [isLoading, setIsLoading] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [currentArea, setCurrentArea] = useState(0)
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)

    // Memoized functions
    const updateHistoryButtons = useCallback(() => {
        setCanUndo(refs.current.drawHistory.undo.length > 0)
        setCanRedo(refs.current.drawHistory.redo.length > 0)
    }, [])

    const calculateArea = useCallback((latLngs) => {
        const area = L.GeometryUtil.geodesicArea(latLngs)
        const hectares = area / 10000
        return hectares
    }, [])

    const updateArea = useCallback(
        (hectares) => {
            setCurrentArea(hectares)
            onAreaSelect(hectares)
        },
        [onAreaSelect],
    )

    const saveToHistory = useCallback(
        (layer) => {
            if (!layer) return

            const geoJSON = layer.toGeoJSON()
            refs.current.drawHistory.undo.push(geoJSON)
            refs.current.drawHistory.redo = [] // Clear redo stack
            updateHistoryButtons()
        },
        [updateHistoryButtons],
    )

    // Map initialization
    useEffect(() => {
        if (refs.current.map) return

        // Initialize map
        refs.current.map = L.map("map", {
            zoomControl: false,
        }).setView([41.3111, 69.2406], 13)

        // Add zoom control
        L.control.zoom({ position: "topright" }).addTo(refs.current.map)

        // Add scale control
        L.control
            .scale({
                imperial: false,
                position: "bottomright",
            })
            .addTo(refs.current.map)

        // Initialize base layers
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

        // Add layer control
        const baseMaps = {
            "Ko'cha": layersRef.current.street,
            "Sun'iy yo'ldosh": layersRef.current.satellite,
            Gibrid: layersRef.current.hybrid,
        }

        L.control.layers(baseMaps, null, { position: "topright" }).addTo(refs.current.map)
        layersRef.current.street.addTo(refs.current.map)

        // Add search control
        const geocoder = (L.Control)
            .geocoder({
                defaultMarkGeocode: false,
                placeholder: "Manzilni qidiring...",
                errorMessage: "Manzil topilmadi",
                suggestMinLength: 3,
                suggestTimeout: 250,
                position: "topleft",
            })
            .addTo(refs.current.map)

        geocoder.on("markgeocode", (e) => {
            const bbox = e.geocode.bbox
            refs.current.map?.fitBounds([
                [bbox.getSouth(), bbox.getWest()],
                [bbox.getNorth(), bbox.getEast()],
            ])
        })

        // Initialize drawing feature group
        refs.current.drawnItems = new L.FeatureGroup()
        refs.current.map.addLayer(refs.current.drawnItems)

        // Setup draw control
        const drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                    allowIntersection: false,
                    drawError: {
                        color: "#e1e4e8",
                        message: "<strong>Xato!</strong> Maydonlar kesishmasligi kerak!",
                    },
                    shapeOptions: {
                        color: "#0ea5e9",
                        fillOpacity: 0.2,
                    },
                },
                polyline: false,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false,
            },
            edit: {
                featureGroup: refs.current.drawnItems,
                poly: {
                    allowIntersection: false,
                },
            },
        })

        refs.current.map.addControl(drawControl)

        // Drawing events
        let drawingTooltip

        refs.current.map.on("draw:drawstart", () => {
            drawingTooltip = L.DomUtil.create("div", "leaflet-draw-tooltip leaflet-draw-tooltip-visible")
            document.body.appendChild(drawingTooltip)

            const handleMouseMove = (e) => {
                if (!drawingTooltip) return

                const draw = (drawControl)._toolbars.draw._activeMode
                if (draw && draw._markers) {
                    const points = draw._markers.map((marker) => marker._latlng)
                    points.push(e.latlng)

                    const area = calculateArea(points)
                    drawingTooltip.style.left = `${e.originalEvent.pageX + 10}px`
                    drawingTooltip.style.top = `${e.originalEvent.pageY + 10}px`
                    drawingTooltip.innerHTML = `Maydon: ${area.toFixed(2)} gektar`
                }
            }

            refs.current.map?.on("mousemove", handleMouseMove)
        })

        refs.current.map.on("draw:drawstop", () => {
            drawingTooltip?.remove()
            drawingTooltip = null
        })

        // Handle created areas
        refs.current.map.on(L.Draw.Event.CREATED, (e) => {
            const layer = e.layer
            refs.current.drawnItems?.addLayer(layer)

            const latLngs = layer.getLatLngs()[0]
            const hectares = calculateArea(latLngs)
            updateArea(hectares)
            saveToHistory(layer)

            // Add popup
            layer
                .bindPopup(`
        <div class="text-center">
          <strong>Maydon:</strong> ${hectares.toFixed(2)} gektar<br>
          <small>Tahrirlash uchun ustiga bosing</small>
        </div>
      `)
                .openPopup()
        })

        // Handle edited areas
        refs.current.map.on(L.Draw.Event.EDITED, (e) => {
            let totalArea = 0
            e.layers.eachLayer((layer) => {
                const latLngs = layer.getLatLngs()[0]
                const area = calculateArea(latLngs)
                totalArea += area

                layer.setPopupContent(`
          <div class="text-center">
            <strong>Maydon:</strong> ${area.toFixed(2)} gektar<br>
            <small>Tahrirlash uchun ustiga bosing</small>
          </div>
        `)
            })

            updateArea(totalArea)
            saveToHistory(e.layers)
        })

        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setIsLoading(false)
                },
                () => {
                    setIsLoading(false)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                },
            )
        }

        // Add location control
        L.Control.CurrentLocation = L.Control.extend({
            onAdd: (map) => {
                const container = L.DomUtil.create("div", "leaflet-bar leaflet-control")
                const button = L.DomUtil.create("a", "current-location-btn", container)

                button.innerHTML = `<span class="flex items-center justify-center h-full w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </span>`
                button.href = "#"
                button.title = "Mening joylashuvim"

                L.DomEvent.on(button, "click", (e) => {
                    L.DomEvent.preventDefault(e)
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                            const { latitude, longitude } = position.coords
                            map.setView([latitude, longitude], 15)
                        })
                    }
                })

                return container
            },
        })
            ; new (L.Control.CurrentLocation)({ position: "topright" }).addTo(refs.current.map)

        // Cleanup
        return () => {
            if (refs.current.map) {
                refs.current.map.remove()
                refs.current.map = null
            }
        }
    }, [calculateArea, saveToHistory, updateArea])

    // Handle map type changes
    useEffect(() => {
        if (!refs.current.map) return

        Object.values(layersRef.current).forEach((layer) => {
            if (layer) {
                refs.current.map?.removeLayer(layer)
            }
        })

        switch (mapType) {
            case "street":
                layersRef.current.street?.addTo(refs.current.map)
                break
            case "satellite":
                layersRef.current.satellite?.addTo(refs.current.map)
                break
            case "hybrid":
                layersRef.current.hybrid?.addTo(refs.current.map)
                break
        }
    }, [mapType])

    // Handlers
    const toggleFullscreen = useCallback(() => {
        const mapElement = document.getElementById("map")
        if (!isFullscreen) {
            mapElement?.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
        setIsFullscreen(!isFullscreen)
        setTimeout(() => {
            refs.current.map?.invalidateSize()
        }, 100)
    }, [isFullscreen])

    const handleUndo = useCallback(() => {
        if (refs.current.drawHistory.undo.length > 0) {
            const lastState = refs.current.drawHistory.undo.pop()
            if (lastState) {
                refs.current.drawHistory.redo.push(lastState)
            }

            refs.current.drawnItems?.clearLayers()

            if (refs.current.drawHistory.undo.length > 0) {
                const previousState = refs.current.drawHistory.undo[refs.current.drawHistory.undo.length - 1]
                const layer = L.geoJSON(previousState)
                refs.current.drawnItems?.addLayer(layer)

                // Get coordinates from GeoJSON
                const coordinates = previousState.geometry.coordinates[0]
                const latLngs = coordinates.map((coord) => L.latLng(coord[1], coord[0]))

                const hectares = calculateArea(latLngs)
                updateArea(hectares)
            } else {
                updateArea(0)
            }

            updateHistoryButtons()
        }
    }, [calculateArea, updateArea, updateHistoryButtons])

    const handleRedo = useCallback(() => {
        if (refs.current.drawHistory.redo.length > 0) {
            const nextState = refs.current.drawHistory.redo.pop()
            if (nextState) {
                refs.current.drawHistory.undo.push(nextState)
            }

            refs.current.drawnItems?.clearLayers()
            const layer = L.geoJSON(nextState)
            refs.current.drawnItems?.addLayer(layer)

            // Get coordinates from GeoJSON
            const coordinates = nextState.geometry.coordinates[0]
            const latLngs = coordinates.map((coord) => L.latLng(coord[1], coord[0]))

            const hectares = calculateArea(latLngs)
            updateArea(hectares)
            updateHistoryButtons()
        }
    }, [calculateArea, updateArea, updateHistoryButtons])

    const handleClear = useCallback(() => {
        refs.current.drawnItems?.clearLayers()
        refs.current.drawHistory = { undo: [], redo: [] }
        updateArea(0)
        updateHistoryButtons()
    }, [updateArea, updateHistoryButtons])

    // Render
    return (
        <div className="relative">
            {/* Instructions */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Maydonni belgilash bo'yicha ko'rsatmalar:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Chap tomondagi chizish asbobini tanlang</li>
                        <li>Xaritada nuqtalarni belgilab chiqing</li>
                        <li>Maydonni yakunlash uchun birinchi nuqtaga qaytib bosing</li>
                        <li>Maydonni tahrirlash uchun ustiga ikki marta bosing</li>
                    </ol>
                </div>
            </div>

            {/* Map Controls */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    className={`px-4 py-2 rounded ${mapType === "street" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setMapType("street")}
                >
                    Ko'cha
                </button>
                <button
                    className={`px-4 py-2 rounded ${mapType === "satellite" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setMapType("satellite")}
                >
                    Sun'iy yo'ldosh
                </button>
                <button
                    className={`px-4 py-2 rounded ${mapType === "hybrid" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setMapType("hybrid")}
                >
                    Gibrid
                </button>

                <div className="ml-auto flex gap-2">
                    <button
                        className={`px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                        onClick={handleUndo}
                        disabled={!canUndo}
                        title="Ortga qaytarish"
                    >
                        <Undo2 className="w-5 h-5" />
                    </button>
                    <button
                        className={`px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                        onClick={handleRedo}
                        disabled={!canRedo}
                        title="Oldinga qaytarish"
                    >
                        <Redo2 className="w-5 h-5" />
                    </button>
                    <button
                        className="px-3 py-2 rounded bg-red-100 hover:bg-red-200 text-red-600"
                        onClick={handleClear}
                        title="Tozalash"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Kichraytirish" : "Kattalashtirish"}
                    >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Current Area Display */}
            {currentArea > 0 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg border">
                    <span className="font-medium">Tanlangan maydon: </span>
                    <span className="text-blue-600">{currentArea.toFixed(2)} gektar</span>
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-[1001] rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Map Container */}
            <div
                id="map"
                className={`rounded-lg border ${isFullscreen ? "h-screen w-screen fixed inset-0 z-[1000]" : "h-[600px] w-full"
                    }`}
            />
        </div>
    )
}

