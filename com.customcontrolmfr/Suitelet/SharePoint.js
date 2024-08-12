/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/https', 'N/log', 'N/record', 'N/redirect', 'N/ui/serverWidget'],

function(file, https, log, record, redirect, serverWidget) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        try {

        	if (context.request.method == 'GET') {
        		
            	var form = serverWidget.createForm({
                    title: 'SharePoint',
                });

            	//form.clientScriptModulePath = '../ClientScript/SharePoint.js';
/*
            	if (context.request.parameters.temp) {
            		
            		var html = '<a href="' + context.request.parameters.temp  + '" style="font-size:14px;" download>Download Template</a>';
            		
                	var fld = form.addField({
                        id: 'custpage_temp',
                        label: ' ',
                        type: serverWidget.FieldType.INLINEHTML
                    });
                	
                	fld.defaultValue = html;
            	}
*/
            	//addHiddenField(form, 'custpage_id', context.request.parameters.iid);

                createProjectInSharepoint();

                context.response.writePage(form);
        	}
        	else if (context.request.method === 'POST') {
        			
                redirect.redirect({
                    url: context.request.parameters.custpage_referer
                });
            }
        }
        catch(e) {
        	  
            log.error('SharePoint',e);
        }    
    }

    function createProjectInSharepoint() {

		log.debug({
			title: 'Function',
			details: 'createProjectInSharepoint'
		});
/*
		var name = context.newRecord.getValue({
			fieldId: 'entityid'
		});

		log.debug({
			title: 'entityid',
			details: name
		});
*/
		var accessToken = getSharepointAccessToken();

		var siteList = 'Projects';
		var documentSetName = 'AAAAA';
		
		var payload = {
			'Title': documentSetName,
			'Path': siteList
		};

        var body = JSON.stringify(payload);

		var contentTypeId = '0x0120D520004DD1D722C3A89E4CAB56CC6AF96226740200B97B93C6A08A0D42BE8B5F63EACF1A1E';
		
		var slug = siteList + '/' + documentSetName + '|' + contentTypeId;

		var headers = ({
			'Authorization': 'Bearer ' + accessToken,
			'Accept': 'application/json;odata=verbose',
			'Content-Type': 'application/json;odata=verbose',
			'Content-Length': body.length,
			'Slug': slug
		});

        https.post.promise({
            url: 'https://customcontrolmfr.sharepoint.com/sites/Projects/_vti_bin/listdata.svc/' + siteList,
            body: body,
            headers: headers
        })
		.then(function(response) {

            var jsonResponse = JSON.parse(response);

            log.debug({
                title: 'jsonResponse',
                details: jsonResponse
            });
/*
            var payload = {'Status':'In Progress'};

            var body = JSON.stringify(payload);

            headers['Content-Length'] = body.length;
            headers['X-HTTP-Method'] = 'PATCH';
            headers['If-Match'] = '*';
            
            delete headers.Slug;
    
            await https.post({
                url: 'https://customcontrolmfr.sharepoint.com/sites/Projects/_api/web/lists/' + siteList + '/items(' + jsonResponse.d.Id + ')',
                body: body,
                headers: headers.replace('verbose', 'nometadata')
            })
            .then(function(response) {

                log.debug({
                    title: 'response',
                    details: response
                });    
            })
            .catch(function onRejected(reason) {

                log.debug({
                    title: 'Error updating project in SharePoint',
                    details: reason
                });
            });
*/		})
		.catch(function onRejected(reason) {

            log.debug({
                title: 'Error creating project in SharePoint',
                details: reason
            });
		});
    }

    function getSharepointAccessToken() {

		log.debug({
			title: 'Function',
			details: 'getSharepointAccessToken'
		});

		// App
		
		var clientId = '6b1bdaae-40fd-4388-b0bc-a81101b1559e';
		var clientSecret = 'o4FTjrD2i9M3jlj+4LL3RSzYIRvPYJgbTWNgViV0kzU=';
		
		// SharePoint
		
		var spTenantId = 'f6b77b80-1c7c-4716-9ade-e0f388f7c5bf';
		var spClientId = '00000003-0000-0ff1-ce00-000000000000';
		var spDomain = 'customcontrolmfr.sharepoint.com';
		
		var headers = ({
			'Content-Type': 'application/x-www-form-urlencoded'
		});

		var body = ({
			'grant_type': 'client_credentials',
			'client_id': clientId + '@' + spTenantId,
			'client_secret': clientSecret,
			'resource': spClientId + '/' + spDomain + '@' + spTenantId
		});
		
		var response = https.post({
			url: 'https://accounts.accesscontrol.windows.net/' + spTenantId + '/tokens/OAuth/2',
			body: body,
			headers: headers
		});

		log.debug({
			title: 'Access Token Headers',
			details: response.headers
		});

		log.debug({
			title: 'Access Token Body',
			details: response.body
		});

		var jsonBody = JSON.parse(response.body);

		return jsonBody.access_token
	}

    function addHiddenField(form, id, dflt) {
    	
        var field = form.addField({
    	    id : id,
    	    type : serverWidget.FieldType.TEXT,
    	    label : ' '
    	});
        
        field.defaultValue = dflt;

        field.updateDisplayType({
    	    displayType: serverWidget.FieldDisplayType.HIDDEN
    	});
    }
    
    return {
        onRequest: onRequest
    };   
});
