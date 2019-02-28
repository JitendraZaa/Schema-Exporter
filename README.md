SFDX Plugin to export Salesforce Schema  
==================

Export Salesforce Schema in Excel sheet using this plugin built on top of SFDX

## Prerequisite 
* Git
* SFDX

## Steps to use Plugin

### Step 1 
Open COnsole / Terminal and Clone this repository at appropriate location by runing command 
`https://github.com/JitendraZaa/Schema-Exporter.git`

### Step 2
Navigate to folder `Schema-Exporter` and run command `sfdx plugins:link`

### Step 3
Assume you have org alias authenticated in sfdx with name `jit11`
Run below sample command against sfdx org `jit11`

sfdx schema:build -u LWC1_Scratch1 -o "User,Account,Lead" -p "some/path/ObjectInfo.xlsx"

-u : Authenticated user
-o : Comma separated list of object to fetch
-p : Path where excel sheet needs to be generated

