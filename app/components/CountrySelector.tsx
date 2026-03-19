'use client'

import { useState, useEffect } from 'react'

interface Country {
  code: string
  name: string
  name_zh: string
  region: string
}

interface CountrySelectorProps {
  selectedCountry: string | null
  onCountrySelect: (countryCode: string) => void
}

export default function CountrySelector({ selectedCountry, onCountrySelect }: CountrySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries')
      const result = await response.json()
      if (result.success) {
        setCountries(result.data)
      }
    } catch (err) {
      console.error('Error fetching countries:', err)
    } finally {
      setLoading(false)
    }
  }

  const regions = Array.from(new Set(countries.map(c => c.region)))
  const popularCountries = countries.filter(c => ['SG', 'MY', 'TH', 'US', 'DE', 'AU'].includes(c.code))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">选择目标市场</h3>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">加载国家列表...</p>
        </div>
      )}

      {!loading && countries.length > 0 && (
        <>
          {/* Quick Select */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">热门市场</h4>
            <div className="flex flex-wrap gap-2">
              {popularCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => onCountrySelect(country.code)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCountry === country.code
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {country.name_zh}
                </button>
              ))}
            </div>
          </div>

          {/* All Countries by Region */}
          <div className="space-y-4">
            {regions.map((region) => (
              <div key={region}>
                <h4 className="text-sm font-medium text-gray-500 mb-2">{region}</h4>
                <div className="flex flex-wrap gap-2">
                  {countries.filter(c => c.region === region).map((country) => (
                    <button
                      key={country.code}
                      onClick={() => onCountrySelect(country.code)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedCountry === country.code
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {country.name_zh}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Country Info */}
          {selectedCountry && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">
                    {countries.find(c => c.code === selectedCountry)?.code}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {countries.find(c => c.code === selectedCountry)?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {countries.find(c => c.code === selectedCountry)?.name_zh}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && countries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>暂无国家数据</p>
        </div>
      )}
    </div>
  )
}
