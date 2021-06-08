let dmsSeparator = '\u202f'; // U+202F = 'narrow no-break space'

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

export { Dms as default };