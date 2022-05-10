
import child_process = require('child_process');
import util = require('util');
var xl = require('excel4node');
 
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
 

export async function createFile(fileName,combinedMetadata,context) {
    
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
    
   
    InformationWorkSheet(wb,combinedMetadata,context);

        
    combinedMetadata.forEach(element => { 
        //context.ux.log(element);
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

            var rowNumber = i+2 ;
            addString(ws, rowNumber, 1, element.fields[i].label, "label" , element.fields[i]) ;
            addString(ws, rowNumber, 2, element.fields[i].name , "name" , element.fields[i]) ;
            addString(ws, rowNumber, 3, element.fields[i].inlineHelpText || "", "inline help text" , element.fields[i]) ;
            addString(ws, rowNumber, 4, element.fields[i].custom ? "No" : "Yes" , "is custom" , element.fields[i]) ;

            addString(ws, rowNumber, 5, element.fields[i].calculatedFormula || "" , "calculated formula" , element.fields[i]) ;
            addNumber(ws, rowNumber, 6, element.fields[i].length, "length" , element.fields[i]) ;
            addString(ws, rowNumber, 7, element.fields[i].type || "", "type" , element.fields[i]) ;
            addString(ws, rowNumber, 8, element.fields[i].unique ? "Yes" : "No" , "unique" , element.fields[i]) ;

            addNumber(ws, rowNumber, 9, element.fields[i].precision, "precision", element.fields[i]) ;
            addNumber(ws, rowNumber, 10, element.fields[i].scale, "scale" , element.fields[i]) ;
            addString(ws, rowNumber, 11, element.fields[i].encrypted ? "Yes" : "No" , "encrypted" , element.fields[i]) ;
            addString(ws, rowNumber, 12, element.fields[i].externalId ? "Yes" : "No" , "external Id" , element.fields[i]) ;

            let pVal = parsePicklist(element.fields[i].picklistValues);
            ws.cell(i+2,13).string(pVal).style(wrap);  

            addString(ws, rowNumber, 14, element.fields[i].createable ? "Yes" : "No" , "creatable" , element.fields[i]) ;
            addString(ws, rowNumber, 15, element.fields[i].updateable ? "Yes" : "No" , "updateable" , element.fields[i]) ;
            addString(ws, rowNumber, 16, element.fields[i].nillable ? "No" : "Yes" , "nillable" , element.fields[i]) ;
 
        } 
    }); 

    /**
     * This method makes debugging easy if needed while adding string in Workbook
     * @param ws 
     * @param row 
     * @param col 
     * @param val 
     * @param propName 
     * @param field 
     */
    function addString(ws, row,col,val,propName,field){
        try{ 
            ws.cell(row,col).string(val);
        }catch(e){
            context.ux.log('Exception : Property Name - '+propName+' , Field Name - '+field.name+' , Error - '+e.message); 
        }
    }

    /**
     * This method makes debugging easy if needed while adding numbers in Workbook
     * @param ws 
     * @param row 
     * @param col 
     * @param val 
     * @param objName 
     * @param field 
     */
    function addNumber(ws, row,col,val,objName,field){
        try{
            ws.cell(row,col).number(val);
        }catch(e){
            context.ux.log('Object Name - '+objName+' , Field Name - '+field.name+' , Error - '+e.message); 
        }
    }
    
    wb.write(fileName); 

     //Create First Info Sheet
    function InformationWorkSheet(wb,combinedMetadata,context) {

        //Control default column width using sheetoption
        var sheetoption = {
            'sheetFormat': {
                'defaultColWidth': 30
            } 
        };
        var row_Offset_InfoSheet = 0;
        var col_Offset_InfoSheet = 0;
        var ws_info = wb.addWorksheet("Info", sheetoption);
        let rowNumber = 1;

        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 1 + col_Offset_InfoSheet, "Tool Name");
        toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 2 + col_Offset_InfoSheet, "Schema Exporter");
        rowNumber++;

        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 1 + col_Offset_InfoSheet, "Tool Created By");
        toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 2 + col_Offset_InfoSheet, "Jitendra Zaa");
        rowNumber++;

        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 1 + col_Offset_InfoSheet, "Connection User name");
        toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 2 + col_Offset_InfoSheet, context.org.getUsername() );
        rowNumber++;

        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 1 + col_Offset_InfoSheet, "Connection URL");
        toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 2 + col_Offset_InfoSheet, context.org.getConnection().baseUrl() );
        rowNumber++;
 
        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 1 + col_Offset_InfoSheet, "Version");
        toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 2 + col_Offset_InfoSheet, "1.4.1");
        rowNumber++;

        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 1 + col_Offset_InfoSheet, "Generated Date");
        toolversion(ws_info, infoValueStyle, rowNumber + row_Offset_InfoSheet, 2 + col_Offset_InfoSheet, new Date(Date.now()).toLocaleString());
        
        rowNumber = 1;
        toolversion(ws_info, headerStyle, rowNumber + row_Offset_InfoSheet, 3 + col_Offset_InfoSheet, "Included Objects");

        combinedMetadata.forEach(element => {  
            let linkFormula =  element.name; 
            ws_info.cell( rowNumber + row_Offset_InfoSheet,4 + col_Offset_InfoSheet).string(linkFormula); 
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
        /**
         * This method handles classic or new Picklist metadata and sends as csv string
         * @param arr 
         * @returns 
         */
       function parsePicklist(arr){
        //context.ux.log(arr);
        let retVal = '';
        for(var i = 0;i < arr.length; i++){
            let tmpVal = arr[i].label ? arr[i].label : arr[i].value ;
            if(retVal){ 
                retVal = retVal+','+ tmpVal ;
            }else{
                retVal = tmpVal ;
            }
            
        }
        return retVal ;
    }

}