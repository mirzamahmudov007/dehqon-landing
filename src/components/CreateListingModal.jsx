"use client"

import { useState } from "react"
import { Modal, Input, InputNumber, Select } from "antd"
import { MapComponent } from "./MapComponent"



export function CreateListingModal({ isOpen, onClose }) {
    const [selectedArea, setSelectedArea] = useState(0)
    const [pricePerHectare, setPricePerHectare] = useState(0)
    const [description, setDescription] = useState("")
    const [region, setRegion] = useState("")
    const [district, setDistrict] = useState("")

    const handleSubmit = () => {
        // Here you would typically send the data to your backend
        console.log({
            selectedArea,
            pricePerHectare,
            description,
            region,
            district,
        })
        onClose()
    }

    return (
        <Modal title="Yangi e'lon berish" open={isOpen} onOk={handleSubmit} onCancel={onClose} width={800}>
            <div className="space-y-4">
                <MapComponent onAreaSelect={setSelectedArea} />
                <div>Tanlangan maydon: {selectedArea.toFixed(2)} gektar</div>
                <InputNumber
                    placeholder="1 gektar narxi"
                    onChange={(value) => setPricePerHectare(value || 0)}
                    className="w-full"
                />
                <Input.TextArea placeholder="Tavsif" onChange={(e) => setDescription(e.target.value)} rows={4} />
                <Select
                    placeholder="Viloyatni tanlang"
                    onChange={(value) => setRegion(value)}
                    className="w-full"
                    options={[
                        { value: "toshkent", label: "Toshkent" },
                        { value: "samarqand", label: "Samarqand" },
                        // Add more regions as needed
                    ]}
                />
                <Select
                    placeholder="Tumanni tanlang"
                    onChange={(value) => setDistrict(value)}
                    className="w-full"
                    options={[
                        { value: "yunusobod", label: "Yunusobod" },
                        { value: "mirzo_ulugbek", label: "Mirzo Ulug'bek" },
                        // Add more districts as needed
                    ]}
                />
            </div>
        </Modal>
    )
}

