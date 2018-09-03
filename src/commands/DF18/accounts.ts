import {core, flags, SfdxCommand} from '@salesforce/command';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-object-export', 'org');

export default class accounts extends SfdxCommand {
  
    public static description = messages.getMessage('commandDescription');
  
    public static examples = [
    `Sample example to run command goes here`,
    `Other example goes here`,
    `This demo takes flag -m , to echo message`,
    `Example : sfdx DF:18:helpdemo -u <USERALIAS> -m <Your Message>` 
    ];
   
      // Comment this out if your command does not require an org username
      protected static requiresUsername = true;
  
      // Comment this out if your command does not support a hub org username
      protected static supportsDevhubUsername = true;
    
      // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
      protected static requiresProject = false;
    
    protected static flagsConfig = {
      // flag with a value (-n, --name=VALUE)
      msg: flags.string({char: 'm', description: messages.getMessage('msgFlagDescription')}),
      force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')})
    };
   
    //Must implement method - run as per contact from SfdxCommand interface
    public async run(): Promise<core.AnyJson> {
      const msg = this.flags.msg || 'Best time of year is Dreamforce';       
      
      const conn = this.org.getConnection();
      const query = 'Select Id, Name From Account';

      // The type we are querying for
      interface Account {
        Id: string;
        Name: string;
      }

      const result = await conn.query<Account>(query);

      if (!result.records || result.records.length <= 0) {
        throw new core.SfdxError(messages.getMessage('errorNoOrgResults', [this.org.getOrgId()]));
      }

      this.ux.log('Id                 -  Account Name');
      result.records.forEach( element => {
        this.ux.log(element.Id+'    '+element.Name);
      } );
    
     
      //print below if --json flag is used 
      return { orgId: this.org.getOrgId() , "Dreamforce":"Best time of Year" };
    }
  }
  