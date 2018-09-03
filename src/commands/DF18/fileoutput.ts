import {core, flags, SfdxCommand} from '@salesforce/command';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);
import excelUtil = require('../../scripts/createFile');

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-object-export', 'org');

export default class fileoutput extends SfdxCommand {
  
    public static description = messages.getMessage('commandDescription');
  
    public static examples = [ 
    `Example : sfdx DF18:fileoutput -u jit27 -m "Account,Lead,Opportunity" ` 
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
      path :  flags.boolean({char: 'p', description: messages.getMessage('pathFlagDescription')})  
    };
   
    //Must implement method - run as per contact from SfdxCommand interface
    public async run(): Promise<core.AnyJson> {
      const msg = this.flags.msg  ;     
      const filePath = this.flags.path || "/Users/jitendra.zaaibm.com/Desktop/ObjectInfo.xlsx" ;  

      const conn = this.org.getConnection();
       
      
      interface sObject {
        activateable: boolean;
        createable: boolean;
        custom: boolean;
        customSetting: boolean;
        deletable: boolean;
        deprecatedAndHidden: boolean;
        feedEnabled: boolean;
        hasSubtypes: boolean;
        isSubtype: boolean;
        keyPrefix: string;
        label: string;
        labelPlural: string;
        layoutable: boolean;
        mergeable: boolean;
        mruEnabled: boolean;
        name: string;
        queryable: boolean;
        replicateable: boolean;
        retrieveable: boolean;
        searchable: boolean;
        triggerable: boolean;
        undeletable: boolean;
        updateable: boolean;
      }

      interface fieldInfo{
        label : string;
        name : string;
        custom : boolean;
        inlineHelpText : string ;
      }
      interface objectDesc{
        name : string;
        fields:Array<fieldInfo>;
      }

      interface sobjectRes{
        encoding:string;
        maxBatchSize : number;
        sobjects : Array<sObject>;
    }
 
    //this.ux.log(this.flags.objects);

    var objNames = new Array<String>();
    var combinedMetadata = new Array<objectDesc>();

    if(msg){ 
        var objectContext = msg.split(',');
        objectContext.forEach(element => {
            objNames.push(element); 
        });
    }else{
        const objNameResult = await conn.request('/services/data/v43.0/sobjects'); 
        var sObjectRef = objNameResult as sobjectRes;    
        for(var i=0;i<sObjectRef.sobjects.length;i++){       
            objNames.push(sObjectRef.sobjects[i].name);   
        }
    }

    for(var i =0 ; i< objNames.length; i++){
        this.ux.log('Getting Field Metadata From : '+objNames[i]);
        let fldResult = await conn.request('/services/data/v43.0/sobjects/'+objNames[i]+'/describe');
        var objRes = fldResult as objectDesc;  
        combinedMetadata.push(objRes);
    }
 
    /*
    combinedMetadata.forEach(element => {
        this.ux.log(element.name);

        element.fields.forEach(fld => {
            this.ux.log(fld.name);
        });
    });
    */
      await excelUtil.createFile(filePath,combinedMetadata);
      this.ux.log('Excel File created at - '+filePath);
      //print below if --json flag is used 
      return { orgId: this.org.getOrgId() , "Dreamforce":"Best time of Year" };
    }
  }
  