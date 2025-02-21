#!/usr/bin/env node

const {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  cpSync,
  renameSync,
} = require("fs");
const { join, resolve } = require("path");
const { execSync } = require("child_process");
const { argv } = require("process");

const rootDir = resolve(__dirname, "..");
const srcDir = join(rootDir, "src");
const manifestPath = join(srcDir, "mod.manifest");
const tempDir = join(rootDir, "temp_build");

const flags = argv.slice(2);
const isDev = flags.includes("--dev");
const isProd = flags.includes("--prod");
const isHelp = flags.includes("--help");

if (isHelp) {
  console.log(`
Usage: node build.js [--dev] [--prod] [--help]
--dev   Deploys the mod for in-game development testing.
--prod  Builds the mod for production with adjusted Lua settings.
--help  Displays this help message.
`);
  process.exit(0);
}

if (!existsSync(manifestPath)) {
  console.error("ERROR: mod.manifest not found in src!");
  process.exit(1);
}

const manifest = readFileSync(manifestPath, "utf8");
const modID = /<modid>(.+?)<\/modid>/.exec(manifest)?.[1];
const modVersion = /<version>(.+?)<\/version>/.exec(manifest)?.[1];
const modName = /<name>(.+?)<\/name>/.exec(manifest)?.[1];

if (!modID || !modVersion || !modName) {
  console.error("ERROR: Missing required fields in mod.manifest.");
  process.exit(1);
}

const cleanBuildDir = () => {
  rmSync(tempDir, { recursive: true, force: true });
  mkdirSync(tempDir, { recursive: true });
};

const prepareBuild = (debugFlag, hardcoreFlag) => {
  cpSync(srcDir, tempDir, { recursive: true });

  const luaFile = join(tempDir, "Data", "Scripts", "Startup", "map_lock_main.lua")

  if (!existsSync(luaFile)) {
    console.error(`ERROR: '${luaFile}' not found.`);
    process.exit(1);
  }

  const content = readFileSync(luaFile, "utf8")
    .replace(/IS_DEBUG = (true|false)/, `IS_DEBUG = ${debugFlag}`)
  writeFileSync(luaFile, content, "utf8");
};

const removeScriptsDir = () => {
  const scriptsDir = join(tempDir, "Data", "Scripts");
  if (existsSync(scriptsDir)) {
    rmSync(scriptsDir, { recursive: true, force: true });
  }
};

const compressToPak = (sourceDir, outputPakPath) => {
  const tempZipPath = outputPakPath.replace(/\.pak$/, ".zip");
  if (existsSync(tempZipPath)) rmSync(tempZipPath);

  execSync(
    `powershell.exe Compress-Archive -Path "${sourceDir}\\*" -DestinationPath "${tempZipPath}" -Force`,
  );

  if (existsSync(tempZipPath)) {
    renameSync(tempZipPath, outputPakPath);
  }

  if (!existsSync(outputPakPath)) {
    console.error(`ERROR: Failed to create '${outputPakPath}'.`);
    process.exit(1);
  }
};

const packData = () => {
  const dataDir = join(tempDir, "Data");
  const modPak = join(dataDir, `${modID}.pak`);

  compressToPak(dataDir, modPak);

  removeScriptsDir();
};

const packMod = (outputName) => {
  const outputZip = join(rootDir, `${outputName}_${modVersion}.zip`);
  compressToPak(tempDir, outputZip);

  rmSync(tempDir, { recursive: true, force: true });

  console.log(`Built ${outputName} mod: ${outputZip}`);
}

const build = () => {
  console.log("Building...");
  cleanBuildDir();
  prepareBuild(false, true);
  packData();
  packMod(`${modName}`)
};

const deployDev = () => {
  const steamModPath = join(
    "C:",
    "Steam",
    "steamapps",
    "common",
    "KingdomComeDeliverance2",
    "Mods",
    modName,
  );
  const modOrderPath = join(
    "C:",
    "Steam",
    "steamapps",
    "common",
    "KingdomComeDeliverance2",
    "Mods",
    "mod_order.txt",
  );

  rmSync(steamModPath, { recursive: true, force: true });
  mkdirSync(steamModPath, { recursive: true });

  console.log("Deploying development version...");
  cleanBuildDir();
  prepareBuild(true, false);
  packData();

  cpSync(tempDir, steamModPath, { recursive: true });

  const modOrder = existsSync(modOrderPath)
    ? readFileSync(modOrderPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
    : [];
  if (!modOrder.includes(modName)) {
    modOrder.push(modName);
    writeFileSync(modOrderPath, modOrder.join("\n"));
  }

  console.log(`Mod deployed for development: ${steamModPath}`);
};

if (isProd) {
  build();
}

if (isDev) {
  deployDev();
}
