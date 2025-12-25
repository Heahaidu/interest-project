"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@radix-ui/react-label"

// Dữ liệu quốc gia và thành phố
const countriesData = {
  vietnam: {
    name: "Việt Nam",
    cities: ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Nha Trang", "Huế"],
  },
  thailand: {
    name: "Thái Lan",
    cities: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Krabi", "Ayutthaya"],
  },
  singapore: {
    name: "Singapore",
    cities: ["Singapore"],
  },
  malaysia: {
    name: "Malaysia",
    cities: ["Kuala Lumpur", "Penang", "Johor Bahru", "Malacca", "Ipoh"],
  },
  indonesia: {
    name: "Indonesia",
    cities: ["Jakarta", "Bali", "Bandung", "Surabaya", "Yogyakarta", "Medan"],
  },
  philippines: {
    name: "Philippines",
    cities: ["Manila", "Cebu", "Davao", "Quezon City", "Makati", "Boracay"],
  },
}

export function Dropdown() {
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value)
    setSelectedCity("") // Reset city khi đổi quốc gia
  }

  const cities = selectedCountry ? countriesData[selectedCountry as keyof typeof countriesData].cities : []

  return (
    <div className="space-y-6">
      {/* Chọn Quốc Gia */}
      <div className="space-y-2">
        <Label htmlFor="country">Quốc gia</Label>
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger id="country" className="w-full">
            <SelectValue placeholder="Chọn quốc gia..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(countriesData).map(([key, country]) => (
              <SelectItem key={key} value={key}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chọn Thành Phố */}
      <div className="space-y-2">
        <Label htmlFor="city">Thành phố</Label>
        <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedCountry}>
          <SelectTrigger id="city" className="w-full">
            <SelectValue placeholder={selectedCountry ? "Chọn thành phố..." : "Chọn quốc gia trước..."} />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hiển thị kết quả đã chọn */}
      {selectedCountry && selectedCity && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Bạn đã chọn:</p>
          <p className="font-medium">
            {selectedCity}, {countriesData[selectedCountry as keyof typeof countriesData].name}
          </p>
        </div>
      )}
    </div>
  )
}
