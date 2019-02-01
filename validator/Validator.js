const HTMLParser = require('./parser/index.js');

class HTMLValidator{
    
    constructor(st){
        this._defaults();
        this.setSettings(st);
    }
    
    setSettings(settings){
        if(settings)
            this.settings = {...settings};
    }
    
    check(str, settings){
        let dom = new HTMLParser(str);
        let allpass = true;
        let msgs = [];
        settings = settings || this.settings;
        for(let tag of dom.iterateTags()){
            if(settings[tag.tagName])
                msgs.push(...settings[tag.tagName](tag));
            if(settings['*'])
                msgs.push(...settings['*'](tag));
        }
        return msgs.filter( (val,ind,self) => self.indexOf(val) === ind);
    }
    
    _defaults(){
        let disProps = ["abort","afterprint","animationend","animationiteration","animationstart","beforeprint","beforeunload","blur","canplay","canplaythrough","change","click","contextmenu","copy","cut","dblclick","drag","dragend","dragenter","dragleave","dragover","dragstart","drop","durationchange","ended","error","focus","focusin","focusout","fullscreenchange","fullscreenerror","hashchange","input","invalid","keydown","keypress","keyup","load","loadeddata","loadedmetadata","loadstart","message","mousedown","mouseenter","mouseleave","mousemove","mouseover","mouseout","mouseup","offline","online","open","pagehide","pageshow","paste","pause","play","playing","progress","ratechange","resize","reset","scroll","search","seeked","seeking","select","show","stalled","submit","suspend","timeupdate","toggle","touchcancel","touchend","touchmove","touchstart","transitionend","unload","volumechange","waiting","wheel"];
        let disObj = {};
        for(let p of disProps){
            disObj['on'+p] = true;
        }
        let sett = {
            '*': function(tag){
                //if(tag.tagName == 'img' || tag.tagName == 'iframe')
                //    debugger;
                let err = [];
                for(let p of tag.iterateProps()){
                    let pr = p[1];
                    if(disObj[pr.key])
                        err.push('Found Disallowed Property: '+pr.key);
                }
                if(tag.tagName == 'img')
                    return err;
                if(tag.hasProp('src') && tag.getProp('src').val && tag.getProp('src').val.indexOf('file://') === 0)
                    err.push('Found source link to local file');
                return err;
            },
            'script': function(tag){
                return ["Found Script Tag"];
            },
            'iframe': function(tag){
                if(tag.hasProp('srcdoc'))
                    return ["Found Iframe with srcdoc property"];
                let src = tag.getProp('src').val;
                if(src.indexOf('http://') === 0 || src.indexOf('https://') === 0 || src.indexOf('//') === 0 || src.indexOf('file://'))
                    return ["Found Iframe with cross domain requests"];
                return [];
            },
            'img': function(tag){
                let src = tag.getProp('src').val;
                if(src && src.indexOf('file://') === 0)
                    return ["Found Image with source on local file"];
                return [];
            }
        }
        this.setSettings(sett);
    }
    
}


module.exports = HTMLValidator;