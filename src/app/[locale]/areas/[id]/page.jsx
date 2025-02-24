"use client"

import { MapComponent } from "@/components/MapComponentDetails"
import { Navbar } from "@/components/navbar/Navbar"
import { Button, Card } from "antd"
import { ArrowLeft, MapPin, Ruler } from 'lucide-react'
import { useLocale } from "next-intl"
import Link from "next/link"
import { useParams } from "next/navigation"

const mockAreaData = {
    id: "1",
    title: "Toshkent shahri",
    area: 334,
    pricePerHectare: 15000000,
    description: "Qulay joyda joylashgan yer maydoni",
    location: "Toshkent viloyati, Zangiota tumani",
    coordinates: [
        [
            [41.3111, 69.2406],
            [41.3150, 69.2450],
            [41.3130, 69.2500],
            [41.3111, 69.2406]
        ]
    ],
    imageUrl: "/sf-gallery-tobacco-04.jpg"
}

export default function AreaDetails() {
    const params = useParams()
    const currentLocale = useLocale();
    const areaData = mockAreaData

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href={`/${currentLocale}/areas`}>
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Orqaga
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left column - Map */}
                    <Card className="p-4">
                        <MapComponent
                            onAreaSelect={() => { }}
                            savedArea={{
                                coordinates: areaData.coordinates,
                                area: areaData.area
                            }}
                        />
                    </Card>

                    {/* Right column - Details */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h1 className="text-2xl font-bold mb-4">{areaData.title}</h1>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-5 w-5" />
                                    <span>{areaData.location}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600">
                                    <Ruler className="h-5 w-5" />
                                    <span>{areaData.area.toLocaleString()} gektar</span>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="text-lg font-semibold mb-2">Narxi</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {areaData.pricePerHectare.toLocaleString()} so'm / gektar
                                    </div>
                                    <div className="text-lg text-gray-600 mt-1">
                                        Jami: {(areaData.area * areaData.pricePerHectare).toLocaleString()} so'm
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="text-lg font-semibold mb-2">Tavsif</div>
                                    <p className="text-gray-600">{areaData.description}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <img
                                src={areaData.imageUrl || "/placeholder.svg"}
                                alt={areaData.title}
                                className="w-full h-64 object-cover rounded-lg"
                            />
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
