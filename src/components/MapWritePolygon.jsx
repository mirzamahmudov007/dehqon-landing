"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button, Alert, Space } from "antd"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"
import "leaflet-control-geocoder/dist/Control.Geocoder.css"
import "leaflet-control-geocoder"
import {
    AlertCircleOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    UndoOutlined,
    RedoOutlined,
    DeleteOutlined,
} from "@ant-design/icons"

export function MapWritePolygon({ onAreaSelect, onPolygonChange, readOnly = false, initialPolygon = null }) {
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
        const geocoder = L.Control.geocoder({
            defaultMarkGeocode: false,
            placeholder: "Manzilni qidiring...",
            errorMessage: "Manzil topilmadi",
            suggestMinLength: 3,
            suggestTimeout: 250,
            position: "topleft",
        }).addTo(refs.current.map)

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

        // Handle initial polygon
        if (initialPolygon && refs.current.map && refs.current.drawnItems) {
            const layer = L.geoJSON(initialPolygon)
            refs.current.drawnItems.addLayer(layer)

            const coordinates = initialPolygon.geometry.coordinates[0]
            const latLngs = coordinates.map((coord) => L.latLng(coord[1], coord[0]))
            const hectares = calculateArea(latLngs)
            updateArea(hectares)

            // Fit map bounds to show the polygon
            refs.current.map.fitBounds(layer.getBounds())
        }

        // Only show drawing controls if not in read-only mode
        let drawControl
        if (!readOnly) {
            drawControl = new L.Control.Draw({
                draw: {
                    polygon: {
                        allowIntersection: false,
                        drawError: {
                            color: "#ff4d4f",
                            message: "<strong>Xato!</strong> Maydonlar kesishmasligi kerak!",
                        },
                        shapeOptions: {
                            color: "#1890ff",
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
        }

        // Drawing events
        let drawingTooltip

        refs.current.map.on("draw:drawstart", () => {
            drawingTooltip = L.DomUtil.create("div", "leaflet-draw-tooltip leaflet-draw-tooltip-visible")
            document.body.appendChild(drawingTooltip)

            const handleMouseMove = (e) => {
                if (!drawingTooltip) return

                const draw = drawControl._toolbars.draw._activeMode
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

            // Save GeoJSON data
            const geoJSON = layer.toGeoJSON()
            onPolygonChange(geoJSON)

            // Add popup
            layer
                .bindPopup(`
                    <div style="text-align: center">
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
                    <div style="text-align: center">
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

                button.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; height: 100%; width: 100%;">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
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

        new L.Control.CurrentLocation({ position: "topright" }).addTo(refs.current.map)

        // Cleanup
        return () => {
            if (refs.current.map) {
                refs.current.map.remove()
                refs.current.map = null
            }
        }
    }, [calculateArea, saveToHistory, updateArea, initialPolygon, onPolygonChange, readOnly])

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

    return (
        <div className="relative">
            {/* Instructions */}
            <Alert
                message={
                    <div>
                        <p className="font-medium mb-1">Maydonni belgilash bo'yicha ko'rsatmalar:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Chap tomondagi chizish asbobini tanlang</li>
                            <li>Xaritada nuqtalarni belgilab chiqing</li>
                            <li>Maydonni yakunlash uchun birinchi nuqtaga qaytib bosing</li>
                            <li>Maydonni tahrirlash uchun ustiga ikki marta bosing</li>
                        </ol>
                    </div>
                }
                type="info"
                showIcon
                // icon={<AlertCircleOutlined />}
                className="mb-4"
            />

            {/* Map Controls */}
            <Space className="mb-4 w-full justify-between">
                <Space>
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

                <Space>
                    <Button icon={<UndoOutlined />} onClick={handleUndo} disabled={!canUndo} title="Ortga qaytarish" />
                    <Button icon={<RedoOutlined />} onClick={handleRedo} disabled={!canRedo} title="Oldinga qaytarish" />
                    <Button danger icon={<DeleteOutlined />} onClick={handleClear} title="Tozalash" />
                    <Button
                        icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Kichraytirish" : "Kattalashtirish"}
                    />
                </Space>
            </Space>

            {/* Current Area Display */}
            {currentArea > 0 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
                    <Alert
                        message={
                            <>
                                <span className="font-medium">Tanlangan maydon: </span>
                                <span className="text-blue-600">{currentArea.toFixed(2)} gektar</span>
                            </>
                        }
                        type="info"
                    />
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-[1001] rounded-lg">
                    <div className="ant-spin ant-spin-lg ant-spin-spinning">
                        <span className="ant-spin-dot ant-spin-dot-spin">
                            <i className="ant-spin-dot-item"></i>
                            <i className="ant-spin-dot-item"></i>
                            <i className="ant-spin-dot-item"></i>
                            <i className="ant-spin-dot-item"></i>
                        </span>
                    </div>
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

