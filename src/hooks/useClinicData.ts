import { useEffect, useState } from 'react'
import type { ClinicData } from '../types'
import { INITIAL_DATA } from '../data/initialData'

const API_BASE = 'http://localhost:4000'
const RESOURCES: Array<keyof ClinicData> = [
  'users',
  'patients',
  'visits',
  'queue',
  'prescriptions',
  'bills',
]

export const useClinicData = () => {
  const [data, setData] = useState<ClinicData>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        const entries = await Promise.all(
          RESOURCES.map(async (resource) => {
            const response = await fetch(`${API_BASE}/${resource}`, {
              signal: controller.signal,
            })
            if (!response.ok) {
              throw new Error(`Gagal memuat ${resource}`)
            }
            const payload = await response.json()
            return [resource, payload] as const
          }),
        )

        const nextData = entries.reduce((acc, [resource, payload]) => {
          return { ...acc, [resource]: payload }
        }, {} as ClinicData)

        setData(nextData)
        setError(null)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Mode offline: menggunakan data mock (db.json belum dijalankan)')
          setData(INITIAL_DATA)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => controller.abort()
  }, [])

  return { data, setData, loading, error }
}

