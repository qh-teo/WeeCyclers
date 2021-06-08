/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy tools for an ellipsoidal earth model                       (c) Chris Veness 2005-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-convert-coords.html                                     */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-ellipsoidal.html                     */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
//import Dms from '../shared/dms.js';
/**
 * A latitude/longitude point defines a geographic location on or relative to the earth’s surface,
 * measured in degrees from the equator and the Greenwich meridian and metres above the ellipsoid,
 * and based on a given datum. The datum defines the reference ellipsoid, and the transformation
 * parameters between different datums.
 *
 * The module includes ellipsoid parameters and datums for different coordinate systems, and methods
 * for converting between them and to/from cartesian coordinates.
 *
 * q.v. Ordnance Survey ‘A guide to coordinate systems in Great Britain’ Section 6
 * www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf.
 *
 * This module is used for both trigonometric methods (eg latlon-vincenty) and n-vector methods (eg
 * latlon-nvector-ellipsoidal).
 *
 * @module   latlon-ellipsoidal
 * @requires dms
 */
/*
 * Ellipsoid parameters; semi-major axis (a), semi-minor axis (b), and flattening (f) for each ellipsoid.
 * Flattening f = (a−b)/a; at least one of these parameters is derived from defining constants.
 */
let dmsSeparator = '\u202f'; 

/**
 * Functions for parsing and representing degrees / minutes / seconds.
 */
