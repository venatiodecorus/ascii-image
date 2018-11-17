
var Photo = (function(){
  var COLORS = [
    [255,255,255],
    [0,0,0],
    [0,0,127],
    [0,147,0],
    [255,0,0],
    [127,0,0],
    [156,0,156],
    [252,127,0],
    [255,255,0],
    [0,252,0],
    [0,147,147],
    [0,255,255],
    [0,0,252],
    [255,0,255],
    [127,127,127],
    [210,210,210]
  ]
  var HUES = [
    [255,255,255],
    [0,0,0],
    [0,0,127],
    [0,147,0],
    [255,0,0],
    [127,0,0],
    [156,0,156],
    [252,127,0],
    [255,255,0],
    [0,252,0],
    [0,147,147],
    [0,255,255],
    [0,0,252],
    [255,0,255],
    null,
    null,
  ]
  var GRAYS = [
    [255,255,255],
    [0,0,0],
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    [127,127,127],
    [210,210,210]
  ]
  var REDS = [
    [255,255,255],
    [0,0,0],
    null,
    null,
    [255,0,0],
    [127,0,0],
    null,
    [252,127,0],
    [255,255,0],
    null,
    null,
    null,
    null,
    [255,0,255],
    null,
    null,
  ]  
  var YELLOWS = [
    [255,255,255],
    [0,0,0],
    null,
    [0,147,0],
    null,
    null,
    null,
    [252,127,0],
    [255,255,0],
    [0,252,0],
    null,
    [0,255,255],
    null,
    null,
    null,
    null,
  ]
  var BLUES = [
    [255,255,255],
    [0,0,0],
    [0,0,127],
    null,
    null,
    null,
    [156,0,156],
    null,
    null,
    [0,252,0],
    [0,147,147],
    [0,255,255],
    [0,0,252],
    [255,0,255],
    null,
    null,
  ]
  var colors = COLORS, recolor_fn = null, shade_fn = null, cc_recolor_fn = null
  var canvas = document.createElement("canvas"), ctx = canvas.getContext('2d'), pixels

  function set_colors (a) {
    colors = a
  }
  function set_shade_fn (fn) {
    shade_fn = fn
  }
  function set_recolor_fn (fn) {
    recolor_fn = fn
  }
  function set_cc_recolor_fn (fn) {
    cc_recolor_fn = fn
  }
  
  function closest_to(pixel){
    if (recolor_fn) {
      pixel = recolor_fn(pixel)
    }
    return colors.reduce(function(prev, curr, index) {
      var d = distance(pixel, curr)
      if (prev[0] > d) {
        prev[0] = d
        prev[1] = index
      }
      return prev
    }, [Infinity, -1])[1]
  }

  function distance(u, v){
    if (! v) return Math.Infinity
    var r = u[0] - v[0]
    var g = u[1] - v[1]
    var b = u[2] - v[2]
    return Math.sqrt(r*r+g*g+b*b)
  }

  function fromImageData (pixels, cb){
    var rows = [],
        pixel = new Array (4),
        data = pixels.data,
        t
    for (var i = 0, h = pixels.height; i < h; i++) {
      var row = []
      rows.push(row)
      for (var j = 0, w = pixels.width; j < w; j++) {
        t = (i*w+j)*4
        pixel[0] = data[t]
        pixel[1] = data[t+1]
        pixel[2] = data[t+2]
        pixel[3] = data[t+3]
        if (shade_fn) {
          shade_fn(data, pixel, j, i, w, h)
        }
        if (Photo.denoise) { denoise_pixel(data, w, h, i, j, pixel, Photo.denoise) }
        row[j] = closest_to(pixel)
        if (cc_recolor_fn) row[j] = cc_recolor_fn(row[j])
      }
    }
    if (! cb) return rows
    else cb (rows)
  }
  function denoise_pixel (d, w, h, x, y, pixel, exponent){
    var rr = r, gg = g, bb = b;
    var color = [0,0,0]
    var total = 0.0
    var xx, yy, x0, y0, weight, r, g, b, t
    for (xx = -4.0; xx <= 4.0; xx += 1.0) {
      x0 = x+xx
      if (x0 < 0 || x0 >= w) continue
      for (yy = -4.0; yy <= 4.0; yy += 1.0) {
        y0 = y+yy
        if (y0 < 0 || y0 >= h) continue
        t = (x+xx + w*(y+yy)) * 4
        r = d[ t ]
        g = d[ t+1 ]
        b = d[ t+2 ]
        weight = 1.0 - Math.abs( 0.25 * ((rr-r)/255 + (gg-g)/255 + (bb-b)/255) )
        weight = pow( weight, exponent )
        color[0] += r * weight
        color[1] += g * weight
        color[2] += b * weight
        total += weight
      }
    }
    pixel[0] = color[0] * 255 / total
    pixel[1] = color[1] * 255 / total
    pixel[2] = color[2] * 255 / total
  }
  function getNaturalDimensions (img) {
    if (img.naturalWidth) {
      return { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }
    }
    if (img.videoWidth) {
      return { naturalWidth: img.videoWidth, naturalHeight: img.videoHeight }
    }
    return { naturalWidth: img.width, naturalHeight: img.height }
  }
  function neighbor (canvas, ctx, img) {
    var dims = getNaturalDimensions(img)
    var scratch = document.createElement("canvas")
    var scratchCtx = scratch.getContext('2d')
    scratch.width = dims.naturalWidth
    scratch.height = dims.naturalHeight
    scratchCtx.drawImage(img, 0, 0, dims.naturalWidth, dims.naturalHeight)
    var srcImageData = scratchCtx.getImageData(0,0,scratch.width,scratch.height)
    var destImageData = ctx.createImageData(canvas.width,canvas.height)
    var src = srcImageData.data, dest = destImageData.data
    var dt, dw = destImageData.width, dh = destImageData.height
    var st, sw = srcImageData.width, sh = srcImageData.height
    for (var i = 0; i < dh; i++) {
      for (var j = 0; j < dw; j++) {
        var y = i * sh/dh
        var x = j * sw/dw
        dt = ((i*dw) + j) * 4
        st = Math.floor( Math.floor(y)*sw + x ) * 4
        dest[dt] = src[st]
        dest[dt+1] = src[st+1]
        dest[dt+2] = src[st+2]
        dest[dt+3] = src[st+3]
      }
    }
    return destImageData
  }
  var img = new Image ()
  function fromUrl (url, cb, opt) {
    img.onload = function(){
      fromCanvas(img, cb, opt)
    }
    if (img.src == url) { return img.onload() }
    img.src = url
    if (img.complete) { return img.onload() }
  }
  function fromCanvas (img, cb, opt) {
    var dims = getNaturalDimensions(img)
    if (opt.width) {
      canvas.width = opt.width
      if (opt.height) {
        canvas.height = opt.height
      } else if (opt.ratio) {
        canvas.height = opt.width / opt.ratio
      } else {
        canvas.height = (dims.naturalHeight * width / dims.naturalWidth) / 2
      }
    }
    else {
      canvas.width = dims.naturalWidth * 2
      canvas.height = dims.naturalHeight
    }
    if (opt.neighbor) {
      pixels = neighbor(canvas, ctx, img)
    }
    else {
      ctx.drawImage(img,0,0,dims.naturalWidth,dims.naturalHeight,0,0,canvas.width,canvas.height)
      pixels = ctx.getImageData(0,0,canvas.width,canvas.height)
    }
    fromImageData(pixels, cb)
  }
  function ascii (rows) {
    var lines = rows.map(function(str){
      var last = -1
      return str.map(function(index){
        if (last == index) return " "
        last = index
        return "\\x031," + index + " "
      }).join("")
    }).join("\\n")
    var txt = '/exec -out printf "' + lines + '"\n'
    return txt
  }
  function asciiFromUrl (url, cb, opt) {
    fromUrl(url, function(rows){
      cb(ascii(rows), rows)
    }, width)
  }
  function stringFromUrl (url, cb, opt) {
    fromUrl(url, function(rows){
      cb(rows.map(function(str){
        return str.map(function(index){ return "\C-c1," + index + " " }).join("")
      }).join("\n"))
    }, width)
  }

  var Photo = {
    colors: COLORS,
    hues: HUES,
    grays: GRAYS,
    reds: REDS,
    yellows: YELLOWS,
    blues: BLUES,
    set_shade_fn: set_shade_fn,
    set_recolor_fn: set_recolor_fn,
    set_cc_recolor_fn: set_cc_recolor_fn,
    set_colors: set_colors,
    closest_to: closest_to,
    distance: distance,
    fromUrl: fromUrl,
    fromCanvas: fromCanvas,
    fromImageData: fromImageData,
    stringFromUrl: stringFromUrl,
    asciiFromUrl: asciiFromUrl,
    ascii: ascii,
    neighbor: neighbor,
    denoise: 0,
  }
  return Photo

})()


