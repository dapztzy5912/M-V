import formidable from 'formidable'
import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = new formidable.IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: 'Gagal memproses gambar' })

    const file = files.image
    const fileStream = fs.createReadStream(file.filepath)

    const formData = new FormData()
    formData.append('image', fileStream, {
      filename: file.originalFilename,
      contentType: file.mimetype
    })
    formData.append('scale', '2')

    try {
      const response = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          'accept': 'application/json',
          'x-client-version': 'web',
          'x-locale': 'en'
        },
        body: formData
      })

      const data = await response.json()
      if (!data?.result_url) {
        return res.status(500).json({ message: 'Gagal mendapatkan URL hasil.' })
      }

      return res.status(200).json({ result_url: data.result_url })
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Terjadi kesalahan.' })
    }
  })
}
