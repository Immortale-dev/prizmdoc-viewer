class HTMLParserBase{
    
    constructor(){
        this._defaults();
    }
    
    _defaults(){
        this.C = {
            STARTTAG: '<',
            FINISHTAG: '>',
            CLOSETAG: '/',
            ESCCHAR: '\\',
            SINGLEQUOTE: "'",
            DOUBLEQUOTE: '"',
            EQUALSCHAR: '=',
            SPACECHAR: ' ',
        };
        this._plainTags = ['style', 'script', 'textarea'];
        this._emptyCharacters = [' ', '\f', '\n', '\r', '\t'];
        this._singleTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    }
    
    _isEmptyChar(c){
        return this._emptyCharacters.includes(c);
    }
    
}

module.exports = HTMLParserBase;