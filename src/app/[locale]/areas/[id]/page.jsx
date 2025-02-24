"use client"

import { MapComponentDetails } from "@/components/MapComponentDetails"
import { Navbar } from "@/components/navbar/Navbar"
import { Button, Card } from "antd"
import { ArrowLeft, MapPin, Ruler } from "lucide-react"
import { useLocale } from "next-intl"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"


export default function AreaDetails() {
    const params = useParams()
    const currentLocale = useLocale()
    const [listingData , setData] = useState({});
    const totalPrice = listingData.selectedArea * listingData.pricePerHectare
    

    useEffect(()=>{
        fetch(`http://localhost:9090/lands/getId/${params?.id}`).then(res => res.json())
        .then(data => setData(data))
    },[])

    



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
                                    <span>{listingData?.selectedArea?.toFixed(2)} gektar</span>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="text-lg font-semibold mb-2">Narxi</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {listingData?.pricePerHectare?.toLocaleString()} so'm / gektar
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

                        {/* {listingData.imageUrl && (
                            <Card>
                                <img
                                    src={listingData?.imageUrl || "/placeholder.svg"}
                                    alt={listingData?.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </Card>
                        )} */}
                    </div>
                </div>
            </main>
        </div>
    )
}

