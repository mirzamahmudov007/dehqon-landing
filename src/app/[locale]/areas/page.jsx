import { AreaCard } from "@/components/ui/AreaCard"
import { Navbar } from "@/components/navbar/Navbar"
import { RegionSelect } from "@/components/RegionSelect"
import { CreateListingButton } from "@/components/CreateListingButton"

export default function Area() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
                    <div className="flex flex-wrap gap-4">
                        <RegionSelect placeholder="Viloyatni tanlang" />
                        <RegionSelect placeholder="Tumanni tanlang" />
                    </div>
                    <CreateListingButton />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <AreaCard
                        id="1" // Add the id prop
                        imageUrl="/sf-gallery-tobacco-04.jpg"
                        title="Toshkent shahri"
                        area={33400}
                        pricePerHectare={15000000}
                    />
                    {/* Add more AreaCard components here */}
                </div>
            </main>
        </div>
    )
}

