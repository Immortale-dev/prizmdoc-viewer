const express = require('express');
const router = express.Router();
const pas = require('../../pas/pasRequest');
const Validator = require('../../validator/Validator');
//debugger;

router.post('/upload/', async (req,res)=>{
    
    let fileError = ['Something bad happend. Please try again later'];
    
    let data;
    let name = req.body.name||'test.html';
    try{
        data = Buffer.from(req.body.data, 'base64');
    }catch(e){
        console.warn(e);
        return res.json({
            success: false,
            errors: fileError
        });
    }
    
    let errors = validate(data);
    if(errors.length){
        return res.json({
            success: false,
            errors
        });
    }
    
    let id = await viewDocument(name, data);
    
    res.json({
        success: true,
        id
    });
    
});

module.exports = router;



function validate(data){
    let v = new Validator();
    return v.check(data.toString('utf8'));
}


function viewDocument(name, data){
    
    return new Promise(async (resolve, reject)=>{
            
        let prizmdocRes;
        // 1. Create a new viewing session
        prizmdocRes = await pas.post('/ViewingSession', { // See https://help.accusoft.com/PrizmDoc/v13.5/HTML/webframe.html#pas-viewing-sessions.html
        json: {
          source: {
            type: 'upload',
            displayName: name
          }
        }
        });
        const viewingSessionId = prizmdocRes.body.viewingSessionId;

        // 2. Send the viewingSessionId and viewer assets to the browser right away so the viewer UI can start loading.
        resolve(viewingSessionId);

        // 3. Upload the source document to PrizmDoc so that it can start being converted to SVG.
        //    The viewer will request this content and receive it automatically once it is ready.
        prizmdocRes = await pas.put(`/ViewingSession/u${viewingSessionId}/SourceFile`, {
            body: data
        });
    });
}



