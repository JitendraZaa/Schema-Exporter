SFDX Plugin to export Salesforce Schema  
==================

Export Salesforce Schema in Excel sheet using this plugin built on top of SFDX

## Capabilities
1. Export Selcted OR All object Metadata in Excel sheet
1. Export dependent Picklists in Excel sheet

## Important Links
1. [Salesforce Core API Documentation](https://forcedotcom.github.io/sfdx-core/globals.html)

## Prerequisite 
* Git
* SFDX

## Steps to use Plugin

### Step 1 
Open COnsole / Terminal and Clone this repository at appropriate location by runing command 
`https://github.com/JitendraZaa/Schema-Exporter.git`

### Step 2
Navigate to folder `Schema-Exporter` then 

run command `sfdx plugins:link`

### Step 3
Assume you have org alias authenticated in sfdx with name `jit11`
Run below sample command against sfdx org `jit11`

`sfdx schema:build -u jit11 -o "User,Account,Lead" -p "some/path/ObjectInfo.xlsx"`

-u : Authenticated user
-o : Comma separated list of object to fetch
-p : Path where excel sheet needs to be generated

If we run below command without any object, it will export every object of Org

`sfdx schema:build -u jit11 -p "some/path/ObjectInfo.xlsx"`

### Ideas
1. Add user name, profile name in summary so that we know creatable , updatable etc are on which profile
2. Reorder fields so that most commonly populated fields displayed first and least populated fields like creatable, formula etc later
3. try to link all objects with tab. Attempted it but didnt work
4. In summary , along with object name, show total field and total custom fields
5. Show validation rules, page layout, Process builder & trigger associated with Object
6. Check if object is empty with 0 recoerds. Use SOQL like 'Select Count(ID) FROM object X limit 50000'. It will help to say records are 50k+ or not
7. How many fields on each pagelyaouts
8. Which pagelayouts are unused and not assigned against any profile
9. Matrix of profile with object permissions 


### Notes
1. creating hyperlink cell in excel4node
```
//=HYPERLINK("[Budget]June!E56", E56), budget sheet name, June workbook name
//let linkFormula = 'Hyperlink('+element.name+'!A1,"'+element.name+'")' ;
//ws_info.cell( rowNumber + row_Offset_InfoSheet,4 + col_Offset_InfoSheet).formula(linkFormula);
//let linkFormula =  element.name; 
//ws_info.cell( rowNumber + row_Offset_InfoSheet,4 + col_Offset_InfoSheet).string(linkFormula);  
```

2. Getting object permissions from profile [Blog Link](https://developer.salesforce.com/blogs/engineering/2012/06/using-soql-to-determine-your-users-permissions-2)
```
SELECT Id, SObjectType, PermissionsRead, PermissionsCreate, PermissionsEdit , PermissionsDelete, PermissionsModifyAllRecords , PermissionsViewAllRecords FROM ObjectPermissions WHERE parentid in (select id from permissionset where PermissionSet.Profile.Name = 'System Administrator')
```

### Known Issue
1. Handling controlling picklist is trick as per [this documentation](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_calls_describesobjects_describesobjectresult.htm#aboutPicklists) & [this stack exchange](https://salesforce.stackexchange.com/questions/201775/picklists-validfor-attribute) , decoding logic would be needed to know which value is ACTUALLY controlling value. Therefore commenting this WIP code. [Solution documented in type script](https://reergymerej.github.io/blog/2021/03/31/base64binary.html)

### Uninstalling Plugin
Rune below Command

`sfdx plugins:uninstall "<Path of Plugin Located>"`

### In case of any error while linking plugin, run below commands
```
rm -rf node_modules
yarn cache clean
yarn
sfdx plugins:link
```
