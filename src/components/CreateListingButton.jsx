"use client"

import { useState } from "react"
import { Button } from "antd"
import { CreateListingModal } from "./CreateListingModal"

export function CreateListingButton() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Button type="primary" onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-600">
                E'lon berish
            </Button>
            <CreateListingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}