class Dms {
    // note Unicode Degree = U+00B0. Prime = U+2032, Double prime = U+2033
    /**
     * Parses string representing degrees/minutes/seconds into numeric degrees.
     *
     * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
     * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3° 37′ 09″W).
     * Seconds and minutes may be omitted.
     *
     * Thousands/decimal separators must be comma/dot; use Dms.fromLocale to convert locale-specific
     * thousands/decimal separators.
     *
     * @param   {string|number} dmsStr - Degrees or deg/min/sec in variety of formats.
     * @returns {number} Degrees as decimal number.
     *
     * @example
     *   const lat = Dms.parse('51° 28′ 40.12″ N');
     *   const lon = Dms.parse('000° 00′ 05.31″ W');
     *   const p1 = new LatLon(lat, lon); // 51.4778°N, 000.0015°W
     */
    static parse(dmsStr) {
        // check for signed decimal degrees without NSEW, if so return it directly
        if (typeof dmsStr == 'number' && isFinite(dmsStr)) return Number(dmsStr);
        // strip off any sign or compass dir'n & split out separate d/m/s
        const dms = String(dmsStr).trim().replace(/^-/, '').replace(/[NSEW]$/i, '').split(/[^0-9.,]+/);
        if (dms[dms.length-1]=='') dms.splice(dms.length-1);  // from trailing symbol
        if (dms == '') return NaN;
        // and convert to decimal degrees...
        let deg = null;
        switch (dms.length) {
            case 3:  // interpret 3-part result as d/m/s
                deg = dms[0]/1 + dms[1]/60 + dms[2]/3600;
                break;
            case 2:  // interpret 2-part result as d/m
                deg = dms[0]/1 + dms[1]/60;
                break;
            case 1:  // just d (possibly decimal) or non-separated dddmmss
                deg = dms[0];
                // check for fixed-width unseparated format eg 0033709W
                //if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
                //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600;
                break;
            default:
                return NaN;
        }
        if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve
        return Number(deg);
    }
    /**
     * Separator character to be used to separate degrees, minutes, seconds, and cardinal directions.
     *
     * Default separator is U+202F ‘narrow no-break space’.
     *
     * To change this (eg to empty string or full space), set Dms.separator prior to invoking any
     * formatting.
     *
     * @example
     *   import LatLon, { Dms } from 'latlon-spherical.js';
     *   const p = new LatLon(51.2, 0.33).toString('dms');  // 51° 12′ 00.0″ N, 000° 19′ 48.0″ E
     *   Dms.separator = '';              // no separator
     *   const pʹ = new LatLon(51.2, 0.33).toString('dms'); // 51°12′00.0″N, 000°19′48.0″E
     */
    static get separator() {
        return dmsSeparator;
    }
    static set separator(char) {
        dmsSeparator = char;
    }
    /**
     * Converts decimal degrees to deg/min/sec format
     *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
     *    direction is added.
     *  - degrees are zero-padded to 3 digits; for degrees latitude, use .slice(1) to remove leading zero.
     *
     * @private
     * @param   {number} deg - Degrees to be formatted as specified.
     * @param   {string} [format=d] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
     * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 4 for d, 2 for dm, 0 for dms.
     * @returns {string} Degrees formatted as deg/min/secs according to specified format.
     */
    static toDms(deg, format='d', dp=undefined, locales) { // TODO: locales?
        if (isNaN(deg)) return null;  // give up here if we can't make a number from deg
        // default values
        if (dp === undefined) {
            switch (format) {
                case 'd':   case 'deg':         dp = 4; break;
                case 'dm':  case 'deg+min':     dp = 2; break;
                case 'dms': case 'deg+min+sec': dp = 0; break;
                default:          format = 'd'; dp = 0; break; // be forgiving on invalid format
            }
        }
        deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)
        let dms = null, d = null, m = null, s = null;
        switch (format) {
            default: // invalid format spec!
            case 'd': case 'deg':
                d = deg.toFixed(dp);    // round/right-pad degrees
                if (d<100) d = '0' + d; // left-pad with leading zeros (note may include decimals)
                if (d<10) d = '0' + d;
                dms = d + '°';
                break;
            case 'dm': case 'deg+min':
                d = Math.floor(deg);     // get component deg
                m = ((deg*60) % 60).toFixed(dp); // get component min & round/right-pad
                d = ('000'+d).slice(-3);    // left-pad with leading zeros
                if (m<10) m = '0' + m;      // left-pad with leading zeros (note may include decimals)
                dms = d + '°'+Dms.separator + m + '′';
                break;
            case 'dms': case 'deg+min+sec':
                d = Math.floor(deg);    // get component deg
                m = Math.floor((deg*3600)/60) % 60; // get component min
                s = (deg*3600 % 60).toFixed(dp);  // get component sec & round/right-pad
                d = ('000'+d).slice(-3);     // left-pad with leading zeros
                m = ('00'+m).slice(-2);      // left-pad with leading zeros
                if (s<10) s = '0' + s;       // left-pad with leading zeros (note may include decimals)
                dms = d + '°'+Dms.separator + m + '′'+Dms.separator + s + '″';
                break;
        }
        return dms;
    }
    /**
     * Converts numeric degrees to deg/min/sec latitude (2-digit degrees, suffixed with N/S).
     *
     * @param   {number} deg - Degrees to be formatted as specified.
     * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
     * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
     * @returns {string} Degrees formatted as deg/min/secs according to specified format.
     */
    static toLat(deg, format, dp) {
        const lat = Dms.toDms(deg, format, dp);
        return lat===null ? '–' : lat.slice(1) + Dms.separator + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
    }
    /**
     * Convert numeric degrees to deg/min/sec longitude (3-digit degrees, suffixed with E/W)
     *
     * @param   {number} deg - Degrees to be formatted as specified.
     * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
     * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
     * @returns {string} Degrees formatted as deg/min/secs according to specified format.
     */
    static toLon(deg, format, dp) {
        const lon = Dms.toDms(deg, format, dp);
        return lon===null ? '–' : lon + Dms.separator + (deg<0 ? 'W' : 'E');
    }
    /**
     * Converts numeric degrees to deg/min/sec as a bearing (0°..360°)
     *
     * @param   {number} deg - Degrees to be formatted as specified.
     * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
     * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
     * @returns {string} Degrees formatted as deg/min/secs according to specified format.
     */
    static toBrng(deg, format, dp) {
        const brng =  Dms.toDms(wrap360(Number(deg)), format, dp);
        return brng===null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360°!
    }
    /**
     * Converts DMS string from JavaScript comma/dot thousands/decimal separators to locale separators.
     *
     * Can also be used to format standard numbers such as distances.
     *
     * @param   {string} str - Degrees/minutes/seconds formatted with standard Javascript separators.
     * @returns {string} Degrees/minutes/seconds formatted with locale separators.
     *
     * @example
     *   const Dms.toLocale('51°28′40.12″N, 000°00′05.31″W'); // '51°28′40,12″N, 000°00′05,31″W' in France
     *   const Dms.toLocale('123,456.789');                   // '123.456,789' in France
     */
    static toLocale(str) {
        const locale = (123456.789).toLocaleString();
        const separator = { thousands: locale.slice(3, 4), decimals:locale.slice(7, 8) };
        return string.replace(',([0-9])', '⁜$1').replace('.', separator.decimal).replace('⁜', separator.thousands);
    }
    /**
     * Converts DMS string from locale thousands/decimal separators to JavaScript comma/dot separators
     * for subsequent parsing.
     *
     * Both thousands and decimal separators must be followed by a numeric character, to facilitate
     * parsing of single lat/long string (in which whitespace must be left after the comma separator).
     *
     * @param   {string} str - Degrees/minutes/seconds formatted with locale separators.
     * @returns {string} Degrees/minutes/seconds formatted with standard Javascript separators.
     *
     * @example
     *   const lat = Dms.fromLocale('51°28′40,12″N');                            // '51°28′40.12″N' in France
     *   const p = LatLon.parse(Dms.fromLocale('51°28′40,12″N, 000°00′05,31″W'); // '51.4778°N, 000.0015°W' in France
     */
  static fromLocale(str) {
        const locale = (123456.789).toLocaleString();
        const separator = { thousands: locale.slice(3, 4), decimals:locale.slice(7, 8) };
        // TODO: digits following separator
        return string.replace(separator.thousands, '⁜').replace(separator.decimal, '.').replace('⁜', ',');
    }
    /**
     * Returns compass point (to given precision) for supplied bearing.
     *
     * @param   {number} bearing - Bearing in degrees from north.
     * @param   {number} [precision=3] - Precision (1:cardinal / 2:intercardinal / 3:secondary-intercardinal).
     * @returns {string} Compass point for supplied bearing.
     *
     * @example
     *   const point = Dms.compassPoint(24);    // point = 'NNE'
     *   const point = Dms.compassPoint(24, 1); // point = 'N'
     */
    static compassPoint(bearing, precision=3) {
        // note precision = max length of compass point; it could be extended to 4 for quarter-winds
        // (eg NEbN), but I think they are little used
        bearing = wrap360(Number(bearing)); // normalise to range 0..360°
        let point = null;
        switch (Number(precision)) {
            case 1: // 4 compass points
                switch (Math.round(bearing*4/360)%4) {
                    case 0: point = 'N'; break;
                    case 1: point = 'E'; break;
                    case 2: point = 'S'; break;
                    case 3: point = 'W'; break;
                }
                break;
            case 2: // 8 compass points
                switch (Math.round(bearing*8/360)%8) {
                    case 0: point = 'N';  break;
                    case 1: point = 'NE'; break;
                    case 2: point = 'E';  break;
                    case 3: point = 'SE'; break;
                    case 4: point = 'S';  break;
                    case 5: point = 'SW'; break;
                    case 6: point = 'W';  break;
                    case 7: point = 'NW'; break;
                }
                break;
            case 3: // 16 compass points
                switch (Math.round(bearing*16/360)%16) {
                    case  0: point = 'N';   break;
                    case  1: point = 'NNE'; break;
                    case  2: point = 'NE';  break;
                    case  3: point = 'ENE'; break;
                    case  4: point = 'E';   break;
                    case  5: point = 'ESE'; break;
                    case  6: point = 'SE';  break;
                    case  7: point = 'SSE'; break;
                    case  8: point = 'S';   break;
                    case  9: point = 'SSW'; break;
                    case 10: point = 'SW';  break;
                    case 11: point = 'WSW'; break;
                    case 12: point = 'W';   break;
                    case 13: point = 'WNW'; break;
                    case 14: point = 'NW';  break;
                    case 15: point = 'NNW'; break;
                }
                break;
            default:
                throw new RangeError('Precision must be between 1 and 3');
        }
        return point;
    }
}
/* constrain degrees to range 0..360 or -180..+180 */
function wrap360(degrees) {  return (degrees%360+360) % 360; }
function wrap180(degrees) {  return (degrees%360+180) % 360 - 180; }
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

