# Build app icons from the official Avon logo (icons/avon-logo.png). Run: powershell -File scripts/make-icons.ps1
# The logo is only resized; maskable/apple versions add Avon Red padding around it, never redraw it.
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$src = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'icons\avon-logo.png'))
$red = $src.GetPixel(700, 500)  # use the logo's own red so padding blends in

# TileFlipXY stops GDI+ from blending transparent pixels into the scaled edge
$attr = New-Object System.Drawing.Imaging.ImageAttributes
$attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)

function Save-Icon($name, $size, $scale) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear($red)
  $s = [int]($size * $scale); $o = [int](($size - $s) / 2)
  # crop the 4px anti-aliased edge of the source square so no seam shows
  $dest = New-Object System.Drawing.Rectangle $o, $o, $s, $s
  $g.DrawImage($src, $dest, 4, 4, ($src.Width - 8), ($src.Height - 8), [System.Drawing.GraphicsUnit]::Pixel, $attr)
  $bmp.Save((Join-Path $root "icons\$name"), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Write-Output "$name $size"
}
Save-Icon 'icon-192.png' 192 1
Save-Icon 'icon-512.png' 512 1
Save-Icon 'maskable-512.png' 512 0.7
Save-Icon 'apple-touch-icon.png' 180 1
Save-Icon 'favicon-32.png' 32 1
Save-Icon 'shortcut-today.png' 96 1
Save-Icon 'logo-64.png' 64 1
$src.Dispose()
