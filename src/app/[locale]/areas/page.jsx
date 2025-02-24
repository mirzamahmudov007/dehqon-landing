"use client"
import { AreaCard } from "@/components/ui/AreaCard"
import { Navbar } from "@/components/navbar/Navbar"
import { RegionSelect } from "@/components/RegionSelect"
import { CreateListingButton } from "@/components/CreateListingButton"
import { useEffect, useState } from "react"

export default function Area() {
    const [datas, setDatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:9090/lands/getAll")
            .then(res => {
                if (!res.ok) {
                    throw new Error("Ma'lumotlarni yuklashda xatolik!");
                }
                return res.json();
            })
            .then(data => {
                setDatas(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center text-gray-600">Yuklanmoqda...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

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
                    {datas.map(item => (
                        <AreaCard
                            key={item.id}
                            id={item.id}
                            imageUrl={item.imageUrl || "/default-image.jpg"} 
                            title={item.region + " - " + item.district} 
                            area={item.selectedArea} 
                            pricePerHectare={item.pricePerHectare}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
