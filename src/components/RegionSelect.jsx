"use client"

import { Select } from "antd"

const options = [
    { value: "1", label: "Not Identified" },
    { value: "2", label: "Closed" },
    { value: "3", label: "Communicated" },
    { value: "4", label: "Identified" },
    { value: "5", label: "Resolved" },
    { value: "6", label: "Cancelled" },
]

export function RegionSelect({ placeholder }) {
    return (
        <Select
            showSearch
            style={{ width: 200 }}
            placeholder={placeholder}
            optionFilterProp="label"
            filterSort={(optionA, optionB) =>
                (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())
            }
            options={options}
        />
    )
}

