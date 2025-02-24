import AnnouncementCard from "../ui/AnnouncementCard";
import areaImg from "./../../../public/sf-gallery-tobacco-04.jpg"
import productsImg from "./../../../public/arbuz_nedorogo_s_polej.jpg.554x336_q85_crop.jpg"
import transportImg from "./../../../public/premium_photo-1661824826788-f97cff9761af.jpg"

export default function Announcements() {
    return (
        <div className="py-20 container mx-auto px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-green-800 mb-3">E'lonlar</h1>
                <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
            </div>
            <div className="flex justify-between flex-wrap gap-6">
                <AnnouncementCard
                    href={"/areas"}
                    imgUrl={areaImg}
                    label={"Yer ijarasi e'lonlari"}
                />
                <AnnouncementCard
                    href={"/"}
                    imgUrl={transportImg}
                    label={"Texnika e'lonlari"}
                />
                <AnnouncementCard
                    href={"/"}
                    imgUrl={productsImg}
                    label={"Dehqonchilik mahsulotlari e'lonlari"}
                />
            </div>
        </div>
    )
}

