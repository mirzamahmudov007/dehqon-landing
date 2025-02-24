"use client";
import React, {useEffect} from "react";
import { Button, Select, Space } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";

export function Navbar() {
    const t = useTranslations("Navbar");
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = useLocale();

    useEffect(()=>{

    },[currentLocale])

    const options = routing.locales?.map((locale) => ({
        value: locale,
        label: locale === "uz" ? "Uzbek" : "Ўзбек",
    })) || [];

    function handleChange(newLocale) {
        const cleanPath = pathname.replace(/^\/[a-z]{2}/, "");
        const newPath = `/${newLocale}${cleanPath}`;
        router.replace(newPath);
    }


    return (
        <div className="bg-[#ebe6e6] items-center h-[80px] flex md:rounded-lg">
            <div className="md:px-3 px-2 container m-auto flex items-center justify-between">
                <span>Dehqon-uz</span>
                <ul className="flex items-center gap-5">
                    <li>
                        <Space wrap>
                            <Select
                                style={{ width: 90 }}
                                onChange={handleChange}
                                options={options}
                                value={currentLocale}
                            />
                        </Space>
                    </li>
                    <li>
                        <Button type="primary" shape="round" size={"large"}>
                            {t("loginBtn")}
                        </Button>
                    </li>
                    <li className="hidden md:block">
                        <Button type="primary" className="py-3" shape="round" size={"large"}>
                            {t("registerBtn")}
                        </Button>
                    </li>
                </ul>
            </div>
        </div>
    );
}
