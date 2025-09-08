(function () {
  // waterfall plot render
  window.waterfallPlot = {
    renderWaterfallImage: () => renderWaterfallImage(),
    renderWaterfallImageAsync: () => {
      return common.executeWithStatusAsync('Rendering waterfall...', () => renderWaterfallImage());
    },
    renderSpectrumImage: () => renderSpectrumImage(),
    renderSpectrumImageAsync: () => {
      if (!waterfallState.previewEnabled) {
        return new Promise((r) => r());
      }

      return common.executeWithStatusAsync('Rendering spectrum...', () => {
        renderSpectrumImage();
      });
    },
    renderChannelSelectionAsync: () => {
      return common.executeWithStatusAsync('Rendering channel selection...', () => renderChannelSelection());
    },
    renderSpectrumSelectionAsync: () => {
      return common.executeWithStatusAsync('Rendering spectrum selection...', () => renderSpectrumSelection());
    },
  }

  const ironPaletteHex = ["#00000a", "#000014", "#00001e", "#000025", "#00002a", "#00002e", "#000032", "#000036", "#00003a", "#00003e", "#000042", "#000046", "#00004a", "#00004f", "#000052", "#010055", "#010057", "#020059", "#02005c", "#03005e", "#040061", "#040063", "#050065", "#060067", "#070069", "#08006b", "#09006e", "#0a0070", "#0b0073", "#0c0074", "#0d0075", "#0d0076", "#0e0077", "#100078", "#120079", "#13007b", "#15007c", "#17007d", "#19007e", "#1b0080", "#1c0081", "#1e0083", "#200084", "#220085", "#240086", "#260087", "#280089", "#2a0089", "#2c008a", "#2e008b", "#30008c", "#32008d", "#34008e", "#36008e", "#38008f", "#390090", "#3b0091", "#3c0092", "#3e0093", "#3f0093", "#410094", "#420095", "#440095", "#450096", "#470096", "#490096", "#4a0096", "#4c0097", "#4e0097", "#4f0097", "#510097", "#520098", "#540098", "#560098", "#580099", "#5a0099", "#5c0099", "#5d009a", "#5f009a", "#61009b", "#63009b", "#64009b", "#66009b", "#68009b", "#6a009b", "#6c009c", "#6d009c", "#6f009c", "#70009c", "#71009d", "#73009d", "#75009d", "#77009d", "#78009d", "#7a009d", "#7c009d", "#7e009d", "#7f009d", "#81009d", "#83009d", "#84009d", "#86009d", "#87009d", "#89009d", "#8a009d", "#8b009d", "#8d009d", "#8f009c", "#91009c", "#93009c", "#95009c", "#96009b", "#98009b", "#99009b", "#9b009b", "#9c009b", "#9d009b", "#9f009b", "#a0009b", "#a2009b", "#a3009b", "#a4009b", "#a6009a", "#a7009a", "#a8009a", "#a90099", "#aa0099", "#ab0099", "#ad0099", "#ae0198", "#af0198", "#b00198", "#b00198", "#b10197", "#b20197", "#b30196", "#b40296", "#b50295", "#b60295", "#b70395", "#b80395", "#b90495", "#ba0495", "#ba0494", "#bb0593", "#bc0593", "#bd0593", "#be0692", "#bf0692", "#bf0692", "#c00791", "#c00791", "#c10890", "#c10990", "#c20a8f", "#c30a8e", "#c30b8e", "#c40c8d", "#c50c8c", "#c60d8b", "#c60e8a", "#c70f89", "#c81088", "#c91187", "#ca1286", "#ca1385", "#cb1385", "#cb1484", "#cc1582", "#cd1681", "#ce1780", "#ce187e", "#cf187c", "#cf197b", "#d01a79", "#d11b78", "#d11c76", "#d21c75", "#d21d74", "#d31e72", "#d32071", "#d4216f", "#d4226e", "#d5236b", "#d52469", "#d62567", "#d72665", "#d82764", "#d82862", "#d92a60", "#da2b5e", "#da2c5c", "#db2e5a", "#db2f57", "#dc2f54", "#dd3051", "#dd314e", "#de324a", "#de3347", "#df3444", "#df3541", "#df363d", "#e0373a", "#e03837", "#e03933", "#e13a30", "#e23b2d", "#e23c2a", "#e33d26", "#e33e23", "#e43f20", "#e4411d", "#e4421c", "#e5431b", "#e54419", "#e54518", "#e64616", "#e74715", "#e74814", "#e74913", "#e84a12", "#e84c10", "#e84c0f", "#e94d0e", "#e94d0d", "#ea4e0c", "#ea4f0c", "#eb500b", "#eb510a", "#eb520a", "#eb5309", "#ec5409", "#ec5608", "#ec5708", "#ec5808", "#ed5907", "#ed5a07", "#ed5b06", "#ee5c06", "#ee5c05", "#ee5d05", "#ee5e05", "#ef5f04", "#ef6004", "#ef6104", "#ef6204", "#f06303", "#f06403", "#f06503", "#f16603", "#f16603", "#f16703", "#f16803", "#f16902", "#f16a02", "#f16b02", "#f16b02", "#f26c01", "#f26d01", "#f26e01", "#f36f01", "#f37001", "#f37101", "#f37201", "#f47300", "#f47400", "#f47500", "#f47600", "#f47700", "#f47800", "#f47a00", "#f57b00", "#f57c00", "#f57e00", "#f57f00", "#f68000", "#f68100", "#f68200", "#f78300", "#f78400", "#f78500", "#f78600", "#f88700", "#f88800", "#f88800", "#f88900", "#f88a00", "#f88b00", "#f88c00", "#f98d00", "#f98d00", "#f98e00", "#f98f00", "#f99000", "#f99100", "#f99200", "#f99300", "#fa9400", "#fa9500", "#fa9600", "#fb9800", "#fb9900", "#fb9a00", "#fb9c00", "#fc9d00", "#fc9f00", "#fca000", "#fca100", "#fda200", "#fda300", "#fda400", "#fda600", "#fda700", "#fda800", "#fdaa00", "#fdab00", "#fdac00", "#fdad00", "#fdae00", "#feaf00", "#feb000", "#feb100", "#feb200", "#feb300", "#feb400", "#feb500", "#feb600", "#feb800", "#feb900", "#feb900", "#feba00", "#febb00", "#febc00", "#febd00", "#febe00", "#fec000", "#fec100", "#fec200", "#fec300", "#fec400", "#fec500", "#fec600", "#fec700", "#fec800", "#fec901", "#feca01", "#feca01", "#fecb01", "#fecc02", "#fecd02", "#fece03", "#fecf04", "#fecf04", "#fed005", "#fed106", "#fed308", "#fed409", "#fed50a", "#fed60a", "#fed70b", "#fed80c", "#fed90d", "#ffda0e", "#ffda0e", "#ffdb10", "#ffdc12", "#ffdc14", "#ffdd16", "#ffde19", "#ffde1b", "#ffdf1e", "#ffe020", "#ffe122", "#ffe224", "#ffe226", "#ffe328", "#ffe42b", "#ffe42e", "#ffe531", "#ffe635", "#ffe638", "#ffe73c", "#ffe83f", "#ffe943", "#ffea46", "#ffeb49", "#ffeb4d", "#ffec50", "#ffed54", "#ffee57", "#ffee5b", "#ffee5f", "#ffef63", "#ffef67", "#fff06a", "#fff06e", "#fff172", "#fff177", "#fff17b", "#fff280", "#fff285", "#fff28a", "#fff38e", "#fff492", "#fff496", "#fff49a", "#fff59e", "#fff5a2", "#fff5a6", "#fff6aa", "#fff6af", "#fff7b3", "#fff7b6", "#fff8ba", "#fff8bd", "#fff8c1", "#fff8c4", "#fff9c7", "#fff9ca", "#fff9cd", "#fffad1", "#fffad4", "#fffbd8", "#fffcdb", "#fffcdf", "#fffde2", "#fffde5", "#fffde8", "#fffeeb", "#fffeee", "#fffef1", "#fffef4"];
  const ironPaletteRGB = ironPaletteHex.map(c => hexToRGB(c));

  const glowPaletteHex = ["#060101", "#080101", "#0A0102", "#0C0202", "#0D0203", "#0F0203", "#110203", "#130204", "#150204", "#170204", "#180305", "#1A0305", "#1C0305", "#1E0306", "#200406", "#220407", "#230407", "#250407", "#270508", "#290508", "#2B0508", "#2D0509", "#2F0509", "#310509", "#330509", "#35060A", "#37060A", "#39060A", "#3B070B", "#3C070C", "#3E070C", "#40070C", "#42080D", "#43080D", "#45080D", "#47080D", "#49080E", "#4B080E", "#4D080E", "#4F090F", "#510910", "#530910", "#550910", "#580A11", "#5B0A11", "#5E0A11", "#610B12", "#640B13", "#670C14", "#690C14", "#6A0C15", "#6C0C15", "#6E0C15", "#700C15", "#710D16", "#730D16", "#750D16", "#770D16", "#790E17", "#7B0E17", "#7D0E18", "#7F0F18", "#810F19", "#830F19", "#850F19", "#870F1A", "#880F1A", "#8A0F1A", "#8C0F1A", "#8E101B", "#90101B", "#92101C", "#93111C", "#95111D", "#97111D", "#99111D", "#9B121E", "#9D121E", "#9F121E", "#A0121E", "#A2121F", "#A4121F", "#A61220", "#A81320", "#AA1321", "#AC1321", "#AE1321", "#B01422", "#B21422", "#B41422", "#B61523", "#B71523", "#B91523", "#BB1523", "#BD1524", "#BE1524", "#C01524", "#C21525", "#C41625", "#C61626", "#C81626", "#CA1727", "#CC1727", "#CD1727", "#CE1827", "#CE1826", "#CF1926", "#CF1A26", "#CF1A25", "#D01B25", "#D01C24", "#D11D24", "#D11D23", "#D21E23", "#D21E23", "#D31F23", "#D31F22", "#D42022", "#D42122", "#D42121", "#D52221", "#D52320", "#D62420", "#D6241F", "#D7251F", "#D7251F", "#D8261F", "#D8261E", "#D9271E", "#D9271E", "#D9281E", "#DA281D", "#DA291D", "#DB2A1C", "#DB2B1C", "#DC2C1B", "#DC2C1B", "#DD2D1B", "#DD2D1A", "#DE2E1A", "#DE2E1A", "#DE2F1A", "#DF3019", "#DF3019", "#E03118", "#E03218", "#E13317", "#E13317", "#E23417", "#E23416", "#E33516", "#E33516", "#E43615", "#E43715", "#E43715", "#E53815", "#E53914", "#E63A14", "#E63A14", "#E73B13", "#E73B13", "#E83C12", "#E83D12", "#E93D11", "#E93E11", "#E93E11", "#EA3F11", "#EA3F10", "#EB4010", "#EB4110", "#EC410F", "#EC420F", "#ED430E", "#ED440E", "#EE440D", "#EE450D", "#EE450D", "#EF460D", "#EF460C", "#F0470C", "#F0480C", "#F1480B", "#F1490B", "#F24A0A", "#F24B0A", "#F34B09", "#F34C09", "#F34C09", "#F44D09", "#F44D08", "#F54E08", "#F54E08", "#F64F08", "#F75007", "#F75007", "#F75106", "#F85206", "#F85305", "#F85305", "#F95405", "#F95404", "#FA5504", "#FA5504", "#FB5604", "#FC5703", "#FC5703", "#FC5802", "#FD5902", "#FD5A01", "#FD5A01", "#FE5B01", "#FE5B00", "#FF5C00", "#FF5D00", "#FF5E00", "#FF5F00", "#FF6000", "#FF6100", "#FF6200", "#FF6400", "#FF6500", "#FF6600", "#FF6700", "#FF6900", "#FF6A00", "#FF6B00", "#FF6C00", "#FF6D00", "#FF6E00", "#FF6F00", "#FF7100", "#FF7200", "#FF7300", "#FF7400", "#FF7500", "#FF7600", "#FF7700", "#FF7800", "#FF7900", "#FF7B00", "#FF7C00", "#FF7E00", "#FF7F00", "#FF8000", "#FF8100", "#FF8200", "#FF8300", "#FF8400", "#FF8500", "#FF8600", "#FF8800", "#FF8900", "#FF8A00", "#FF8B00", "#FF8C00", "#FF8D00", "#FF8E00", "#FF8F00", "#FF9100", "#FF9200", "#FF9300", "#FF9500", "#FF9600", "#FF9700", "#FF9800", "#FF9900", "#FF9A00", "#FF9B00", "#FF9C00", "#FF9D00", "#FF9E00", "#FFA000", "#FFA100", "#FFA200", "#FFA300", "#FFA400", "#FFA600", "#FFA700", "#FFA800", "#FFA900", "#FFAA00", "#FFAC00", "#FFAD00", "#FFAE00", "#FFAF00", "#FFB000", "#FFB100", "#FFB200", "#FFB300", "#FFB400", "#FFB500", "#FFB600", "#FFB800", "#FFB900", "#FFBA00", "#FFBC00", "#FFBD00", "#FFBE00", "#FFBF00", "#FFC000", "#FFC100", "#FFC200", "#FFC400", "#FFC500", "#FFC600", "#FFC700", "#FFC800", "#FFC900", "#FFCA00", "#FFCB00", "#FFCC00", "#FFCE00", "#FFCF00", "#FFD000", "#FFD200", "#FFD300", "#FFD400", "#FFD500", "#FFD600", "#FFD700", "#FFD800", "#FFD900", "#FFDA01", "#FFDA03", "#FFDB05", "#FFDB08", "#FFDB0A", "#FFDB0C", "#FFDC0F", "#FFDC11", "#FFDD14", "#FFDD16", "#FFDE18", "#FFDE1A", "#FFDE1D", "#FFDF1F", "#FFDF22", "#FFDF24", "#FFE026", "#FFE028", "#FFE02B", "#FFE02D", "#FFE12F", "#FFE132", "#FFE134", "#FFE237", "#FFE239", "#FFE33C", "#FFE33E", "#FFE440", "#FFE442", "#FFE445", "#FFE447", "#FFE549", "#FFE54B", "#FFE54E", "#FFE550", "#FFE652", "#FFE655", "#FFE757", "#FFE75A", "#FFE85C", "#FFE85F", "#FFE861", "#FFE963", "#FFE965", "#FFE968", "#FFE96A", "#FFEA6D", "#FFEA6F", "#FFEA71", "#FFEB73", "#FFEB76", "#FFEB78", "#FFEC7A", "#FFEC7D", "#FFED7F", "#FFED82", "#FFED84", "#FFEE86", "#FFEE88", "#FFEE8A", "#FFEF8D", "#FFEF8F", "#FFEF91", "#FFEF94", "#FFF096", "#FFF099", "#FFF09B", "#FFF09D", "#FFF19F", "#FFF1A1", "#FFF2A4", "#FFF2A6", "#FFF3A9", "#FFF3AB", "#FFF3AE", "#FFF4B0", "#FFF4B3", "#FFF4B5", "#FFF5B7", "#FFF5B9", "#FFF5BB", "#FFF5BE", "#FFF6C0", "#FFF6C2", "#FFF6C4", "#FFF7C7", "#FFF7C9", "#FFF8CC", "#FFF8CE", "#FFF9D1", "#FFF9D3", "#FFF9D6", "#FFF9D8", "#FFFADA", "#FFFADC", "#FFFADF", "#FFFAE1", "#FFFBE4", "#FFFBE6", "#FFFCE8", "#FFFCEA", "#FFFDED", "#FFFDEF", "#FFFDF1", "#FFFEF4", "#FFFEF6", "#FFFEF9", "#FFFEFB", "#FFFFFD"];
  const glowPaletteRGB = glowPaletteHex.map(c => hexToRGB(c));

  const yellowPaletteHex = ["#350300", "#350300", "#350400", "#340400", "#340500", "#340600", "#340600", "#330700", "#330800", "#330900", "#330900", "#330A00", "#330A00", "#330B00", "#330B00", "#330C00", "#330C00", "#330D00", "#320E00", "#320E00", "#320F00", "#320F00", "#321000", "#321000", "#321100", "#321100", "#321200", "#321200", "#321300", "#321400", "#321400", "#321500", "#331500", "#331600", "#331600", "#331700", "#331800", "#331900", "#331900", "#341A00", "#341B00", "#341B00", "#341C00", "#341C00", "#341D00", "#341D00", "#341E00", "#351E00", "#351F00", "#352000", "#362000", "#362100", "#362100", "#362200", "#372200", "#372300", "#372300", "#372400", "#382400", "#382500", "#382600", "#392700", "#392700", "#392800", "#3A2900", "#3A2900", "#3B2A00", "#3B2A00", "#3B2B00", "#3C2B00", "#3C2C00", "#3D2D00", "#3D2D00", "#3E2E00", "#3E2E00", "#3F2F00", "#3F2F00", "#403000", "#403000", "#403100", "#413200", "#413200", "#423300", "#423300", "#433400", "#433400", "#443500", "#453500", "#463600", "#473700", "#483800", "#483800", "#493900", "#4A3A00", "#4A3A00", "#4B3B00", "#4B3B00", "#4C3C00", "#4D3C00", "#4E3D00", "#4E3D00", "#4F3E00", "#503F00", "#503F00", "#514000", "#524000", "#534100", "#544100", "#544200", "#554200", "#564300", "#574400", "#584400", "#584500", "#594500", "#5A4600", "#5C4700", "#5D4800", "#5E4800", "#5E4900", "#5F4900", "#604A00", "#614B00", "#624B00", "#624C00", "#634C00", "#654D00", "#664D00", "#674E00", "#684E00", "#684F00", "#694F00", "#6A5000", "#6B5100", "#6C5100", "#6D5200", "#6E5200", "#6F5300", "#705300", "#725400", "#735400", "#735500", "#745600", "#755600", "#765700", "#775800", "#785900", "#7A5900", "#7B5A00", "#7C5A00", "#7D5B00", "#7E5B00", "#7F5C00", "#805D00", "#815D00", "#825E00", "#835E00", "#855F00", "#865F00", "#876000", "#886000", "#896100", "#8A6200", "#8B6200", "#8C6300", "#8D6300", "#8E6400", "#8F6400", "#916500", "#926600", "#936600", "#946700", "#956800", "#966900", "#976900", "#986A00", "#996A00", "#9B6B00", "#9C6B00", "#9E6C00", "#9F6C00", "#A06D00", "#A16D00", "#A26E00", "#A36F00", "#A46F00", "#A47000", "#A57000", "#A77100", "#A87100", "#A97200", "#AA7200", "#AB7300", "#AD7400", "#AE7400", "#AF7500", "#B07500", "#B17600", "#B27600", "#B37700", "#B47800", "#B57900", "#B67900", "#B77A00", "#B87B00", "#B97B00", "#BA7C00", "#BB7C00", "#BC7D00", "#BE7D00", "#BF7E00", "#C07E00", "#C17F00", "#C27F00", "#C38000", "#C38100", "#C48100", "#C58200", "#C68200", "#C88300", "#C98300", "#CA8400", "#CB8400", "#CC8500", "#CD8600", "#CE8700", "#CE8700", "#CF8800", "#D08900", "#D18900", "#D28A00", "#D38A00", "#D48B00", "#D58B00", "#D68C00", "#D78D00", "#D88D00", "#D88E00", "#D98E00", "#DA8F00", "#DB8F00", "#DC9000", "#DD9000", "#DD9100", "#DE9100", "#DF9200", "#E09300", "#E09300", "#E19400", "#E19400", "#E29500", "#E39500", "#E49600", "#E59700", "#E59700", "#E69800", "#E79900", "#E89A00", "#E89A00", "#E99B00", "#E99B00", "#EA9C00", "#EB9C00", "#EC9D00", "#EC9D00", "#ED9E00", "#EE9F00", "#EE9F00", "#EFA000", "#EFA000", "#F0A100", "#F0A100", "#F0A200", "#F1A200", "#F1A300", "#F1A300", "#F2A400", "#F3A500", "#F3A500", "#F4A600", "#F4A700", "#F5A800", "#F5A800", "#F6A900", "#F6A900", "#F7AA00", "#F7AB00", "#F8AB00", "#F8AC00", "#F8AC00", "#F8AD00", "#F9AD00", "#F9AE00", "#F9AE00", "#F9AF00", "#FAAF00", "#FAB000", "#FAB100", "#FBB100", "#FBB200", "#FBB200", "#FBB300", "#FCB300", "#FCB400", "#FCB400", "#FCB500", "#FCB500", "#FCB600", "#FCB700", "#FDB800", "#FDB800", "#FDB900", "#FDBA00", "#FDBA00", "#FDBB00", "#FDBB00", "#FDBC00", "#FEBD00", "#FEBD00", "#FEBE00", "#FEBE00", "#FEBF00", "#FEBF00", "#FEC000", "#FEC000", "#FEC100", "#FEC100", "#FEC200", "#FEC300", "#FEC300", "#FEC400", "#FEC400", "#FEC500", "#FEC500", "#FEC600", "#FDC700", "#FDC800", "#FDC800", "#FDC900", "#FDCA00", "#FDCA00", "#FDCB00", "#FCCB00", "#FCCC00", "#FCCC00", "#FCCD00", "#FCCD00", "#FCCE00", "#FCCF00", "#FBCF00", "#FBD000", "#FBD000", "#FBD100", "#FAD100", "#FAD200", "#FAD200", "#FAD300", "#FAD300", "#FAD400", "#FAD500", "#F9D500", "#F9D600", "#F9D600", "#F9D700", "#F8D800", "#F8D900", "#F8D900", "#F8DA00", "#F7DA00", "#F7DB00", "#F7DC00", "#F6DC00", "#F6DD00", "#F6DD00", "#F6DE00", "#F5DE00", "#F5DF00", "#F5DF00", "#F5E000", "#F4E100", "#F4E100", "#F4E200", "#F3E200", "#F3E300", "#F3E300", "#F2E400", "#F2E400", "#F1E500", "#F1E600", "#F1E600", "#F0E700", "#F0E800", "#F0E900", "#EFE900", "#EFEA00", "#EFEA00", "#EFEB00", "#EEEB00", "#EEEC00", "#EEEC00", "#EDED00", "#EDEE00", "#EDEE00", "#EDEF00", "#ECEF00", "#ECF000", "#ECF000", "#EBF100", "#EBF100", "#EAF200", "#EAF300", "#E9F300", "#E9F400", "#E9F400", "#E9F500", "#E8F500", "#E8F600", "#E8F700", "#E8F700", "#E7F800", "#E7F900", "#E7FA00", "#E6FA00", "#E6FB00", "#E6FB00", "#E6FC00", "#E5FC00", "#E5FD00", "#E5FD00", "#E5FE00", "#E5FE00"];
  const yellowPaletteRGB = yellowPaletteHex.map(c => hexToRGB(c));

  const grayPaletteHex = ["#010101", "#020202", "#020202", "#030303", "#030303", "#040404", "#040404", "#050505", "#050505", "#060606", "#070707", "#080808", "#090909", "#090909", "#0A0A0A", "#0A0A0A", "#0B0B0B", "#0B0B0B", "#0C0C0C", "#0D0D0D", "#0D0D0D", "#0E0E0E", "#0E0E0E", "#0F0F0F", "#0F0F0F", "#101010", "#101010", "#111111", "#111111", "#121212", "#131313", "#131313", "#141414", "#151515", "#161616", "#161616", "#171717", "#171717", "#181818", "#181818", "#191919", "#1A1A1A", "#1A1A1A", "#1B1B1B", "#1B1B1B", "#1C1C1C", "#1C1C1C", "#1D1D1D", "#1D1D1D", "#1E1E1E", "#1F1F1F", "#1F1F1F", "#202020", "#202020", "#212121", "#212121", "#222222", "#232323", "#232323", "#242424", "#252525", "#262626", "#262626", "#272727", "#272727", "#282828", "#282828", "#292929", "#292929", "#2A2A2A", "#2A2A2A", "#2B2B2B", "#2C2C2C", "#2C2C2C", "#2D2D2D", "#2D2D2D", "#2E2E2E", "#2E2E2E", "#2F2F2F", "#2F2F2F", "#303030", "#313131", "#313131", "#323232", "#333333", "#343434", "#343434", "#353535", "#353535", "#363636", "#363636", "#373737", "#383838", "#383838", "#393939", "#393939", "#3A3A3A", "#3A3A3A", "#3B3B3B", "#3B3B3B", "#3C3C3C", "#3C3C3C", "#3D3D3D", "#3E3E3E", "#3E3E3E", "#3F3F3F", "#404040", "#414141", "#414141", "#424242", "#424242", "#434343", "#444444", "#444444", "#454545", "#454545", "#464646", "#464646", "#474747", "#474747", "#484848", "#484848", "#494949", "#4A4A4A", "#4A4A4A", "#4B4B4B", "#4B4B4B", "#4C4C4C", "#4C4C4C", "#4D4D4D", "#4E4E4E", "#4E4E4E", "#4F4F4F", "#505050", "#515151", "#515151", "#525252", "#525252", "#535353", "#535353", "#545454", "#545454", "#555555", "#565656", "#565656", "#575757", "#575757", "#585858", "#585858", "#595959", "#595959", "#5A5A5A", "#5B5B5B", "#5C5C5C", "#5C5C5C", "#5D5D5D", "#5E5E5E", "#5E5E5E", "#5F5F5F", "#5F5F5F", "#606060", "#606060", "#616161", "#626262", "#626262", "#636363", "#636363", "#646464", "#646464", "#656565", "#656565", "#666666", "#666666", "#676767", "#686868", "#686868", "#696969", "#696969", "#6A6A6A", "#6B6B6B", "#6C6C6C", "#6C6C6C", "#6D6D6D", "#6D6D6D", "#6E6E6E", "#6F6F6F", "#6F6F6F", "#707070", "#707070", "#717171", "#717171", "#727272", "#727272", "#737373", "#747474", "#747474", "#757575", "#757575", "#767676", "#767676", "#777777", "#777777", "#787878", "#797979", "#797979", "#7A7A7A", "#7B7B7B", "#7C7C7C", "#7C7C7C", "#7D7D7D", "#7D7D7D", "#7E7E7E", "#7E7E7E", "#7F7F7F", "#7F7F7F", "#808080", "#818181", "#818181", "#828282", "#828282", "#838383", "#838383", "#848484", "#848484", "#858585", "#868686", "#878787", "#878787", "#888888", "#898989", "#898989", "#8A8A8A", "#8A8A8A", "#8B8B8B", "#8B8B8B", "#8C8C8C", "#8D8D8D", "#8D8D8D", "#8E8E8E", "#8E8E8E", "#8F8F8F", "#8F8F8F", "#909090", "#909090", "#919191", "#919191", "#929292", "#939393", "#939393", "#949494", "#949494", "#959595", "#969696", "#979797", "#979797", "#989898", "#999999", "#999999", "#9A9A9A", "#9A9A9A", "#9B9B9B", "#9B9B9B", "#9C9C9C", "#9C9C9C", "#9D9D9D", "#9D9D9D", "#9E9E9E", "#9F9F9F", "#9F9F9F", "#A0A0A0", "#A0A0A0", "#A1A1A1", "#A1A1A1", "#A2A2A2", "#A2A2A2", "#A3A3A3", "#A4A4A4", "#A5A5A5", "#A5A5A5", "#A6A6A6", "#A7A7A7", "#A7A7A7", "#A8A8A8", "#A8A8A8", "#A9A9A9", "#A9A9A9", "#AAAAAA", "#ABABAB", "#ABABAB", "#ACACAC", "#ACACAC", "#ADADAD", "#ADADAD", "#AEAEAE", "#AEAEAE", "#AFAFAF", "#AFAFAF", "#B0B0B0", "#B1B1B1", "#B2B2B2", "#B2B2B2", "#B3B3B3", "#B4B4B4", "#B4B4B4", "#B5B5B5", "#B5B5B5", "#B6B6B6", "#B6B6B6", "#B7B7B7", "#B8B8B8", "#B8B8B8", "#B9B9B9", "#B9B9B9", "#BABABA", "#BABABA", "#BBBBBB", "#BBBBBB", "#BCBCBC", "#BDBDBD", "#BDBDBD", "#BEBEBE", "#BEBEBE", "#BFBFBF", "#BFBFBF", "#C0C0C0", "#C1C1C1", "#C2C2C2", "#C2C2C2", "#C3C3C3", "#C4C4C4", "#C4C4C4", "#C5C5C5", "#C5C5C5", "#C6C6C6", "#C6C6C6", "#C7C7C7", "#C7C7C7", "#C8C8C8", "#C8C8C8", "#C9C9C9", "#CACACA", "#CACACA", "#CBCBCB", "#CBCBCB", "#CCCCCC", "#CCCCCC", "#CDCDCD", "#CECECE", "#CFCFCF", "#D0D0D0", "#D0D0D0", "#D1D1D1", "#D1D1D1", "#D2D2D2", "#D2D2D2", "#D3D3D3", "#D3D3D3", "#D4D4D4", "#D4D4D4", "#D5D5D5", "#D6D6D6", "#D6D6D6", "#D7D7D7", "#D7D7D7", "#D8D8D8", "#D8D8D8", "#D9D9D9", "#D9D9D9", "#DADADA", "#DADADA", "#DBDBDB", "#DCDCDC", "#DDDDDD", "#DDDDDD", "#DEDEDE", "#DFDFDF", "#DFDFDF", "#E0E0E0", "#E0E0E0", "#E1E1E1", "#E2E2E2", "#E2E2E2", "#E3E3E3", "#E3E3E3", "#E4E4E4", "#E4E4E4", "#E5E5E5", "#E5E5E5", "#E6E6E6", "#E6E6E6", "#E7E7E7", "#E8E8E8", "#E8E8E8", "#E9E9E9", "#E9E9E9", "#EAEAEA", "#EAEAEA", "#EBEBEB", "#ECECEC", "#EDEDED", "#EDEDED", "#EEEEEE", "#EFEFEF", "#EFEFEF", "#F0F0F0", "#F0F0F0", "#F1F1F1", "#F1F1F1", "#F2F2F2", "#F2F2F2", "#F3F3F3", "#F4F4F4", "#F4F4F4", "#F5F5F5", "#F5F5F5", "#F6F6F6", "#F6F6F6", "#F7F7F7", "#F8F8F8", "#F8F8F8", "#F9F9F9", "#FAFAFA", "#FBFBFB", "#FBFBFB", "#FCFCFC", "#FCFCFC", "#FDFDFD", "#FDFDFD", "#FEFEFE", "#FEFEFE", "#FEFEFE", "#FFFFFF"];
  const grayPaletteRGB = grayPaletteHex.map(c => hexToRGB(c));

  const limePaletteHex = ["#0500AC", "#0602AC", "#0602AC", "#0605AC", "#0708AD", "#0708AD", "#070BAD", "#070EAD", "#0810AE", "#0810AE", "#0812AE", "#0914AE", "#0914AE", "#0916AF", "#0A18AF", "#0A1AAF", "#0A1AAF", "#0A1CB0", "#0B1DB0", "#0B1DB0", "#0B1FB0", "#0B20B1", "#0C22B1", "#0C22B1", "#0C23B1", "#0C25B1", "#0C25B1", "#0C26B2", "#0C28B2", "#0D29B2", "#0D29B2", "#0D2AB3", "#0D2CB3", "#0D2CB3", "#0D2DB3", "#0D2EB3", "#0E30B3", "#0E30B3", "#0E31B4", "#0E32B4", "#0E32B4", "#0E34B4", "#0E35B4", "#0E36B4", "#0E36B4", "#0E37B4", "#0E38B5", "#0E38B5", "#0E3AB5", "#0E3BB5", "#0E3CB5", "#0E3CB5", "#0E3DB5", "#0E3EB5", "#0E3EB5", "#0E40B5", "#0E41B5", "#0D42B5", "#0D42B5", "#0D43B5", "#0D44B5", "#0D44B5", "#0D46B5", "#0D47B5", "#0C48B5", "#0C48B5", "#0C49B5", "#0C4AB5", "#0C4AB5", "#0C4BB5", "#0B4DB4", "#0B4EB4", "#0B4EB4", "#0B4FB4", "#0B50B4", "#0B50B4", "#0A51B3", "#0A53B3", "#0A54B3", "#0A54B3", "#0955B2", "#0956B2", "#0956B2", "#0857B1", "#0858B0", "#085AB0", "#085AB0", "#075CAE", "#065EAE", "#065FAD", "#0660AC", "#0660AC", "#0661AA", "#0662A9", "#0764A8", "#0764A8", "#0865A7", "#0A66A5", "#0A66A5", "#0B67A4", "#0D69A2", "#0F6AA1", "#0F6AA1", "#116BA0", "#136C9E", "#136C9E", "#146D9D", "#166E9B", "#186F99", "#186F99", "#1A7097", "#1B7296", "#1B7296", "#1D7394", "#1E7492", "#1F7591", "#1F7591", "#21768F", "#22778D", "#22778D", "#23788B", "#247989", "#257A87", "#257A87", "#277C85", "#287D83", "#287D83", "#287E81", "#297F7F", "#2A807D", "#2A807D", "#2B817B", "#2C8279", "#2C8279", "#2C8377", "#2D8475", "#2E8572", "#2E8572", "#2E8670", "#2E876E", "#2E876E", "#2F896C", "#2F8A69", "#308B67", "#308B67", "#308C64", "#308D62", "#308D62", "#308E60", "#308F5D", "#31905B", "#31905B", "#319159", "#319256", "#319256", "#329354", "#329452", "#339550", "#339550", "#34964E", "#34974C", "#34974C", "#35984A", "#369948", "#379A47", "#379A47", "#389B45", "#399C43", "#399C43", "#3A9D41", "#3B9E40", "#3C9E3E", "#3C9E3E", "#3D9F3C", "#3EA03B", "#3EA03B", "#40A139", "#41A238", "#42A336", "#42A336", "#44A334", "#45A433", "#45A433", "#47A531", "#48A630", "#4AA72E", "#4AA72E", "#4BA82D", "#4DA92C", "#4DA92C", "#4FA92A", "#51AA29", "#52AB27", "#52AB27", "#54AC26", "#56AC24", "#56AC24", "#57AD23", "#5AAE22", "#5BAF20", "#5BAF20", "#5DAF1F", "#5FB01E", "#5FB01E", "#61B11C", "#63B11B", "#65B21A", "#65B21A", "#67B318", "#69B417", "#69B417", "#6BB415", "#6DB514", "#6FB613", "#6FB613", "#71B712", "#73B710", "#73B710", "#75B80F", "#77B80E", "#79B90C", "#79B90C", "#7BBA0B", "#7DBA0A", "#7DBA0A", "#80BB08", "#82BC07", "#84BC06", "#84BC06", "#86BD06", "#88BD05", "#88BD05", "#8ABE04", "#8DBF04", "#8FBF03", "#8FBF03", "#91C003", "#93C103", "#93C103", "#95C103", "#97C203", "#9AC202", "#9AC202", "#9CC302", "#9EC303", "#9EC303", "#A0C403", "#A2C403", "#A4C503", "#A4C503", "#A7C603", "#A9C603", "#A9C603", "#ABC704", "#ADC704", "#AFC804", "#AFC804", "#B1C805", "#B3C905", "#B3C905", "#B5C906", "#B7CA06", "#B9CB07", "#B9CB07", "#BDCC09", "#BFCD0A", "#C1CD0B", "#C3CE0B", "#C3CE0B", "#C4CE0C", "#C6CF0E", "#C8CF0F", "#C8CF0F", "#CAD010", "#CCD111", "#CCD111", "#CED112", "#CFD213", "#D1D214", "#D1D214", "#D3D315", "#D4D417", "#D4D417", "#D6D418", "#D8D519", "#DAD51A", "#DAD51A", "#DBD61C", "#DDD71D", "#DDD71D", "#DED71E", "#E0D820", "#E1D921", "#E1D921", "#E3DA22", "#E4DA24", "#E4DA24", "#E6DB25", "#E7DC27", "#E9DC28", "#E9DC28", "#EADD2A", "#EBDE2C", "#EBDE2C", "#ECDF2D", "#EEDF2F", "#EFE031", "#EFE031", "#F0E132", "#F1E235", "#F1E235", "#F2E236", "#F3E338", "#F4E43B", "#F4E43B", "#F4E53D", "#F5E63F", "#F5E63F", "#F5E742", "#F6E845", "#F7E948", "#F7E948", "#F7EA4B", "#F8EB4F", "#F8EB4F", "#F8EC53", "#F9ED58", "#FAED5D", "#FAED5D", "#FAEE62", "#FBEF67", "#FBEF67", "#FCF06D", "#FCF073", "#FDF179", "#FDF179", "#FDF280", "#FEF387", "#FEF387", "#FEF48E", "#FFF496", "#FFF59F", "#FFF59F", "#FFF5A8", "#FFF6B1", "#FFF6B1", "#FFF7BB", "#FEF7C6", "#FEF8D2", "#FEF8D2", "#FDF8DE", "#FBF9EB", "#FBF9EB"];
  const limePaletteRGB = limePaletteHex.map(c => hexToRGB(c));


  function hexToRGB(hex) {
    var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b];
  }

  function renderSpectrumImage() {
    if (!waterfallState.previewEnabled) {
      return;
    }

    const range = waterfallState.spectrumRange;
    if (!range || range.length !== 2) {
      alert('Error: invalid from or to spectrum index.');
      return;
    }

    const canvas = document.getElementById('preview-plot');
    canvas.width = waterfallData.baseSpectrum.channelCount;
    canvas.height = constants.previewHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const combinedSpectrum = exports.combineDeltas(
      waterfallData.deltas,
      Math.floor(range[0] / waterfallState.spectrumBinning),
      Math.floor(range[1] / waterfallState.spectrumBinning),
      waterfallData.baseSpectrum,
      'preview',
    );

    const cpsInChannel = [];
    let maxCps = 0;
    combinedSpectrum.channels.forEach((channelValue, channelIndex) => {
      let cps = channelValue / combinedSpectrum.duration;
      // TODO: duplicated code
      if (waterfallState.subtractBase) {
        const baseCps = waterfallData.baseSpectrum.channels[channelIndex] / waterfallData.baseSpectrum.duration;
        cps -= baseCps;
        if (cps < 0) {
          cps = 0;
        }
      }

      cpsInChannel.push(cps);

      if (cps > maxCps) {
        maxCps = cps;
      }
    });

    // spectrum render
    const spectrumHeight = canvas.height;// - constants.channelAxisHeight;
    const imageData = ctx.getImageData(0, 0, waterfallData.baseSpectrum.channelCount, spectrumHeight);
    const lineColor = hexToRGB('#ABABAB');
    cpsInChannel.forEach((cps, channelIndex) => {
      const counts = Math.round(cps * combinedSpectrum.duration);
      const maxCounts = Math.round(maxCps * combinedSpectrum.duration);
      let barHeight = Math.floor((counts / maxCounts) * spectrumHeight);
      switch (waterfallState.scale) {
        case 'log':
          barHeight = Math.floor((Math.log(counts + 1) / Math.log(maxCounts + 1)) * spectrumHeight);
          break;
        case 'sqrt':
          barHeight = Math.floor((Math.sqrt(counts) / Math.sqrt(maxCounts + 1)) * spectrumHeight);
          break;
      }

      const fillColor = getPointColor(cps, maxCps);
      for (let y = spectrumHeight - barHeight; y <= spectrumHeight; y++) {
        const color = y === spectrumHeight - barHeight
          ? lineColor
          : fillColor;
        const pxOffset = (y * waterfallData.baseSpectrum.channelCount + channelIndex) * 4;
        imageData.data[pxOffset + 0] = color[0];
        imageData.data[pxOffset + 1] = color[1];
        imageData.data[pxOffset + 2] = color[2];
        imageData.data[pxOffset + 3] = 255;
      }
    });

    ctx.putImageData(imageData, 0, 0);
  }

  function renderWaterfallImage() {
    const canvas = document.getElementById('waterfall-plot');
    canvas.width = waterfallData.baseSpectrum.channelCount + constants.timeAxisWidth;
    canvas.height = waterfallData.deltas.length + constants.channelAxisHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // calculate max cps
    let maxCps = 0;
    waterfallData.deltas.forEach((delta, deltaIndex) => {
      delta.channels.forEach((channelValue, channelIndex) => {
        if (!channelValue) {
          return;
        }

        let cps = channelValue / delta.duration;
        // TODO: duplicated code
        if (waterfallState.subtractBase) {
          const baseCps = waterfallData.baseSpectrum.channels[channelIndex] / waterfallData.baseSpectrum.duration;
          cps -= baseCps;
          if (cps < 0) {
            cps = 0;
          }
        }

        maxCps = Math.max(maxCps, cps);
      });
    });

    // waterfall render
    ctx.fillStyle = constants.backgroundColor;
    ctx.fillRect(constants.timeAxisWidth, 0, waterfallData.baseSpectrum.channelCount, waterfallData.deltas.length);
    const imageData = ctx.getImageData(constants.timeAxisWidth, 0, waterfallData.baseSpectrum.channelCount, waterfallData.deltas.length);
    waterfallData.deltas.forEach((delta, deltaIndex) => {
      delta.channels.forEach((channelValue, channelIndex) => {
        if (!channelValue) {
          return;
        }

        let cps = channelValue / delta.duration;
        // TODO: duplicated code
        if (waterfallState.subtractBase) {
          const baseCps = waterfallData.baseSpectrum.channels[channelIndex] / waterfallData.baseSpectrum.duration;
          cps -= baseCps;
          if (cps < 0) {
            cps = 0;
          }
        }

        const rgbColor = getPointColor(cps, maxCps);
        const pxOffset = (deltaIndex * waterfallData.baseSpectrum.channelCount + channelIndex) * 4;
        imageData.data[pxOffset + 0] = rgbColor[0];
        imageData.data[pxOffset + 1] = rgbColor[1];
        imageData.data[pxOffset + 2] = rgbColor[2];
        imageData.data[pxOffset + 3] = 255;
      });
    });
    ctx.putImageData(imageData, constants.timeAxisWidth, 0);

    if (waterfallState.blur) {
      const blurData = ctx.createImageData(imageData.width, imageData.height);
      const radius = constants.blurRadius;
      for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y <= imageData.height; y++) {
          let r = 0;
          let g = 0;
          let b = 0;
          for (let ky = -radius; ky <= radius; ++ky) {
            for (let kx = -radius; kx <= radius; ++kx) {
              const sourcePxOffset = ((y + ky) * imageData.width + (x + kx)) * 4;
              if (sourcePxOffset < 0 || sourcePxOffset > imageData.data.length - 1) {
                continue;
              }

              r += imageData.data[sourcePxOffset + 0];
              g += imageData.data[sourcePxOffset + 1];
              b += imageData.data[sourcePxOffset + 2];
            }
          }

          const destPxOffset = (y * blurData.width + x) * 4;
          const coeff = Math.pow(radius + 1, 2) * 2.1;
          blurData.data[destPxOffset + 0] = r / coeff;
          blurData.data[destPxOffset + 1] = g / coeff;
          blurData.data[destPxOffset + 2] = b / coeff;
          blurData.data[destPxOffset + 3] = 255;
        }
      }

      ctx.putImageData(blurData, constants.timeAxisWidth, 0);
    }

    renderTimeAxis(ctx);
    renderEnergyAxis(canvas, ctx, waterfallData.deltas.length);
  }

  function getPointColor(cps, maxCps) {
    const lowerCpsBound = maxCps * waterfallState.minCpsPercent / 100;
    const upperCpsBound = maxCps * waterfallState.maxCpsPercent / 100;
    cps -= lowerCpsBound;
    if (cps < 0) {
      cps = 0;
    }

    const ratio = cps / (upperCpsBound - lowerCpsBound);

    let palette;
    switch (waterfallState.palette) {
      case 'lime':
        palette = limePaletteRGB.slice(10);
        break;
      case 'glow':
        palette = glowPaletteRGB.slice(10);
        break;
      case 'yellow':
        palette = yellowPaletteRGB;
        break;
      case 'gray':
        palette = grayPaletteRGB.slice(30);
        break;
      case 'iron':
      default:
        palette = ironPaletteRGB.slice(5);
        break;
    }

    let colorIndex = Math.round(ratio * (palette.length - 1));
    switch (waterfallState.scale) {
      case 'log':
        colorIndex = Math.round((Math.log(colorIndex + 1) / Math.log(palette.length)) * (palette.length - 1));
        break;
      case 'sqrt':
        colorIndex = Math.round((Math.sqrt(colorIndex) / Math.sqrt(palette.length)) * (palette.length - 1));
        break;
      default:
        break;
    }

    return palette[colorIndex] || palette[palette.length - 1];
  }

  // TODO: temporary function to display channel range selection
  // re-renders channel axis
  function renderChannelSelection() {
    const canvas = document.getElementById('waterfall-plot');
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    renderEnergyAxis(canvas, ctx, waterfallData.deltas.length);
  }

  // TODO: temporary function to display spectrum range selection
  // re-renders time axis
  function renderSpectrumSelection() {
    const canvas = document.getElementById('waterfall-plot');
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    renderTimeAxis(ctx);
  }

  function renderTimeAxis(ctx) {
    ctx.fillStyle = constants.backgroundColor;
    ctx.fillRect(0, 0, constants.timeAxisWidth, waterfallData.deltas.length);

    const timestamps = waterfallData.deltas.map(d => d.timestamp);
    for (let tsIndex = 0; tsIndex < timestamps.length; tsIndex += constants.timestampHeight) {
      const timestamp = timestamps[tsIndex];
      ctx.textBaseline = 'top';
      ctx.fillStyle = constants.textColor;
      let label = common.timeToString(timestamp);
      label += ': ' + tsIndex * waterfallState.spectrumBinning * originalWaterfallData.spectrumBinning;
      ctx.fillText(label, 0, tsIndex);

      // label tick
      const tickWidth = tsIndex % 100 === 0
        ? constants.timestampTickWidth
        : constants.timestampTickWidth / 2;
      for (let x = constants.timeAxisWidth - tickWidth; x < constants.timeAxisWidth; x++) {
        ctx.fillRect(x, tsIndex, 1, 1);
      }
    }

    // display selection
    if (waterfallState.spectrumRange && waterfallState.spectrumRange.length === 2) {
      const fromY = Math.floor(waterfallState.spectrumRange[0] / waterfallState.spectrumBinning);
      const toY = Math.floor(waterfallState.spectrumRange[1] / waterfallState.spectrumBinning);
      for (let y = fromY; y <= toY; y++) {
        ctx.fillRect(constants.timeAxisWidth - 1, y, 1, 1);
      }
    }
  }

  function renderEnergyAxis(canvas, ctx, baseline) {
    ctx.fillStyle = constants.backgroundColor;
    ctx.fillRect(0, waterfallData.deltas.length, canvas.width, constants.channelAxisHeight);

    // calculate energy for each channel
    const allEnergies = [];
    for (let i = 0; i < waterfallData.baseSpectrum.channelCount; i++) {
      const energy = common.channelToEnergy(i);
      allEnergies.push(energy);
    }

    // calculate channels for 0, 100, 200, 300... enegries 
    const renderEnergies = {};
    for (let energy = 0, channel = 0; energy < allEnergies[allEnergies.length - 1]; energy += 100) {
      while (allEnergies[channel] < energy) {
        channel++;
      }
      renderEnergies[channel] = energy;
    }

    // energy axis render
    const energyAxisBaseline = baseline;
    const channelAxisBaseline = baseline + constants.channelAxisHeight / 2;
    let kevRendered = false;
    for (let x = constants.timeAxisWidth; x < canvas.width; x++) {
      const channelNumber = x - constants.timeAxisWidth;
      const energy = renderEnergies[channelNumber];

      if (energy != undefined && energy % 500 === 0) {
        ctx.textBaseline = 'top';
        ctx.fillStyle = constants.textColor;
        const label = kevRendered ? energy.toString() : energy + ' keV';
        ctx.fillText(label, x, energyAxisBaseline + constants.channelAxisTickHeight);
        kevRendered = true;
      }

      if (energy != undefined && energy % 100 === 0) {
        const tickHeight = energy % 500 === 0 ? constants.channelAxisTickHeight : constants.channelAxisTickHeight / 2;
        for (let y = energyAxisBaseline; y < energyAxisBaseline + tickHeight; y++) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      if (channelNumber % 100 === 0) {
        ctx.textBaseline = 'top';
        ctx.fillStyle = constants.textColor;
        const label = channelNumber === 0 ? channelNumber + ' channel' : channelNumber.toString();
        ctx.fillText(label, x, channelAxisBaseline + constants.channelAxisTickHeight);
      }

      if (channelNumber % 10 === 0) {
        const tickHeight = channelNumber % 50 === 0 ? constants.channelAxisTickHeight : constants.channelAxisTickHeight / 2;
        for (let y = channelAxisBaseline; y < channelAxisBaseline + tickHeight; y++) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // channel range 1
    if (waterfallState.channelRange1 && waterfallState.channelRange1.length === 2) {
      const fromX = waterfallState.channelRange1[0] + constants.timeAxisWidth;
      const toX = waterfallState.channelRange1[1] + constants.timeAxisWidth;
      for (let x = fromX; x <= toX; x++) {
        ctx.fillRect(x, baseline + constants.channelAxisHeight / 2, 1, 1);
      }
    }

    // channel range 2
    if (waterfallState.compareCps && waterfallState.channelRange2 && waterfallState.channelRange2.length === 2) {
      const fromX = waterfallState.channelRange2[0] + constants.timeAxisWidth;
      const toX = waterfallState.channelRange2[1] + constants.timeAxisWidth;
      for (let x = fromX; x <= toX; x++) {
        ctx.fillRect(x, baseline + constants.channelAxisHeight - 1, 1, 1);
      }
    }
  }
})();
