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
        
    combinedMetadata.forEach(element => {

        var ws =  wb.addWorksheet(element.name);
        ws.cell(1,1).string('Label').style(headerStyle);
        ws.cell(1,2).string('Name').style(headerStyle); 
        ws.cell(1,3).string('Help Text').style(headerStyle);  
        ws.cell(1,4).string('Is Custom').style(headerStyle); 

        for(var i = 0; i< element.fields.length; i++){
            ws.cell(i+2,1).string(element.fields[i].label);
            ws.cell(i+2,2).string(element.fields[i].name);
            ws.cell(i+2,3).string(element.fields[i].inlineHelpText || ""); 
            ws.cell(i+2,4).string(element.fields[i].custom || "False"); 
        } 
    }); 
    
    wb.write(fileName); 

}