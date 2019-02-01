const HTMLParserBase = require("./HTMLParserBase");
const HTMLParserTag = require("./HTMLParserTag");

class HTMLParser extends HTMLParserBase{
    
    constructor(html){
        //Call parent constructor
        super();
        
        //Parse html if exists
        this.html(html);
    }
    
    html(html){
        if(html)
            this.parse(html);
    }
    
    //Parse html
    parse(str){
        let i=0;
        
        //Create ROOT tag
        let cTag = new HTMLParserTag(HTMLParserTag.ROOT);
        this.ROOT = cTag;
        
        //record the depth of tag
        //helps to recognize invalid html structure
        let tagsStack = [];
        
        //Constants
        let C = this.C;
        
        for(;i<str.length;i++){
            let a = str[i];
            
            //Find open tag symbol (<)
            if(a == C.STARTTAG){
                let tagName = '';
                let j=i+1;
                let oQuote = false;
                let oQuotes = false;
                let closeTag = false;
                let tagFinished = false;
                let start = i;
                
                //find the finish tag symbol (>)
                while(j < str.length){
                    let b = str[j];
                    
                    //Check for double ">" in a row
                    if(b == C.STARTTAG && !tagName.length){
                        j++;
                        continue;
                    }
                    
                    //closing tag found (</...)
                    if(b == C.CLOSETAG && !tagName.length){
                        closeTag = true;
                        j++;
                        continue;
                    }
                    
                    //Define tag name
                    if(this._isEmptyChar(b)){
                        tagFinished = true;
                    }
                    
                    // finishing tag symbol (>) found and no quotes opened
                    if(b == C.FINISHTAG && !oQuote && !oQuotes){
                        i = j;
                        
                        //Ignore if no tagname
                        if(!tagName.length)
                            break;
                        
                        tagName = tagName.toLowerCase();
                        
                        //remove tag from stack as it closed now
                        if(closeTag){
                            
                            //If no such open tag found ignore it
                            if(!tagsStack.includes(tagName))
                                break;
                            
                            //If the new tag is not last in the stack, 
                            //close all tags before the new
                            while(tagsStack.length){
                                let popTag = tagsStack.pop();
                                cTag = cTag.parent;
                                if(popTag == tagName)
                                    break;
                            }
                            break;
                        }
                        
                        //Create tag class instance 
                        let t = new HTMLParserTag(str.substr(start,j-start+1));
                        
                        //Append it as children of our last tag
                        cTag.append(t);
                        
                        //Check for "script", "style" and "textarea" that ignores tags inside
                        if(this._isPlainTag(t)){
                            
                            ///@TODO
                            //this part should be recoded as it works very slow;
                            //Worst case of whole algorithm because of this part growth from O(n) to O(n^2) 
                            //where n is the length of html document
                            let ind = this._closePlainIndex(str.substr(i), t.tagName);
                            
                            //If no closing plain tag found finish parsing
                            if(ind < 0)
                                i = str.length;
                            else
                                i += ind;
                                
                        }
                        
                        //If no single tag found (br, wbr, hr, input, etc...)
                        if(!this._isSingleTag(t)){
                            //Add it to stack
                            tagsStack.push(t.tagName);
                            
                            //And reassign current tag
                            cTag = t;
                        }
                        break;
                    }
                    
                    //Add characted to tagname if no space char fould yet
                    if(!tagFinished)
                        tagName += b;
                    
                    //Check for opened single or double quotes
                    if(b == C.SINGLEQUOTE && !oQuotes && (!oQuote || str[j-1] != C.ESCCHAR) )
                        oQuote = !oQuote;
                    if(b == C.DOUBLEQUOTE && !oQuote && (!oQuotes || str[j-1] != C.ESCCHAR) )
                        oQuotes = !oQuotes;
                    j++;
                }
            }
        }
    }

    
    //Return iterable object
    iterateTags(){
        return this.ROOT;
    }
    
    //Worst method here that finds the closing tag
    _closePlainIndex(str, tagName){
        return str.search(new RegExp('<\/'+tagName+'(\s*|\s[\S\s]*)>','gi'));
    }
    
    //Check for "script", "style" and "textarea" tags that ignoring tags inside;
    _isPlainTag(tag){
        if(tag instanceof HTMLParserTag)
            return this._plainTags.includes(tag.tagName);
        return this._singleTags.includes(tag);
    }
    
    //Check if this tag is single (br, wbr, hr, input, etc...)
    _isSingleTag(tag){
        if(tag instanceof HTMLParserTag)
            return this._singleTags.includes(tag.tagName);
        return this._singleTags.includes(tag);
    }
    
}

module.exports = HTMLParser;
