"use client"

import { MapComponentDetails } from "@/components/MapComponentDetails"
import { Navbar } from "@/components/navbar/Navbar"
import { Button, Card } from "antd"
import { ArrowLeft, MapPin, Ruler } from "lucide-react"
import { useLocale } from "next-intl"
import Link from "next/link"
import { useParams } from "next/navigation"

const mockSavedListing = {
    selectedArea: 175.5204435234307,
    pricePerHectare: 1234567,
    description: "Qulay joyda joylashgan yer maydoni",
    region: "samarqand",
    district: "mirzo_ulugbek",
    polygonGeoJSON: {
        type: "Feature",
        properties: {},
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [69.2406, 41.3111],
                    [69.245, 41.315],
                    [69.25, 41.313],
                    [69.2406, 41.3111],
                ],
            ],
        },
    },
    imageUrl: "/sf-gallery-tobacco-04.jpg",
    title: "Samarqand viloyati",
    location: "Samarqand viloyati, Mirzo Ulug'bek tumani",
}

export default function AreaDetails() {
    const params = useParams()
    const currentLocale = useLocale()
    const listingData = mockSavedListing
    const totalPrice = listingData.selectedArea * listingData.pricePerHectare

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href={`/${currentLocale}/areas`}>
                        <Button icon={<ArrowLeft className="h-4 w-4" />}>Orqaga</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left column - Map */}
                    <Card>
                        <MapComponentDetails initialPolygon={listingData.polygonGeoJSON} />
                    </Card>

                    {/* Right column - Details */}
                    <div className="space-y-6">
                        <Card>
                            <h1 className="text-2xl font-bold mb-4">{listingData.title}</h1>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-5 w-5" />
                                    <span>{listingData.location}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600">
                                    <Ruler className="h-5 w-5" />
                                    <span>{listingData.selectedArea.toFixed(2)} gektar</span>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="text-lg font-semibold mb-2">Narxi</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {listingData.pricePerHectare.toLocaleString()} so'm / gektar
                                    </div>
                                    <div className="text-lg text-gray-600 mt-1">Jami: {totalPrice.toLocaleString()} so'm</div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="text-lg font-semibold mb-2">Tavsif</div>
                                    <p className="text-gray-600">{listingData.description}</p>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="text-lg font-semibold mb-2">Hudud</div>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="font-medium">Viloyat: </span>
                                            <span className="text-gray-600">{listingData.region}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Tuman: </span>
                                            <span className="text-gray-600">{listingData.district}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {listingData.imageUrl && (
                            <Card>
                                <img
                                    src={listingData.imageUrl || "/placeholder.svg"}
                                    alt={listingData.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

