export type Mood = 'Calm' | 'Happy' | 'Thoughtful' | 'Reflective' | 'Energized'

export type JournalEntry = {
  id: string
  title: string
  body: string
  mood: Mood
  tags: string[]
  createdAt: string
  updatedAt: string
}

const DATABASE_NAME = 'memento-journal'
const STORE_NAME = 'entries'
const DATABASE_VERSION = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak tersedia di browser ini.'))
      return
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt')
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Gagal membuka IndexedDB.'))
  })
}

export async function getEntries(): Promise<JournalEntry[]> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll()
    request.onsuccess = () => {
      database.close()
      resolve((request.result as JournalEntry[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
    }
    request.onerror = () => {
      database.close()
      reject(request.error ?? new Error('Gagal membaca jurnal.'))
    }
  })
}

export async function saveEntry(entry: JournalEntry): Promise<void> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(entry)
    request.onsuccess = () => {
      database.close()
      resolve()
    }
    request.onerror = () => {
      database.close()
      reject(request.error ?? new Error('Gagal menyimpan jurnal.'))
    }
  })
}

export async function deleteEntry(id: string): Promise<void> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(id)
    request.onsuccess = () => {
      database.close()
      resolve()
    }
    request.onerror = () => {
      database.close()
      reject(request.error ?? new Error('Gagal menghapus jurnal.'))
    }
  })
}
