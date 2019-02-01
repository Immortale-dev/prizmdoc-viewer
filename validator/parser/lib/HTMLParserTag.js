const HTMLParserBase = require("./HTMLParserBase");
const HTMLParserProp = require("./HTMLParserProp");

class HTMLParserTag extends HTMLParserBase{
    
    constructor(str){
        super();
        this.children = [];
        if(str == HTMLParserTag.ROOT){
            this.tagName = HTMLParserTag.ROOT;
            this.props = new Map();
        }
        else{
            this.html(str);
        }
    }
    
    html(html){
        if(html)
            this.parse(html);
    }
    
    append(tag){
        this.children.push(tag);
        tag.parent = this;
    }
    
    parse(str){
        let C = this.C;
        str = this._fixStr(str);
        this.tagName = str.split(C.SPACECHAR).shift().toLowerCase();
        let propsArr = this._parseProps(str);
        this._props = propsArr;
        this._assignProps(propsArr);
    }
    
    hasProp(prop){
        return this.props.has(prop);
    }
    
    getProp(prop){
        return this.props.get(prop);
    }
    
    isRoot(){
        return this.tagName == this.constructor.ROOT;
    }
    
    iterateProps(){
        return this.props;
    }
    
    _parseProps(str){
        let C = this.C;
        let arr = [];
        let pstart = str.indexOf(C.SPACECHAR);
        let len = str.length;
        let oQuote = false;
        let oQuotes = false;
        let start = pstart;
        for(let i=pstart;i<len;i++){
            let b = str[i];
            if(b == C.SPACECHAR && start == i){
                start++;
                continue;
            }
            if(b == C.SINGLEQUOTE && !oQuotes && (!oQuote || str[i-1] != C.ESCCHAR) )
                oQuote = !oQuote;
            if(b == C.DOUBLEQUOTE && !oQuote && (!oQuotes || str[i-1] != C.ESCCHAR) )
                oQuotes = !oQuotes;
            if(b == C.SPACECHAR && !oQuote && !oQuotes ){
                arr.push(str.substr(start, i-start));
                start = i+1;
                continue;
            }
            if( (b == C.SINGLEQUOTE || b == C.DOUBLEQUOTE) && !oQuote && !oQuotes ){
                arr.push(str.substr(start, i-start+1));
                start = i+1;
                continue;
            }
        }
        return arr.map(a=>{
            let kv = a.split(C.EQUALSCHAR);
            if(kv.length === 1)
                return new HTMLParserProp({key: kv[0].trim().toLowerCase(), val: null});
            let start = 0;
            let end = kv[1].length-1;
            let firstChar = kv[1][start];
            let lastChar = kv[1][end];
            if(firstChar == C.SINGLEQUOTE || firstChar == C.DOUBLEQUOTE)
                start++;
            if( (lastChar == C.SINGLEQUOTE || lastChar == C.DOUBLEQUOTE) && firstChar == lastChar)
                end--;
            return new HTMLParserProp({key: kv[0].trim(), val: kv[1].substr(start,end-start+1)});
        });
    }
    
    _assignProps(props){
        this.props = new Map();
        for(let it of props){
            this.props.set(it.key,it);
        }
    }
    
    _fixStr(str){
        let len = str.length;
        let retstr = '';
        let oQuote = false;
        let oQuotes = false;
        let C = this.C;
        for(let i=0;i<len;i++){
            let b = str[i];
            if(b == C.SINGLEQUOTE && !oQuotes && (!oQuote || str[i-1] != C.ESCCHAR) )
                oQuote = !oQuote;
            if(b == C.DOUBLEQUOTE && !oQuote && (!oQuotes || str[i-1] != C.ESCCHAR) )
                oQuotes = !oQuotes;
            if( 
                i<len-1 && this._isEmptyChar(b) && this._isEmptyChar(str[i+1]) ||
                this._isEmptyChar(b) && str[i+1] == C.EQUALSCHAR && !oQuote && !oQuotes ||
                this._isEmptyChar(b) && str[i-1] == C.EQUALSCHAR && !oQuote && !oQuotes ||
                b == C.STARTTAG && i == 0 ||
                b == C.FINISHTAG && i == len-1
            ){
                continue;
            }
            if(this._isEmptyChar(b))
                b = C.SPACECHAR;
            retstr += b;
        }
        return retstr;
    }
    
    *_req(tag, cb){
        if(!tag.isRoot())
            yield tag;
        for(let i=0;i<tag.children.length;i++){
            yield * this._req(tag.children[i]);
        }
    }
    
    [Symbol.iterator](){
        let cur = this;
        let nxt = this._req(cur);
        return {
            next(){
                return nxt.next();
            }
        };
    }
}
HTMLParserTag.ROOT = Symbol('ROOT');

module.exports = HTMLParserTag;