"use client"
import Image from "next/image"
import Link from "next/link"
import { useLocale } from "use-intl"

const AnnouncementCard = ({ imgUrl, label, href }) => {
    const currentLocale = useLocale();

    return (
        <Link
            href={`${currentLocale}/${href}`}
            className="group relative  block md:w-[30%] w-full overflow-hidden rounded-2xl bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-green-100"
        >
            <div className="relative z-10 flex flex-col items-center">
                <div className="mb-4 overflow-hidden rounded-2xl border-4 border-green-100 shadow-lg transform transition-transform duration-300 group-hover:scale-102 w-full aspect-[4/3]">
                    <Image
                        src={imgUrl || "/placeholder.svg"}
                        alt={label}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
                <h3 className="text-center text-xl font-medium text-green-800 group-hover:text-green-600 transition-colors duration-300 py-2">
                    {label}
                </h3>
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-green-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>
    )
}

export default AnnouncementCard