export { Dms };


const ellipsoids = {
    WGS84:        { a: 6378137,     b: 6356752.314245, f: 1/298.257223563 },
    GRS80:        { a: 6378137,     b: 6356752.314140, f: 1/298.257222101 },
    Airy1830:     { a: 6377563.396, b: 6356256.909,    f: 1/299.3249646   },
    AiryModified: { a: 6377340.189, b: 6356034.448,    f: 1/299.3249646   },
    Bessel1841:   { a: 6377397.155, b: 6356078.962818, f: 1/299.1528128   },
    Clarke1866:   { a: 6378206.4,   b: 6356583.8,      f: 1/294.978698214 },
    Intl1924:     { a: 6378388,     b: 6356911.946,    f: 1/297           }, // aka Hayford
    WGS72:        { a: 6378135,     b: 6356750.5,      f: 1/298.26        },
};
/*
 * Datums; with associated ellipsoid, and Helmert transform parameters to convert from WGS-84 into
 * given datum.
 *
 * More are available from earth-info.nga.mil/GandG/coordsys/datums/NATO_DT.pdf,
 * www.fieldenmaps.info/cconv/web/cconv_params.js
 */
const datums = {
    /* eslint key-spacing: 0, comma-dangle: 0 */
    WGS84: {
        ellipsoid: ellipsoids.WGS84,
        transform: { tx:    0.0,    ty:    0.0,     tz:    0.0,    // m
                     rx:    0.0,    ry:    0.0,     rz:    0.0,    // sec
                      s:    0.0 }                                  // ppm
    },
    NAD83: { // (2009); functionally ≡ WGS84 - www.uvm.edu/giv/resources/WGS84_NAD83.pdf
        ellipsoid: ellipsoids.GRS80,
        transform: { tx:    1.004,  ty:   -1.910,   tz:   -0.515,  // m
                     rx:    0.0267, ry:    0.00034, rz:    0.011,  // sec
                      s:   -0.0015 }                               // ppm
    }, // note: if you *really* need to convert WGS84<->NAD83, you need more knowledge than this!
    OSGB36: { // www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf
        ellipsoid: ellipsoids.Airy1830,
        transform: { tx: -446.448,  ty:  125.157,   tz: -542.060,  // m
                     rx:   -0.1502, ry:   -0.2470,  rz:   -0.8421, // sec
                      s:   20.4894 }                               // ppm
    },
    ED50: { // og.decc.gov.uk/en/olgs/cms/pons_and_cop/pons/pon4/pon4.aspx
        ellipsoid: ellipsoids.Intl1924,
        transform: { tx:   89.5,    ty:   93.8,     tz:  123.1,    // m
                     rx:    0.0,    ry:    0.0,     rz:    0.156,  // sec
                      s:   -1.2 }                                  // ppm
    },
    Irl1975: { // osi.ie/OSI/media/OSI/Content/Publications/transformations_booklet.pdf
        ellipsoid: ellipsoids.AiryModified,
        transform: { tx: -482.530,  ty:  130.596,   tz: -564.557,  // m
                     rx:   -1.042,  ry:   -0.214,   rz:   -0.631,  // sec
                      s:   -8.150 }                                // ppm
    }, // TODO: many sources have opposite sign to rotations - to be checked!
    TokyoJapan: { // www.geocachingtoolbox.com?page=datumEllipsoidDetails
        ellipsoid: ellipsoids.Bessel1841,
        transform: { tx:  148,      ty: -507,       tz: -685,      // m
                     rx:    0,      ry:    0,       rz:    0,      // sec
                      s:    0 }                                    // ppm
    },
    NAD27: { // en.wikipedia.org/wiki/Helmert_transformation
        ellipsoid: ellipsoids.Clarke1866,
        transform: { tx:    8,      ty: -160,       tz: -176,      // m
                     rx:    0,      ry:    0,       rz:    0,      // sec
                      s:    0 }                                    // ppm
    },
    WGS72: { // www.icao.int/safety/pbn/documentation/eurocontrol/eurocontrol wgs 84 implementation manual.pdf
        ellipsoid: ellipsoids.WGS72,
        transform: { tx:    0,      ty:    0,       tz:   -4.5,    // m
                     rx:    0,      ry:    0,       rz:    0.554,  // sec
                      s:   -0.22 }                                 // ppm
    },
};
/* LatLonEllipsoidal  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/**
 * Latitude/longitude points on an ellipsoidal model earth, with ellipsoid parameters and methods
 * for converting between datums and to cartesian (ECEF) coordinates.
 */
