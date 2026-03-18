$culture = (Get-Culture).TextInfo

Get-ChildItem -Filter *.pdf | ForEach-Object {

    $old = $_.Name
    $name = [System.IO.Path]::GetFileNameWithoutExtension($old)

    # arreglar basura del script anterior
    $name = $name -replace "\s-\s[lL]\s-\s", " - "
    $name = $name -replace "\s{2,}", " "

    # contracciones
    $name = $name -replace "Dont", "Don't"
    $name = $name -replace "Dont", "Don't"
    $name = $name -replace "Im ", "I'm "
    $name = $name -replace "Ive ", "I've "
    $name = $name -replace "Youve ", "You've "
    $name = $name -replace "Were ", "We're "

    # capitalizar
    $name = $culture.ToTitleCase($name.ToLower())

    # artista especiales
    $name = $name -replace "^Acdc", "ACDC"
    $name = $name -replace "Ufo", "UFO"
    $name = $name -replace "Ac Dc", "ACDC"

    # reconstruir nombre
    $new = "$name.pdf"

    if ($old -ne $new) {

        if (!(Test-Path $new)) {
            Rename-Item $_.Name $new
            Write-Host "$old  ->  $new"
        }

    }

}