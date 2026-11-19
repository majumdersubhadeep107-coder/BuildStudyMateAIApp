#!/usr/bin/env node
/**
 * StudyMate AI — Standalone Node.js HTTP Gateway & Static Server
 * Bridges REST requests (/api/study/*) to the Python 3 NLP & SM-2 Engine
 * (`backend/python/studymate_engine.py`) and serves static HTML/JS assets.
 *
 * Usage:
 *   node backend/node/server.mjs
 */

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '../..')
const PYTHON_SCRIPT = path.resolve(ROOT_DIR, 'backend/python/studymate_engine.py')
const PUBLIC_STANDALONE = path.resolve(ROOT_DIR, 'public/standalone')
const PORT = Number(process.env.STUDYMATE_NODE_PORT || 4050)

export function invokePythonStudyEngine(payload) {
  return new Promise((resolve, reject) => {
    const startedAt = performance.now()
    const child = execFile(
      'python3',
      [PYTHON_SCRIPT],
      { timeout: 5000, maxBuffer: 2 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message))
          return
        }
        try {
          const parsed = JSON.parse(stdout)
          resolve({
            ...parsed,
            runtime: {
              gateway: `Node.js ${process.version}`,
              pythonEngine: parsed.engine || 'Python 3',
              latencyMs: Math.round((performance.now() - startedAt) * 10) / 10,
            },
          })
        } catch (parseErr) {
          reject(parseErr)
        }
      },
    )

    child.stdin?.write(JSON.stringify(payload))
    child.stdin?.end()
  })
}

function sendJson(res, status, body) {
  const json = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(json)
}

export function createStudyMateServer() {
  return http.createServer(async (req, res) => {
    const reqUrl = (req.url || '/').split('?')[0]

    if (req.method === 'OPTIONS') {
      sendJson(res, 200, { ok: true })
      return
    }

    if (reqUrl === '/api/study/health' && req.method === 'GET') {
      try {
        const result = await invokePythonStudyEngine({ action: 'health' })
        sendJson(res, 200, result)
      } catch (err) {
        sendJson(res, 500, { ok: false, error: err instanceof Error ? err.message : String(err) })
      }
      return
    }

    if (reqUrl === '/api/study/analyze' && req.method === 'POST') {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', async () => {
        try {
          const payload = body ? JSON.parse(body) : {}
          const result = await invokePythonStudyEngine(payload)
          sendJson(res, 200, result)
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err instanceof Error ? err.message : String(err) })
        }
      })
      return
    }

    // Serve standalone HTML/JS client
    const targetFile = reqUrl === '/' ? 'index.html' : reqUrl.replace(/^\/+/, '')
    const resolved = path.resolve(PUBLIC_STANDALONE, targetFile)
    if (resolved.startsWith(PUBLIC_STANDALONE) && fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      const ext = path.extname(resolved)
      const mime =
        ext === '.html'
          ? 'text/html; charset=utf-8'
          : ext === '.js'
            ? 'application/javascript; charset=utf-8'
            : ext === '.css'
              ? 'text/css; charset=utf-8'
              : 'text/plain; charset=utf-8'
      res.writeHead(200, { 'Content-Type': mime })
      fs.createReadStream(resolved).pipe(res)
      return
    }

    sendJson(res, 404, { ok: false, error: 'Not found' })
  })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createStudyMateServer()
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`StudyMate Node.js Gateway listening on http://127.0.0.1:${PORT}`)
  })
}
