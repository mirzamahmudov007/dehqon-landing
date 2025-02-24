"use client"

import Image from "next/image"
import { Button } from "antd"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"


function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function AreaCard({ id, imageUrl, title, area, pricePerHectare }) {
    const currentLocale = useLocale();
    const router = useRouter()

    const handleClick = () => {
        router.push(`/${currentLocale}/areas/${id}`)
    }

    return (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative h-48 w-full">
                <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={title}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
                <div className="text-sm text-gray-600 mb-4">
                    <p>Umumiy maydon: {formatNumber(Number(area).toFixed(2))} gektar</p>
                    <p>Narxi: {formatNumber(pricePerHectare)} so'm/gektar</p>
                </div>
                <Button
                    type="primary"
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={handleClick}
                >
                    Batafsil
                </Button>
            </div>
        </div>
    )
}
