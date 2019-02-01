(function(){
    
    let $errorsBlock, $inputBlock, $containerBlock;
    
    let formatError = ['Content type of reviewing document should be text/html'];
    let fileReadError = ['Something bad happend, please try again'];
    let fileUploadError = ['Sorry, we can\'t upload the file. Please try again later'];

    $(document).ready(function(){
        
        $errorsBlock = $('.errors');
        $inputBlock = $('#fileUpload');
        $containerBlock = $('#viewerContainer');
        
        $("#fileUpload").on('change',function(){
            
            
            hideErrors();
            
            let file = this.files[0];
            if(file.type != 'text/html'){
                showErrors(formatError);
                return;
            }

            getFileBase64(file, function(err, data){
                
                if(err) return showErrors(fileReadError);
                
                getFileId(file.name, data, function(err, data){
                    
                    if(err) return showErrors(fileUploadError);
                    
                    if(!data.success) return showErrors(data.errors);
                    
                    viewDocument(data.id);
                    
                });
                
            });
            
        });
        
    });

    function hideErrors(){
        $errorsBlock.html('');
    }

    function showErrors(errors){
        for(let i=0;i<errors.length;i++){
            $errorsBlock.append($('<p>').addClass('text-error').html(errors[i]));
        }
    }

    function viewDocument(id){
        $containerBlock.pccViewer({
            documentID:       id,
            imageHandlerUrl:  '/pas-proxy',        // Base path the viewer should use to make requests to PAS (PrizmDoc Application Services).
            viewerAssetsPath: 'viewer-assets',     // Base path the viewer should use for static assets
            resourcePath:     'viewer-assets/img', // Base path that viewer-core should use for images
            language: viewerCustomizations.languages['en-US'],
            template: viewerCustomizations.template,
            icons:    viewerCustomizations.icons,
            annotationsMode: "LayeredAnnotations"  // Use the new "LayeredAnnotations" system, which will persist annotation data as JSON (instead of the default "LegacyAnnotations" system, which uses a different XML format)
        });
    }
    
    function getFileBase64(file,cb){
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(){
            cb(null, this.result.split('base64,')[1]);
        }
        reader.onerror = function(err){
            cb(err);
        }
    }
    
    function getFileId(name, data, cb){
        $.ajax({
            method: 'post',
            url: '/api/upload/',
            data: JSON.stringify({data:data, name:name}),
            contentType: 'application/json'
        }).done(function(e){
            cb(null, e);
        }).error(function(){
            cb(true);
        });
    }

})();