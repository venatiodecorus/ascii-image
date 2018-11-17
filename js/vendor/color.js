// http://www.easyrgb.com/index.php?X=MATH&H=01#text1

function rgb(x,y,z){
  r=x; g=y; b=z
}
function rgbref(rgb){
  r=rgb[0]; g=rgb[1]; b=rgb[2];
}
function black(){ rgb(0,0,0) }
function white(){ rgb(255,255,255) }
function red(){ rgb(255,0,0) }
function gray(n){ n<1&&(n*=255);rgb(n,n,n) }

function rgb2xyz(rgb){
  var var_R = ( rgb[0] / 255 )        //R from 0 to 255
  var var_G = ( rgb[1] / 255 )        //G from 0 to 255
  var var_B = ( rgb[2] / 255 )        //B from 0 to 255

  if ( var_R > 0.04045 ) var_R = Math.pow( ( var_R + 0.055 ) / 1.055, 2.4)
  else                   var_R = var_R / 12.92
  if ( var_G > 0.04045 ) var_G = Math.pow( ( var_G + 0.055 ) / 1.055, 2.4)
  else                   var_G = var_G / 12.92
  if ( var_B > 0.04045 ) var_B = Math.pow( ( var_B + 0.055 ) / 1.055, 2.4)
  else                   var_B = var_B / 12.92

  var_R = var_R * 100
  var_G = var_G * 100
  var_B = var_B * 100

  //Observer. = 2°, Illuminant = D65
  var x = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805
  var y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722
  var z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505
  return [x,y,z];
}
function xyz2rgb(xyz){
  var var_X = xyz[0] / 100        //X from 0 to  95.047      (Observer = 2°, Illuminant = D65)
  var var_Y = xyz[1] / 100        //Y from 0 to 100.000
  var var_Z = xyz[2] / 100        //Z from 0 to 108.883

  var_R = var_X *  3.2406 + var_Y * -1.5372 + var_Z * -0.4986
  var_G = var_X * -0.9689 + var_Y *  1.8758 + var_Z *  0.0415
  var_B = var_X *  0.0557 + var_Y * -0.2040 + var_Z *  1.0570

  if ( var_R > 0.0031308 ) var_R = 1.055 * Math.pow( var_R, 1 / 2.4 ) - 0.055
  else                     var_R = 12.92 * var_R
  if ( var_G > 0.0031308 ) var_G = 1.055 * Math.pow( var_G, 1 / 2.4 ) - 0.055
  else                     var_G = 12.92 * var_G
  if ( var_B > 0.0031308 ) var_B = 1.055 * Math.pow( var_B, 1 / 2.4 ) - 0.055
  else                     var_B = 12.92 * var_B

  var r = clamp(var_R * 255, 0, 255)
  var g = clamp(var_G * 255, 0, 255)
  var b = clamp(var_B * 255, 0, 255)
  return [r,g,b]
}

function xyz2hunterlab (XYZ) {
  var X = XYZ[0]
  var Y = XYZ[1] || 1e-6  // otherwise divide-by-zero error when converting rgb(0,0,0)
  var Z = XYZ[2]
  var L = 10 * sqrt( Y )
  var a = 17.5 * ( ( ( 1.02 * X ) - Y ) / sqrt( Y ) )
  var b = 7 * ( ( Y - ( 0.847 * Z ) ) / sqrt( Y ) )
  return [L,a,b]
}

function hunterlab2xyz (Lab) {
  var L = Lab[0]
  var a = Lab[1]
  var b = Lab[2]
  var_Y = L / 10
  var_X = a / 17.5 * L / 10
  var_Z = b / 7 * L / 10

  Y = Math.pow(var_Y, 2)
  X = ( var_X + Y ) / 1.02
  Z = -( var_Z - Y ) / 0.847
  return [X,Y,Z]
}
// Daylight Illuminant (D65)
var REF_X = 95.047
var REF_Y = 100.000
var REF_Z = 108.883

function xyz2cielab (xyz) {
  var var_X = xyz[0] / ref_X          //ref_X =  95.047   Observer= 2°, Illuminant= D65
  var var_Y = xyz[1] / ref_Y          //ref_Y = 100.000
  var var_Z = xyz[2] / ref_Z          //ref_Z = 108.883

  if ( var_X > 0.008856 ) var_X = Math.pow( var_X, 1/3 )
  else                    var_X = ( 7.787 * var_X ) + ( 16 / 116 )
  if ( var_Y > 0.008856 ) var_Y = Math.pow( var_Y, 1/3 )
  else                    var_Y = ( 7.787 * var_Y ) + ( 16 / 116 )
  if ( var_Z > 0.008856 ) var_Z = Math.pow(var_Z, 1/3 )
  else                    var_Z = ( 7.787 * var_Z ) + ( 16 / 116 )

  var L = ( 116 * var_Y ) - 16
  var a = 500 * ( var_X - var_Y )
  var b = 200 * ( var_Y - var_Z )

  return [L,a,b]
}

