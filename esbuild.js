import * as esbuild from "esbuild"
import minimist from "minimist"
import npmDTS from "npm-dts"
import pkg from "./package.json" with { type: "json" }

const { Generator } = npmDTS
const argv = minimist(process.argv.slice(2))

const shouldWatch = !!argv.w

const baseOptions = {
    entryPoints: [`src/index.ts`],
    sourcemap: true,
    bundle: true,
    assetNames: "assets/[dir][name]-[hash]",
    metafile: true,
    loader: {
        ".woff": "dataurl",
        ".woff2": "dataurl",
        ".png": "file",
        ".jpg": "file",
        ".webp": "file",
        ".basis": "file",
        ".ktx2": "file",
        ".ktx": "file",
        ".stage": "text",
    },
    plugins: [],
}

const esmOptions = {
    ...baseOptions,
    format: "esm",
    target: ["esnext"],
    outfile: pkg.main,
    define: {
        global: "window",
    },
}

async function build() {
    new Generator({
        // relative to tsconfig rootdir
        entry: "index.ts",
        output: "dist/index.d.ts",
        // needs to be forced otherwise will fail when trying to produce react types
        force: true,
    }).generate()

    if (shouldWatch) {
        let esmContext = await esbuild.context(esmOptions)
        await esmContext.watch()
        return
    }

    await esbuild.build(esmOptions)
}

build()
