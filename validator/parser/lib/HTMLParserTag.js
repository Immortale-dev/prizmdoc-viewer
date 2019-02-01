const HTMLParserBase = require("./HTMLParserBase");
const HTMLParserProp = require("./HTMLParserProp");

//HTML Tag Class
class HTMLParserTag extends HTMLParserBase{
    
    constructor(str){
        //Call parent constructor
        super();
        this.children = [];
        
        //If for root tag
        if(str == HTMLParserTag.ROOT){
            this.tagName = HTMLParserTag.ROOT;
            this.props = new Map();
        }
        else{
            this.html(str);
        }
    }
    
    //Or parse html code if exists
    html(html){
        if(html)
            this.parse(html);
    }
    
    //Add childre tag to this one
    append(tag){
        this.children.push(tag);
        tag.parent = this;
    }
    
    //Parse tag that comes as plain text
    parse(str){
        let C = this.C;
        str = this._fixStr(str);
        this.tagName = str.split(C.SPACECHAR).shift().toLowerCase();
        let propsArr = this._parseProps(str);
        this._props = propsArr;
        this._assignProps(propsArr);
    }
    
    //Check if property exsists in current tag
    hasProp(prop){
        return this.props.has(prop);
    }
    
    //Get access to property from current tag
    getProp(prop){
        return this.props.get(prop);
    }
    
    //Check if this tag is root one
    isRoot(){
        return this.tagName == this.constructor.ROOT;
    }
    
    //Return iterable property object
    iterateProps(){
        return this.props;
    }
    
    //Parse Properties from html code
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
            
            //Ignore leading spaces
            if(b == C.SPACECHAR && start == i){
                start++;
                continue;
            }
            
            //Check for open single or double quotes
            if(b == C.SINGLEQUOTE && !oQuotes && (!oQuote || str[i-1] != C.ESCCHAR) )
                oQuote = !oQuote;
            if(b == C.DOUBLEQUOTE && !oQuote && (!oQuotes || str[i-1] != C.ESCCHAR) )
                oQuotes = !oQuotes;
            
            //If spacebar is found and no quotes opened, we found the end of propery
            if(b == C.SPACECHAR && !oQuote && !oQuotes ){
                arr.push(str.substr(start, i-start));
                start = i+1;
                continue;
            }
            
            //If we found the closing quote propery, then we found the end of propery
            if( (b == C.SINGLEQUOTE || b == C.DOUBLEQUOTE) && !oQuote && !oQuotes ){
                arr.push(str.substr(start, i-start+1));
                start = i+1;
                continue;
            }
        }
        
        //Convert array of properties to related objects
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
    
    //Create binary tree search structure to improve access speed to properties
    _assignProps(props){
        this.props = new Map();
        for(let it of props){
            this.props.set(it.key,it);
        }
    }
    
    //Remove unnesesarry spaces from string
    _fixStr(str){
        let len = str.length;
        let retstr = '';
        let oQuote = false;
        let oQuotes = false;
        let C = this.C;
        for(let i=0;i<len;i++){
            let b = str[i];
            
            //check for open single or double quotes
            if(b == C.SINGLEQUOTE && !oQuotes && (!oQuote || str[i-1] != C.ESCCHAR) )
                oQuote = !oQuote;
            if(b == C.DOUBLEQUOTE && !oQuote && (!oQuotes || str[i-1] != C.ESCCHAR) )
                oQuotes = !oQuotes;
            
            //Ignore spaces before and after the equals symbol, < starting and > ending symbols
            if( 
                i<len-1 && this._isEmptyChar(b) && this._isEmptyChar(str[i+1]) ||
                this._isEmptyChar(b) && str[i+1] == C.EQUALSCHAR && !oQuote && !oQuotes ||
                this._isEmptyChar(b) && str[i-1] == C.EQUALSCHAR && !oQuote && !oQuotes ||
                b == C.STARTTAG && i == 0 ||
                b == C.FINISHTAG && i == len-1
            ){
                continue;
            }
            
            //Replace splca characters with spacebar
            if(this._isEmptyChar(b))
                b = C.SPACECHAR;
            retstr += b;
        }
        return retstr;
    }
    
    //Generator function to make this object iterable
    //Recoursively move through thr all children tags
    *_req(tag, cb){
        //Ignore root tag
        if(!tag.isRoot())
            yield tag;
        for(let i=0;i<tag.children.length;i++){
            yield * this._req(tag.children[i]);
        }
    }
    
    //Iterator function
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
//Static property
HTMLParserTag.ROOT = Symbol('ROOT');

module.exports = HTMLParserTag;