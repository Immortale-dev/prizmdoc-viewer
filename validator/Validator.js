const HTMLParser = require('./parser/index.js');

class HTMLValidator{
    
    constructor(st){
        this._defaults();
        this.setSettings(st);
    }
    
    //Set settings if such found
    setSettings(settings){
        if(settings)
            this.settings = {...settings};
    }
    
    
    //Function that uses HTMLParser class
    check(str, settings){
        
        //Parse the html
        let dom = new HTMLParser(str);
        
        let msgs = [];
        
        //Get the settings
        settings = settings || this.settings;
        
        //Iterate all tags
        for(let tag of dom.iterateTags()){
            
            //If current tag found it settings, call the validator function it is match
            if(settings[tag.tagName])
                msgs.push(...settings[tag.tagName](tag));
            
            //For all tags match
            if(settings['*'])
                msgs.push(...settings['*'](tag));
        }
        
        //And return all found errrors
        return msgs.filter( (val,ind,self) => self.indexOf(val) === ind);
    }
    
    //set default settings that match trial task requirements
    _defaults(){
        
        //All dom elements event found from https://www.w3schools.com/jsref/dom_obj_event.asp
        let disProps = ["abort","afterprint","animationend","animationiteration","animationstart","beforeprint","beforeunload","blur","canplay","canplaythrough","change","click","contextmenu","copy","cut","dblclick","drag","dragend","dragenter","dragleave","dragover","dragstart","drop","durationchange","ended","error","focus","focusin","focusout","fullscreenchange","fullscreenerror","hashchange","input","invalid","keydown","keypress","keyup","load","loadeddata","loadedmetadata","loadstart","message","mousedown","mouseenter","mouseleave","mousemove","mouseover","mouseout","mouseup","offline","online","open","pagehide","pageshow","paste","pause","play","playing","progress","ratechange","resize","reset","scroll","search","seeked","seeking","select","show","stalled","submit","suspend","timeupdate","toggle","touchcancel","touchend","touchmove","touchstart","transitionend","unload","volumechange","waiting","wheel"];
        
        //Convert them to object as it it much fast to access
        let disObj = {};
        for(let p of disProps){
            disObj['on'+p] = true;
        }
        
        
        let sett = {
            
            //Match for all tags
            '*': function(tag){
                let err = [];
                for(let p of tag.iterateProps()){
                    let pr = p[1];
                   
                    //If property (event) that may execute JS found return an error;
                    if(disObj[pr.key])
                        err.push('Found Disallowed Property: '+pr.key);
                }
                
                //We are checking images at the bottom :)
                if(tag.tagName == 'img')
                    return err;
                
                
                
                //If source property exsits and it is looking for local file, return an error
                if(tag.hasProp('src') && tag.getProp('src').val && tag.getProp('src').val.indexOf('file://') === 0)
                    err.push('Found source link to local file');
                
                ///@TODO
                //need to check for background-image that looking for local file also...
                
                return err;
            },
            
            //Match script tags
            'script': function(tag){
                //All scripts disallowed
                return ["Found Script Tag"];
            },
            
            //Match for iframes tags
            'iframe': function(tag){
                
                //If it has srcdoc it should be blocked aswell as it is almost the same as script tag
                if(tag.hasProp('srcdoc'))
                    return ["Found Iframe with srcdoc property"];
                
                //get the source property
                let src = tag.getProp('src').val;
                
                //Check if it is looking for cross domain links and return an error if so
                if(src.indexOf('http://') === 0 || src.indexOf('https://') === 0 || src.indexOf('//') === 0 || src.indexOf('file://'))
                    return ["Found Iframe with cross domain requests"];
                
                //If nothing found, return empty error array
                return [];
            },
            
            //Match for images tags
            'img': function(tag){
                
                //Get the source
                let src = tag.getProp('src').val;
                
                //Check if it is looking for local file and return an error if so
                if(src && src.indexOf('file://') === 0)
                    return ["Found Image with source on local file"];
                
                //No errors else
                return [];
            }
        }
        
        //Assing this default settings
        this.setSettings(sett);
    }
    
}


module.exports = HTMLValidator;