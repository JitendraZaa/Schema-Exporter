/*
 * Copyright  2022 IBM, Author - Jitendra Zaa
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *        https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @date          May 2022
 * @author        Jitendra Zaa
 * @email         jitendra.zaa@ibm.com
 * @description   Main class that acts as entry point
 */


import {core, flags, SfdxCommand} from '@salesforce/command';
import {objectDesc,
        sobjectRes,
        objectPageLayouts,
        recordType,
        fieldInfoAdditional,
        fieldInfo,
        pageLayoutInfo
      } 
        from '../../scripts/pojo';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);
import excelUtil = require('../../scripts/createFile');
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-object-export', 'org');

//Version of Salesforce API that needs to be connected
const sfVersion = '54.0';

export default class fileoutput extends SfdxCommand {
  
    public static description = messages.getMessage('schemaCommandDescription');
  
    public static examples = [ 
    `Example : sfdx schema:build -u LWC1_Scratch1 -o "Account,Lead,Opportunity,Contact,AccountTeamMember,OpportunityTeamMember,Campaign,CampaignMember,Product2" ` 
    ];
   
      // Comment this out if your command does not require an org username
      protected static requiresUsername = true;
  
      // Comment this out if your command does not support a hub org username
      protected static supportsDevhubUsername = true;
    
      // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
      protected static requiresProject = false;
    
    protected static flagsConfig = { 
      msg: flags.string({char: 'm', description: messages.getMessage('msgFlagDescription')}),
      force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')}),
      path :  flags.string({char: 'p', description: messages.getMessage('pathFlagDescription')}),
      objects : flags.string({char: 'o', description: messages.getMessage('objectFlagDescription')}),  
    };
   
