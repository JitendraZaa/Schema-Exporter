import { core, flags, SfdxCommand } from '@salesforce/command';
import child_process = require('child_process');
import util = require('util');
var xl = require('excel4node');

const exec = util.promisify(child_process.exec);

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

var combinedMetadata = new Array<objectDesc>();

export async function createFile(fileName,combinedMetadata) {
 
    process.stdout.write('\nCreating file using Node Module \n');
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook();

    // Create a reusable style
    var headerStyle = wb.createStyle({
        font: {
            color: '#FFFFFF',
            size: 12 
        }, 
        fill: {
            type: 'pattern',  
            patternType: 'solid', 
            fgColor: '#0000FF'  
        }
        });

        var infoValueStyle = wb.createStyle({
             
            fill: {
                type: 'pattern',  
                patternType: 'solid', 
                fgColor: '#dddddd'  
            }
            });

        var wrap = wb.createStyle({ 
            alignment: {
              wrapText: true 
            },
          });
    
   
    InformationWorkSheet(wb,combinedMetadata);

        
    combinedMetadata.forEach(element => {

        var ws =  wb.addWorksheet(element.name);
        ws.cell(1,1).string('Label').style(headerStyle);
        ws.cell(1,2).string('Name').style(headerStyle); 
        ws.cell(1,3).string('Help Text').style(headerStyle);  
        ws.cell(1,4).string('Is Standard').style(headerStyle);  
        ws.cell(1,5).string('Formula').style(headerStyle); 
        ws.cell(1,6).string('Max Length').style(headerStyle); 
        ws.cell(1,7).string('Type').style(headerStyle); 
        ws.cell(1,8).string('Is unique').style(headerStyle); 
        ws.cell(1,9).string('precision').style(headerStyle); 
        ws.cell(1,10).string('Scale').style(headerStyle); 
        ws.cell(1,11).string('Encrypted').style(headerStyle); 
        ws.cell(1,12).string('ExternalId').style(headerStyle); 
        ws.cell(1,13).string('PicklistValues').style(headerStyle); 
        ws.cell(1,14).string('Is Creatable').style(headerStyle); 
        ws.cell(1,15).string('Is Updatable').style(headerStyle); 
        ws.cell(1,16).string('Is Required').style(headerStyle); 


        for(var i = 0; i< element.fields.length; i++){
            ws.cell(i+2,1).string(element.fields[i].label);
            ws.cell(i+2,2).string(element.fields[i].name);
            ws.cell(i+2,3).string(element.fields[i].inlineHelpText || ""); 
            ws.cell(i+2,4).string(element.fields[i].custom ? "No" : "Yes"); 

            ws.cell(i+2,5).string(element.fields[i].calculatedFormula || ""); 
            ws.cell(i+2,6).number(element.fields[i].length  ); 
            ws.cell(i+2,7).string(element.fields[i].type || ""); 
            ws.cell(i+2,8).string(element.fields[i].unique ? "Yes" : "No"); 
            ws.cell(i+2,9).number(element.fields[i].precision  ); 
            ws.cell(i+2,10).number(element.fields[i].scale  ); 
            ws.cell(i+2,11).string(element.fields[i].encrypted ? "Yes" : "No"); 
            ws.cell(i+2,12).string(element.fields[i].externalId ? "Yes" : "No"); 
            let pVal = parsePicklist(element.fields[i].picklistValues);
            ws.cell(i+2,13).string(pVal).style(wrap);  
            ws.cell(i+2,14).string(element.fields[i].createable ? "Yes" : "No");
            ws.cell(i+2,15).string(element.fields[i].updateable ? "Yes" : "No");
            ws.cell(i+2,16).string(element.fields[i].nillable ? "No" : "Yes"); 
        } 
    }); 
    
    wb.write(fileName); 

     //Create First Info Sheet
    function InformationWorkSheet(wb,combinedMetadata) {

        //Control default column width using sheetoption
        var sheetoption = {
            'sheetFormat': {
                'defaultColWidth': 30
            }
        };
        var row_Offset_InfoSheet = 10;
        var col_Offset_InfoSheet = 2;
        var ws_info = wb.addWorksheet("Info", sheetoption);
        let rowNumber = 1;

        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 1 + col_Offset_InfoSheet, "Tool Name");
        toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 2 + col_Offset_InfoSheet, "Schema Exporter");
        rowNumber++;
        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 1 + col_Offset_InfoSheet, "Created By");
        toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 2 + col_Offset_InfoSheet, "Jitendra Zaa");
        rowNumber++;
        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 1 + col_Offset_InfoSheet, "Version");
        toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 2 + col_Offset_InfoSheet, "1.4.1");
        rowNumber++;
        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 1 + col_Offset_InfoSheet, "Generated Date");
        toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 2 + col_Offset_InfoSheet, new Date(Date.now()).toLocaleString());
        
        rowNumber = 1;
        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 3 + col_Offset_InfoSheet, "Included Objects");

        combinedMetadata.forEach(element => { 
            toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 4 + col_Offset_InfoSheet, element.name);

            rowNumber++;
        });
    }

    function toolversion(ws_info, headerStyle, rowNum, colNum, txt){
        if(headerStyle){
            ws_info.cell(rowNum,colNum).string(txt).style(headerStyle)  ;
        }else{
            ws_info.cell(rowNum,colNum).string(txt) ;
        }
        
    }

    function parsePicklist(arr){
        let retVal = '';
        for(var i = 0;i < arr.length; i++){
            if(retVal){
                retVal = retVal+','+arr[i].label ;
            }else{
                retVal = arr[i].label ;
            }
            
        }
        return retVal ;
    }

}