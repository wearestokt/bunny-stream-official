/**
 * Parses addPropertyControls from components/*.tsx and writes docs/components.generated.md
 * Run: npm run docs:components
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const COMPONENTS_DIR = path.join(ROOT, "components")
const OUT = path.join(ROOT, "docs", "components.generated.md")

const COMPONENT_ORDER = [
    "BunnyVideoPlayer",
    "BunnyPlayPauseButton",
    "BunnyProgressBar",
    "BunnyTimeDisplay",
    "BunnyVolumeSlider",
    "BunnyQualityPickerButton",
    "BunnyFullscreenButton",
]

function extractControlsInner(source, componentName) {
    const marker = `addPropertyControls(${componentName}, {`
    const start = source.indexOf(marker)
    if (start < 0) return null
    let i = start + marker.length - 1
    let depth = 0
    for (; i < source.length; i++) {
        const c = source[i]
        if (c === "{") depth++
        else if (c === "}") {
            depth--
            if (depth === 0) return source.slice(start + marker.length, i)
        }
    }
    return null
}

function parseDescription(chunk) {
    const backtick = chunk.match(/description:\s*`([^`]+)`/s)
    if (backtick) return backtick[1].replace(/\s+/g, " ").trim()
    const quoted = chunk.match(/description:\s*["']([^"']+)["']/)
    if (quoted) return quoted[1].trim()
    return ""
}

function parseDefault(chunk) {
    const m = chunk.match(/defaultValue:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+(?:\.\d+)?|true|false)/)
    if (!m) return ""
    return m[1].replace(/^["']|["']$/g, "")
}

function parseEntries(block, indent, pathPrefix) {
    const entries = []
    const lines = block.split("\n")
    let i = 0
    const keyRe = new RegExp(`^ {${indent}}([\\w]+): \\{`)

    while (i < lines.length) {
        const line = lines[i]
        const keyMatch = line.match(keyRe)
        if (!keyMatch) {
            i++
            continue
        }
        const key = keyMatch[1]
        let chunk = `${line}\n`
        let depth =
            (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
        let j = i + 1
        while (j < lines.length && depth > 0) {
            chunk += `${lines[j]}\n`
            depth +=
                (lines[j].match(/\{/g) || []).length -
                (lines[j].match(/\}/g) || []).length
            j++
        }

        const typeMatch = chunk.match(/type:\s*ControlType\.(\w+)/)
        const titleMatch = chunk.match(/title:\s*["']([^"']+)["']/)
        const type = typeMatch?.[1] ?? ""
        const title = titleMatch?.[1] ?? key
        const description = parseDescription(chunk)
        const defaultValue = parseDefault(chunk)
        const hidden = /\bhidden:\s*\(/.test(chunk) || /\bhidden:\s*true/.test(chunk)
        const fullPath = `${pathPrefix}${key}`

        if (type === "Object" && chunk.includes("controls:")) {
            const controlsIdx = chunk.indexOf("controls:")
            const afterControls = chunk.slice(controlsIdx)
            const innerStart = afterControls.indexOf("{")
            if (innerStart >= 0) {
                let k = innerStart
                let d = 0
                let innerBegin = -1
                for (; k < afterControls.length; k++) {
                    if (afterControls[k] === "{") {
                        d++
                        if (innerBegin < 0) innerBegin = k + 1
                    } else if (afterControls[k] === "}") {
                        d--
                        if (d === 0) {
                            entries.push(
                                ...parseEntries(
                                    afterControls.slice(innerBegin, k),
                                    indent + 4,
                                    `${fullPath}.`
                                )
                            )
                            break
                        }
                    }
                }
            }
            entries.push({
                path: fullPath,
                title,
                type: "Object (group)",
                defaultValue: "",
                description,
                hidden,
            })
        } else if (type) {
            entries.push({
                path: fullPath,
                title,
                type,
                defaultValue,
                description,
                hidden,
            })
        }

        i = j
    }

    return entries
}

function escapeCell(s) {
    return String(s).replace(/\|/g, "\\|").replace(/\n/g, " ")
}

function renderTable(entries) {
    if (entries.length === 0) return "_No properties parsed._\n"
    const lines = [
        "| Property | Panel title | Type | Default | Notes |",
        "| --- | --- | --- | --- | --- |",
    ]
    for (const e of entries) {
        const notes = [
            e.description,
            e.hidden ? "Conditional visibility" : "",
        ]
            .filter(Boolean)
            .join(" · ")
        lines.push(
            `| \`${e.path}\` | ${escapeCell(e.title)} | ${e.type} | ${escapeCell(e.defaultValue || "—")} | ${escapeCell(notes || "—")} |`
        )
    }
    return `${lines.join("\n")}\n`
}

function main() {
    const sections = [
        "<!-- AUTO-GENERATED by scripts/generate-component-docs.mjs — do not edit -->",
        "",
        `# Component properties (generated)`,
        "",
        `Generated: ${new Date().toISOString().slice(0, 10)}`,
        "",
        "Regenerate after changing `addPropertyControls` in `components/*.tsx`:",
        "",
        "```bash",
        "npm run docs:components",
        "```",
        "",
    ]

    for (const name of COMPONENT_ORDER) {
        const file = path.join(COMPONENTS_DIR, `${name}.tsx`)
        if (!fs.existsSync(file)) {
            sections.push(`## ${name}\n\n_File not found._\n`)
            continue
        }
        const source = fs.readFileSync(file, "utf8")
        const inner = extractControlsInner(source, name)
        if (!inner) {
            sections.push(`## ${name}\n\n_No addPropertyControls block found._\n`)
            continue
        }
        const entries = parseEntries(inner, 4, "")
        sections.push(`## ${name}\n`)
        sections.push(renderTable(entries))
    }

    fs.mkdirSync(path.dirname(OUT), { recursive: true })
    fs.writeFileSync(OUT, sections.join("\n"))
    console.log(`Wrote ${OUT}`)
}

main()