class LatLonEllipsoidal { // note prototype-based class not inheritance-based class
    /**
     * Creates lat/lon (polar) point with latitude & longitude values, on a specified datum.
     *
     * @param {number}        lat - Geodetic latitude in degrees.
     * @param {number}        lon - Longitude in degrees.
     * @param {number}        [height=0] - Height above ellipsoid in metres.
     * @param {LatLon.datums} [datum=WGS84] - Datum this point is defined within.
     *
     * @example
     *   import LatLon from 'latlon-ellipsoidal';
     *   var p1 = new LatLon(51.4778, -0.0016, 0, LatLon.datums.WGS84);
     */
    constructor(lat, lon, height=0, datum=datums.WGS84) {
        this.lat = Number(lat);
        this.lon = Number(lon);
        this.height = Number(height);
        this.datum = datum;
    }
    /**
     * Ellipsoid parameters; major axis (a), minor axis (b), and flattening (f) for each ellipsoid.
     *
     * @example
     *   var a = LatLon.ellipsoids.Airy1830.a; // 6377563.396
     */
    static get ellipsoids() {
        return ellipsoids;
    }
    /**
     * Datums; with associated ellipsoid and Helmert transform parameters to convert from WGS-84
     * into given datum.
     *
     * @example
     *   var a = LatLon.datums.OSGB36.ellipsoid.a; // 6377563.396
     *   var tx = LatLon.datums.OSGB36.transform;  // to WGS-84
     */
    static get datums() {
        return datums;
    }
    /**
     * Converts ‘this’ lat/lon coordinate to new coordinate system.
     *
     * @param   {LatLon.datums} toDatum - Datum this coordinate is to be converted to.
     * @returns {LatLon} This point converted to new datum.
     *
     * @example
     *   var pWGS84 = new LatLon(51.4778, -0.0016, 0, LatLon.datums.WGS84);
     *   var pOSGB = pWGS84.convertDatum(LatLon.datums.OSGB36); // 51.4773°N, 000.0000°E
     */
    convertDatum(toDatum) {
        var oldLatLon = this;
        var transform;
        if (oldLatLon.datum == datums.WGS84) {
            // converting from WGS 84
            transform = toDatum.transform;
        }
        if (toDatum == datums.WGS84) {
            // converting to WGS 84; use inverse transform (don't overwrite original!)
            transform = {};
            for (var param in oldLatLon.datum.transform) {
                if (oldLatLon.datum.transform.hasOwnProperty(param)) {
                    transform[param] = -oldLatLon.datum.transform[param];
                }
            }
        }
        if (transform === undefined) {
            // neither this.datum nor toDatum are WGS84: convert this to WGS84 first
            oldLatLon = this.convertDatum(datums.WGS84);
            transform = toDatum.transform;
        }
        var oldCartesian = oldLatLon.toCartesian();                // convert polar to cartesian...
        var newCartesian = oldCartesian.applyTransform(transform); // ...apply transform...
        var newLatLon = newCartesian.toLatLon(toDatum);            // ...and convert cartesian to polar
        return newLatLon;
    }
    /**
     * Converts ‘this’ point from (geodetic) latitude/longitude coordinates to (geocentric) cartesian
     * (x/y/z) coordinates.
     *
     * @returns {Cartesian} Cartesian point equivalent to lat/lon point, with x, y, z in metres from
     *   earth centre.
     */
    toCartesian() {
        var φ = this.lat.toRadians(), λ = this.lon.toRadians();
        var h = this.height; // height above ellipsoid
        var a = this.datum.ellipsoid.a, f = this.datum.ellipsoid.f;
        var sinφ = Math.sin(φ), cosφ = Math.cos(φ);
        var sinλ = Math.sin(λ), cosλ = Math.cos(λ);
        var eSq = 2*f - f*f;                      // 1st eccentricity squared ≡ (a²-b²)/a²
        var ν = a / Math.sqrt(1 - eSq*sinφ*sinφ); // radius of curvature in prime vertical
        var x = (ν+h) * cosφ * cosλ;
        var y = (ν+h) * cosφ * sinλ;
        var z = (ν*(1-eSq)+h) * sinφ;
        var p = new Cartesian(x, y, z);
        return p;
    }
    /**
     * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
     * degrees+minutes+seconds.
     *
     * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
     * @param   {number} [dp=0|2|4] - Number of decimal places to use: default 0 for dms, 2 for dm, 4 for d.
     * @param   {number} [heightDp=null] - Number of decimal places to use for height; default is no height display.
     * @returns {string} Comma-separated formatted latitude/longitude.
     */
    toString(format='dms', dp=undefined, heightDp=null) {
        var height = heightDp==null ? '' : ' ' + (this.height>0 ? '+' : '') + this.height.toFixed(Number(heightDp)) + 'm';
        return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp) + height;
    }
}
/* Cartesian  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/**
 * Converts ECEF (earth-centered earth-fixed) cartesian coordinates to LatLon points, applies
 * Helmert transformations.
 */
