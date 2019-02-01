const HTMLParserBase = require("./HTMLParserBase");
const HTMLParserTag = require("./HTMLParserTag");

class HTMLParser extends HTMLParserBase{
    
    constructor(html){
        super();
        this.html(html);
    }
    
    html(html){
        if(html)
            this.parse(html);
    }
    
    parse(str){
        let i=0;
        let cTag = new HTMLParserTag(HTMLParserTag.ROOT);
        this.ROOT = cTag;
        let tagsStack = [];
        let C = this.C;
        for(;i<str.length;i++){
            let a = str[i];
            if(a == C.STARTTAG){
                //debugger;
                let tagName = '';
                let j=i+1;
                let oQuote = false;
                let oQuotes = false;
                let closeTag = false;
                let tagFinished = false;
                let start = i;
                while(j < str.length){
                    let b = str[j];
                    if(b == C.STARTTAG && !tagName.length){
                        j++;
                        continue;
                    }
                    if(b == C.CLOSETAG && !tagName.length){
                        closeTag = true;
                        j++;
                        continue;
                    }
                    if(this._isEmptyChar(b)){
                        tagFinished = true;
                    }
                    if(b == C.FINISHTAG && !oQuote && !oQuotes){
                        i = j;
                        if(!tagName.length)
                            break;
                        if(closeTag){
                            if(!tagsStack.includes(tagName))
                                break;
                            while(tagsStack.length){
                                let popTag = tagsStack.pop();
                                cTag = cTag.parent;
                                if(popTag == tagName)
                                    break;
                            }
                            break;
                        }
                        let t = new HTMLParserTag(str.substr(start,j-start+1));
                        cTag.append(t);
                        if(this._isPlainTag(t)){
                            let ind = this._closePlainIndex(str.substr(i), t.tagName);
                            if(ind < 0)
                                i = str.length;
                            else
                                i += ind;
                                
                        }
                        if(!this._isSingleTag(t)){
                            tagsStack.push(t.tagName);
                            cTag = t;
                        }
                        break;
                    }
                    if(!tagFinished)
                        tagName += b;
                    if(b == C.SINGLEQUOTE && !oQuotes && (!oQuote || str[j-1] != C.ESCCHAR) )
                        oQuote = !oQuote;
                    if(b == C.DOUBLEQUOTE && !oQuote && (!oQuotes || str[j-1] != C.ESCCHAR) )
                        oQuotes = !oQuotes;
                    j++;
                }
            }
        }
    }

    iterateTags(){
        return this.ROOT;
    }
    
    _closePlainIndex(str, tagName){
        return str.search(new RegExp('<\/'+tagName+'(\s*|\s[\S\s]*)>','gi'));
    }
    
    _isPlainTag(tag){
        if(tag instanceof HTMLParserTag)
            return this._plainTags.includes(tag.tagName);
        return this._singleTags.includes(tag);
    }
    
    _isSingleTag(tag){
        if(tag instanceof HTMLParserTag)
            return this._singleTags.includes(tag.tagName);
        return this._singleTags.includes(tag);
    }
    
}

module.exports = HTMLParser;