function cielab2xyz (lab){
  var var_Y = ( lab[0] + 16 ) / 116
  var var_X = lab[1] / 500 + var_Y
  var var_Z = var_Y - lab[2] / 200

  if ( Math.pow(var_Y, 3) > 0.008856 ) var_Y = Math.pow(var_Y, 3)
  else                      var_Y = ( var_Y - 16 / 116 ) / 7.787
  if ( Math.pow(var_X, 3) > 0.008856 ) var_X = Math.pow(var_X, 3)
  else                      var_X = ( var_X - 16 / 116 ) / 7.787
  if ( Math.pow(var_Z, 3) > 0.008856 ) var_Z = Math.pow(var_Z, 3)
  else                      var_Z = ( var_Z - 16 / 116 ) / 7.787

  var x = REF_X * var_X     //ref_X =  95.047     Observer= 2°, Illuminant= D65
  var y = REF_Y * var_Y     //ref_Y = 100.000
  var z = REF_Z * var_Z     //ref_Z = 108.883

  return [x,y,z]
}

function rgb2hsl (RGB){
  var R = RGB[0]
  var G = RGB[1]
  var B = RGB[2]
  var var_R = ( R / 255 )                     //RGB from 0 to 255
  var var_G = ( G / 255 )
  var var_B = ( B / 255 )

  var var_Min = Math.min( var_R, var_G, var_B )    //Min. value of RGB
  var var_Max = Math.max( var_R, var_G, var_B )    //Max. value of RGB
  var del_Max = var_Max - var_Min             //Delta RGB value

  var H,S;
  var L = ( var_Max + var_Min ) / 2

  if ( del_Max == 0 )                     //This is a gray, no chroma...
  {
     H = 0                                //HSL results from 0 to 1
     S = 0
  }
  else                                    //Chromatic data...
  {
     if ( L < 0.5 ) S = del_Max / ( var_Max + var_Min )
     else           S = del_Max / ( 2 - var_Max - var_Min )

     var del_R = ( ( ( var_Max - var_R ) / 6 ) + ( del_Max / 2 ) ) / del_Max
     var del_G = ( ( ( var_Max - var_G ) / 6 ) + ( del_Max / 2 ) ) / del_Max
     var del_B = ( ( ( var_Max - var_B ) / 6 ) + ( del_Max / 2 ) ) / del_Max

     if      ( var_R == var_Max ) H = del_B - del_G
     else if ( var_G == var_Max ) H = ( 1 / 3 ) + del_R - del_B
     else if ( var_B == var_Max ) H = ( 2 / 3 ) + del_G - del_R

     if ( H < 0 ) H += 1
     if ( H > 1 ) H -= 1
  }
  return [H,S,L]
}
function hsl2rgb (H, S, L) {
  var R,G,B;
  var var_1, var_2;
  if ( S == 0 ) {                     //HSL from 0 to 1
     R = L * 255                      //RGB results from 0 to 255
     G = L * 255
     B = L * 255
  }
  else {
     if ( L < 0.5 ) var_2 = L * ( 1 + S )
     else           var_2 = ( L + S ) - ( S * L )

     var_1 = 2 * L - var_2

     R = 255 * hue2rgb( var_1, var_2, H + ( 1 / 3 ) ) 
     G = 255 * hue2rgb( var_1, var_2, H )
     B = 255 * hue2rgb( var_1, var_2, H - ( 1 / 3 ) )
  }
  return [R,G,B]
}
function hue2rgb( v1, v2, vH ) {
   if ( vH < 0 ) vH += 1
   if ( vH > 1 ) vH -= 1
   if ( ( 6 * vH ) < 1 ) return ( v1 + ( v2 - v1 ) * 6 * vH )
   if ( ( 2 * vH ) < 1 ) return ( v2 )
   if ( ( 3 * vH ) < 2 ) return ( v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6 )
   return ( v1 )
}

function rgb2cmy (R,G,B){
  if (R.length) {
    B = R[2]
    G = R[1]
    R = R[0]
  }
  var C = 1 - ( R / 255 )
  var M = 1 - ( G / 255 )
  var Y = 1 - ( B / 255 )
  return [C,M,Y]
}
function cmy2rgb (C,M,Y){
  if (C.length) {
    Y = C[2]
    M = C[1]
    C = C[0]
  }
  var R = ( 1 - C ) * 255
  var G = ( 1 - M ) * 255
  var B = ( 1 - Y ) * 255
  return [R,G,B]
}
function cmy2cmyk (C,M,Y) {
  if (C.length) {
    Y = C[2]
    M = C[1]
    C = C[0]
  }

  var var_K = 1

  if ( C < var_K )   var_K = C
  if ( M < var_K )   var_K = M
  if ( Y < var_K )   var_K = Y
  if ( var_K == 1 ) { //Black
     C = 0
     M = 0
     Y = 0
  }
  else {
     C = ( C - var_K ) / ( 1 - var_K )
     M = ( M - var_K ) / ( 1 - var_K )
     Y = ( Y - var_K ) / ( 1 - var_K )
  }
  var K = var_K
  return [C,M,Y,K]
}
function cmyk2cmy (C,M,Y,K) {
  if (C.length) {
    K = C[3]
    Y = C[2]
    M = C[1]
    C = C[0]
  }
  var C = ( C * ( 1 - K ) + K )
  var M = ( M * ( 1 - K ) + K )
  var Y = ( Y * ( 1 - K ) + K )
  return [C,M,Y]
}


