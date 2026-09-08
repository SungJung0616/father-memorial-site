$ErrorActionPreference = 'Stop'
$processorRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$infraRoot = Split-Path -Parent $processorRoot
$distRoot = Join-Path $infraRoot 'dist'
$packageRoot = Join-Path $distRoot 'image-processor-package'
$zipPath = Join-Path $distRoot 'image-processor.zip'

New-Item -ItemType Directory -Force -Path $distRoot | Out-Null
if (Test-Path -LiteralPath $packageRoot) { Remove-Item -LiteralPath $packageRoot -Recurse -Force }
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
New-Item -ItemType Directory -Force -Path $packageRoot | Out-Null

python -m pip install --requirement (Join-Path $processorRoot 'requirements.txt') --target $packageRoot --platform manylinux2014_x86_64 --implementation cp --python-version 3.12 --only-binary=:all:
Copy-Item -LiteralPath (Join-Path $processorRoot 'handler.py') -Destination $packageRoot
Copy-Item -LiteralPath (Join-Path $processorRoot 'image_utils.py') -Destination $packageRoot
Compress-Archive -Path (Join-Path $packageRoot '*') -DestinationPath $zipPath -CompressionLevel Optimal
Write-Host "Created $zipPath"