class Cartesian { // note prototype-based class not inheritance-based class
    /**
     * Creates cartesian coordinate representing ECEF (earth-centric earth-fixed) point.
     *
     * @param {number} x - x coordinate in metres (=> 0°N,0°E).
     * @param {number} y - y coordinate in metres (=> 0°N,90°E).
     * @param {number} z - z coordinate in metres (=> 90°N).
     *
     * @example
     *   import { Cartesian } from 'latlon-ellipsoidal';
     *   var coord = new Cartesian(3980581.210, -111.159, 4966824.522);
     */
    constructor(x, y, z) {
        this.x = Number(x);
        this.y = Number(y);
        this.z = Number(z);
    }
    /**
     * Converts ‘this’ (geocentric) cartesian (x/y/z) coordinate to (ellipsoidal geodetic)
     * latitude/longitude point on specified datum.
     *
     * Uses Bowring’s (1985) formulation for μm precision in concise form.
     *
     * @param {LatLon.datums} [datum=WGS84] - Datum to use when converting point.
     */
    toLatLon(datum=LatLonEllipsoidal.datums.WGS84) {
        var x = this.x, y = this.y, z = this.z;
        var a = datum.ellipsoid.a, b = datum.ellipsoid.b, f = datum.ellipsoid.f;
        var e2 = 2*f - f*f;   // 1st eccentricity squared ≡ (a²-b²)/a²
        var ε2 = e2 / (1-e2); // 2nd eccentricity squared ≡ (a²-b²)/b²
        var p = Math.sqrt(x*x + y*y); // distance from minor axis
        var R = Math.sqrt(p*p + z*z); // polar radius
        // parametric latitude (Bowring eqn 17, replacing tanβ = z·a / p·b)
        var tanβ = (b*z)/(a*p) * (1+ε2*b/R);
        var sinβ = tanβ / Math.sqrt(1+tanβ*tanβ);
        var cosβ = sinβ / tanβ;
        // geodetic latitude (Bowring eqn 18: tanφ = z+ε²bsin³β / p−e²cos³β)
        var φ = isNaN(cosβ) ? 0 : Math.atan2(z + ε2*b*sinβ*sinβ*sinβ, p - e2*a*cosβ*cosβ*cosβ);
        // longitude
        var λ = Math.atan2(y, x);
        // height above ellipsoid (Bowring eqn 7)
        var sinφ = Math.sin(φ), cosφ = Math.cos(φ);
        var ν = a / Math.sqrt(1-e2*sinφ*sinφ); // length of the normal terminated by the minor axis
        var h = p*cosφ + z*sinφ - (a*a/ν);
        var point = new LatLonEllipsoidal(φ.toDegrees(), λ.toDegrees(), h, datum);
        return point;
    }
    /**
     * Applies Helmert (seven-parameter) transformation to ‘this’ coordinate using transform
     * parameters t.
     *
     * @param {LatLon.datums.transform} t - Transformation to apply to this coordinate.
     */
    applyTransform(t)   {
        var x1 = this.x, y1 = this.y, z1 = this.z;
        var tx = t.tx, ty = t.ty, tz = t.tz;
        var rx = (t.rx/3600).toRadians(); // normalise seconds to radians
        var ry = (t.ry/3600).toRadians(); // normalise seconds to radians
        var rz = (t.rz/3600).toRadians(); // normalise seconds to radians
        var s1 = t.s/1e6 + 1;             // normalise ppm to (s+1)
        // apply transform
        var x2 = tx + x1*s1 - y1*rz + z1*ry;
        var y2 = ty + x1*rz + y1*s1 - z1*rx;
        var z2 = tz - x1*ry + y1*rx + z1*s1;
        var point = new Cartesian(x2, y2, z2);
        return point;
    }
    /**
     * Returns a string representation of ‘this’ cartesian point.
     *
     * @param   {number} [dp=0] - Number of decimal places to use.
     * @returns {string} Comma-separated latitude/longitude.
     */
    toString(dp=0) {
        dp = Number(dp);
        return '['+this.x.toFixed(dp)+','+this.y.toFixed(dp)+','+this.z.toFixed(dp)+']';
    }
}
// Extend Number object with methods to convert between degrees & radians
Number.prototype.toRadians = function() { return this * Math.PI / 180; };
Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
export { LatLonEllipsoidal as default, Cartesian };