    //Must implement method - run as per contact from SfdxCommand interface
    public async run(): Promise<core.AnyJson> { 
      this.ux.startSpinner('Started Object Export');

      const objects = this.flags.objects  ;     
      const filePath = this.flags.path || "/Users/jitendrazaa/Downloads/ObjectInfo.xlsx" ;  

      const conn = this.org.getConnection();
              
    //this.ux.log(this.flags.objects);

    var objNames = new Array<String>();
    var combinedMetadata = new Array<objectDesc>();
    //var lstRecTypes = new Array<recordType>();
    var lstpageLayoutInfo = new Array<pageLayoutInfo>();
    var mpObjectPageLayouts = new Map<string,Array<pageLayoutInfo>>();
 
    //Identify which object to consider for configuration workbook
    if(objects){ 
        var objectContext = objects.split(',');
        objectContext.forEach(element => {
            objNames.push(element); 
        });
    }else{ 
      try{
        const objNameResult = await conn.request('/services/data/v'+sfVersion+'/sobjects'); 
        var sObjectRef = objNameResult as sobjectRes;    
        for(var i=0;i<sObjectRef.sobjects.length;i++){       
            objNames.push(sObjectRef.sobjects[i].name);   
        }
      }catch(e){
        this.ux.log('Error encountered while trying to get object names. Possibilities of invalid API version. Error - '+e.message);
      } 
    }

    /**
     * ======================================================================================================
     *                              POC Page Layouts - Start
     * ======================================================================================================
     */
     this.ux.log('Started POC for Layout');
     for(var i =0 ; i< objNames.length; i++){
      let layoutResult = await conn.request('/services/data/v'+sfVersion+'/sobjects/'+objNames[i]+'/describe/layouts/');  
      var objLayouts = layoutResult as objectPageLayouts;  
      var lstRecTypesByObject = objLayouts.recordTypeMappings as Array<recordType>;

      //this.ux.log('Going to print');
      //this.ux.log(objLayouts);
        for(var j =0 ; j< lstRecTypesByObject.length; j++){ 
          //this.ux.log(lstRecTypesByObject[j].layoutId);
          let resourceURL = '/services/data/v'+sfVersion+'/sobjects/'+objNames[i]+'/describe/layouts/'+lstRecTypesByObject[j].recordTypeId ;
          this.ux.startSpinner('Getting details about object - '+objNames[i]+' , Recordtype name - '+lstRecTypesByObject[j].name);
          //this.ux.log(resourceURL); 

          let pgLayoutObj :pageLayoutInfo = {};
          pgLayoutObj.objectName = objNames[i] as string;
          pgLayoutObj.recordTypeId = lstRecTypesByObject[j].recordTypeId ;
          pgLayoutObj.recordTypeName= lstRecTypesByObject[j].name;
          pgLayoutObj.fields = new Array<fieldInfoAdditional>(); 


          let layoutDetail = await conn.request(resourceURL); 
          let detailSection = layoutDetail["detailLayoutSections"];
          for(var k = 0; k< detailSection.length; k++){
            let lstLayoutRows = detailSection[k]["layoutRows"];
            
            for(var p = 0; p <lstLayoutRows.length ; p++){
              let lstLayoutItem = lstLayoutRows[p]["layoutItems"] ;
               
              for(var q = 0; q < lstLayoutItem.length; q++){
                let lstComponents = lstLayoutItem[q]["layoutComponents"];
                //this.ux.log('Check 1'); 

                for(var r = 0 ; r < lstComponents.length; r++){
                  var fieldDetail:fieldInfoAdditional = {};
                  let fieldInfo = lstComponents[r].details as fieldInfo;
                  //this.ux.log('Check 2'); 
                  //this.ux.log(fieldInfo); 
                  if(fieldInfo){
                    fieldDetail.fieldDetail = fieldInfo;
                    fieldDetail.editableForNew = lstComponents.editableForNew;
                    fieldDetail.editableForUpdate = lstComponents.editableForUpdate;
                    fieldDetail.apiName = fieldInfo.name;
                    fieldDetail.required = lstComponents.required;

                    pgLayoutObj.fields.push(fieldDetail);
                  }  
                } 
              } 
            }
          } 
          lstpageLayoutInfo.push(pgLayoutObj); 
        } 
        //lstRecTypes = lstRecTypes.concat(objLayouts.recordTypeMappings);
        //this.ux.log('Building Map 1' ); 
     }  
     this.ux.log(lstpageLayoutInfo.length);

     //this.ux.log('Building Map' );  
     //Build Map of all pagelayouts for object
     for( var i = 0; i< lstpageLayoutInfo.length;i++){
      let lstPage : Array<pageLayoutInfo> = mpObjectPageLayouts.get(lstpageLayoutInfo[i].objectName);
      if(!lstPage){
        lstPage = new Array<pageLayoutInfo>();
      }
      lstPage.push(lstpageLayoutInfo[i]);  
      mpObjectPageLayouts.set(lstpageLayoutInfo[i].objectName.toLowerCase(),lstPage); 
     }

     /*
     this.ux.log('Iterating Map' );  
     //Iterate through objects
     for(let key of mpObjectPageLayouts.keys()){
        this.ux.log('Object Name - '+key);  
        let lstPage : Array<pageLayoutInfo> = mpObjectPageLayouts.get(key.toLowerCase());
        for(let obj  of lstPage){
          //this.ux.log(obj.recordTypeName);
        }
     }
     */
     

     this.ux.log('Ended POC for Layout');
     //return ;
     /**
     * ======================================================================================================
     *                              POC Page Layouts - End
     * ======================================================================================================
     */

    //For each object , make API call to get details about fields
    for(var i =0 ; i< objNames.length; i++){
        this.ux.log('Getting Field Metadata From : '+objNames[i]);
        try{
          let fldResult = await conn.request('/services/data/v'+sfVersion+'/sobjects/'+objNames[i]+'/describe');
          var objRes = fldResult as objectDesc;  
          let lstPage : Array<pageLayoutInfo> = mpObjectPageLayouts.get(objRes.name.toLowerCase());
          //this.ux.log('***1');
          //this.ux.log(objRes.name);
          //this.ux.log(lstPage);
          objRes.recordTypes = lstPage;
          //this.ux.log('***2');
          this.ux.log(objRes.recordTypes);
          combinedMetadata.push(objRes);
        }catch(e){
          this.ux.log('Error while fetching object - '+objNames[i]+', Message - '+e.message); 
        } 
    }

    //Generate Excel file 
    await excelUtil.createFile(filePath,combinedMetadata,this);

    this.ux.log('Excel File created at - '+filePath);
    this.ux.stopSpinner('Export Completed');

    return { orgId: this.org.getOrgId() , "Plugin":"Schema Exporter SalesforceDX Plugin" };
    }
  }
  