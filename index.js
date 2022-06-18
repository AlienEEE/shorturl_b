const express = require('express')
const ShortUniqueId = require('short-unique-id')
const { getConnection } = require('./database')
const cors = require('cors')
const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())

app.post('/api/short-url', async (req, res) => {
  const long_url = req.body.long_url
  const uid = new ShortUniqueId({ length: 10 })
  const uniqueID = uid()
  const sql = `INSERT INTO url(long_url, short_url) VALUES('${long_url}','${uniqueID}')`

  try {
    const db = await getConnection()

    const [rows] = await db.execute(sql)

    res.status(201).json({ status: 'success', short_url: uniqueID })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error })
  }
})

app.get('/api/get-all-short-urls', async (req, res) => {
  try {
    const db = await getConnection()

    const [rows] = await db.execute(`SELECT * FROM url`)

    res.status(200).json(rows)
  } catch (error) {
    res.status(500).json({ status: 'error', message: error })
  }
})

app.get('/:short_url', async (req, res) => {
  const short_url = req.params.short_url
  try {
    const db = await getConnection()
    let sql = `SELECT * FROM url WHERE short_url='${short_url}' LIMIT 1`

    const [rows] = await db.execute(sql)

    const { url_id, count, long_url } = rows[0]
    sql = `UPDATE url SET count=${count + 1} WHERE url_id='${url_id}'`

    await db.execute(sql)

    res.redirect(long_url)
  } catch (error) {
    res.status(500).json({ status: 'error', message: error })
  }
})

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
)
