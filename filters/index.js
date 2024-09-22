const sharp = require('sharp');
const fs = require('fs');

const sharpFilters = {
    "filter-normal": (image) => image, // Sin cambios
    "filter-clarendon": (image) => image.modulate({ saturation: 1.35 }).linear(1.4, -10),
    "filter-gingham": (image) => image.modulate({ brightness: 1.2, saturation: 0.9 }).tint({ r: 230, g: 220, b: 190 }),
    "filter-moon": (image) => image.grayscale().modulate({ brightness: 1.1, contrast: 1.1 }),
    "filter-lark": (image) => image.modulate({ brightness: 1.2, saturation: 1.5 }).linear(0.9),
    "filter-reyes": (image) => image.modulate({ brightness: 1.1, saturation: 0.75 }).tint({ r: 220, g: 210, b: 180 }),
    "filter-juno": (image) => image.linear(1.15, -10).modulate({ saturation: 1.8 }),
    "filter-slumber": (image) => image.modulate({ saturation: 1.2, brightness: 1.05 }).tint({ r: 255, g: 240, b: 205 }),
    "filter-crema": (image) => image.modulate({ brightness: 1.1, saturation: 1.25 }).tint({ r: 255, g: 240, b: 210 }),
    "filter-ludwig": (image) => image.modulate({ brightness: 1.05, saturation: 1.25 }).linear(1.1),
    "filter-aden": (image) => image.modulate({ brightness: 1.2, saturation: 0.85 }).tint({ r: 255, g: 210, b: 170 }),
    "filter-perpetua": (image) => image.modulate({ brightness: 1.1, saturation: 1.25 }),
    "filter-amaro": (image) => image.modulate({ brightness: 1.1, saturation: 1.5 }).linear(0.9),
    "filter-mayfair": (image) => image.linear(1.1).modulate({ saturation: 1.1 }),
    "filter-valencia": (image) => image.modulate({ brightness: 1.1, saturation: 1.5 }).tint({ r: 255, g: 220, b: 180 }),
    "filter-xpro2": (image) => image.linear(1.5, -20).modulate({ saturation: 1.7 }).tint({ r: 200, g: 140, b: 50 }),
    "filter-lofi": (image) => image.linear(1.5).modulate({ saturation: 1.8 }),
    "filter-inkwell": (image) => image.grayscale(),
    "filter-nashville": (image) => image.modulate({ brightness: 1.15, saturation: 1.2 }).tint({ r: 255, g: 230, b: 200 })
};

const applyFilter = (inputPath, filterName) => new Promise((resolve, reject) => {

    const newNamePath = inputPath+'.temp';
    
    fs.renameSync(inputPath, newNamePath);

    // Cargar la imagen original
    const image = sharp(newNamePath);

    // Verificar si el filtro existe
    
    if (sharpFilters[filterName]) {
        // Aplicar el filtro correspondiente
        sharpFilters[filterName](image)
            .toFile(inputPath, (err, info) => {
                if (err) {
                    console.error('Error al aplicar filtro:', err);
                    reject(err);
                } else {
                    console.log('Imagen procesada con éxito:', info);
                    fs.unlinkSync(newNamePath);
                    resolve();
                }
            });
    } else {
        console.error('Filtro no encontrado:', filterName);
        reject(new Error('filtro no encontrado: ' + filterName));
    }
});

module.exports = applyFilter;