#!/usr/bin/env node

/**
 * Script de build para Electron
 *
 * Este script prepara o Next.js em modo standalone e depois empacota com Electron Forge
 */

const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🚀 Iniciando build do Electron...\n');

// Função helper para executar comandos
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 Executando: ${command} ${args.join(' ')}\n`);

    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });

    process.on('error', reject);
  });
}

async function main() {
  try {
    // Passo 1: Build do Next.js em modo standalone
    console.log('📦 Passo 1/4: Buildando Next.js em modo standalone...');
    await runCommand('npm', ['run', 'build:electron'], {
      env: { ...process.env, ELECTRON: 'true' }
    });

    // Passo 2: Verificar se o build standalone foi criado
    console.log('\n✅ Passo 2/4: Verificando build standalone...');
    const standalonePath = path.join(__dirname, '.next', 'standalone');
    if (!fs.existsSync(standalonePath)) {
      throw new Error('Build standalone não foi criado! Verifique next.config.ts');
    }
    console.log('   ✓ Build standalone encontrado');

    // Passo 3: Copiar arquivos estáticos para standalone
    console.log('\n📁 Passo 3/4: Copiando arquivos estáticos...');
    const publicSource = path.join(__dirname, 'public');
    const publicDest = path.join(standalonePath, 'public');

    if (fs.existsSync(publicSource)) {
      fs.copySync(publicSource, publicDest);
      console.log('   ✓ public/ copiado');
    }

    const staticSource = path.join(__dirname, '.next', 'static');
    const staticDest = path.join(standalonePath, '.next', 'static');

    if (fs.existsSync(staticSource)) {
      fs.copySync(staticSource, staticDest);
      console.log('   ✓ .next/static copiado');
    }

    // Passo 4: Executar electron-forge make
    console.log('\n⚡ Passo 4/4: Empacotando com Electron Forge...');
    await runCommand('npx', ['electron-forge', 'make']);

    console.log('\n✅ Build concluído com sucesso!');
    console.log('\n📦 Executável disponível em: ./out/make/\n');

  } catch (error) {
    console.error('\n❌ Erro durante o build:', error.message);
    process.exit(1);
  }
}

main();
