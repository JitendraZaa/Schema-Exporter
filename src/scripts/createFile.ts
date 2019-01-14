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

        var wrap = wb.createStyle({ 
            alignment: {
              wrapText: true 
            },
          });
        
    combinedMetadata.forEach(element => {

        var ws =  wb.addWorksheet(element.name);
        ws.cell(1,1).string('Label').style(headerStyle);
        ws.cell(1,2).string('Name').style(headerStyle); 
        ws.cell(1,3).string('Help Text').style(headerStyle);  
        ws.cell(1,4).string('Is Standard').style(headerStyle); 

        ws.cell(1,5).string('Formula').style(headerStyle); 
        ws.cell(1,6).string('length').style(headerStyle); 
        ws.cell(1,7).string('type').style(headerStyle); 
        ws.cell(1,8).string('unique').style(headerStyle); 
        ws.cell(1,9).string('precision').style(headerStyle); 
        ws.cell(1,10).string('scale').style(headerStyle); 
        ws.cell(1,11).string('encrypted').style(headerStyle); 
        ws.cell(1,12).string('externalId').style(headerStyle); 
        ws.cell(1,13).string('picklistValues').style(headerStyle); 

        for(var i = 0; i< element.fields.length; i++){
            ws.cell(i+2,1).string(element.fields[i].label);
            ws.cell(i+2,2).string(element.fields[i].name);
            ws.cell(i+2,3).string(element.fields[i].inlineHelpText || ""); 
            ws.cell(i+2,4).string(element.fields[i].custom ? "No" : "Yes"); 

            ws.cell(i+2,5).string(element.fields[i].calculatedFormula || ""); 
            ws.cell(i+2,6).string(element.fields[i].length || ""); 
            ws.cell(i+2,7).string(element.fields[i].type || ""); 
            ws.cell(i+2,8).string(element.fields[i].unique ? "Yes" : "No"); 
            ws.cell(i+2,9).string(element.fields[i].precision || ""); 
            ws.cell(i+2,10).string(element.fields[i].scale || ""); 
            ws.cell(i+2,11).string(element.fields[i].encrypted ? "Yes" : "No"); 
            ws.cell(i+2,12).string(element.fields[i].externalId ? "Yes" : "No"); 
            let pVal = parsePicklist(element.fields[i].picklistValues);
            ws.cell(i+2,13).string(pVal).style(wrap);  
        } 
    }); 
    
    wb.write(fileName); 

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