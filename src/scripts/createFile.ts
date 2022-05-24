
//import child_process = require('child_process');
//import util = require('util');
var xl = require('excel4node'); 
import {dependentPicklLists,objectDesc,pickList} from './pojo';
 
 /**
  * Main Entry Method to create Excel File from metadata
  * @param fileName 
  * @param combinedMetadata 
  * @param context 
  */
 var headerStyle = null;
export async function createFile(fileName,combinedMetadata : Array<objectDesc>,context) {
    
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook();

    // Create a reusable style
    headerStyle = wb.createStyle({
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
    
   
    /**
     * Create first worksheet with information about tool & summary of objects
     */
    InformationWorkSheet(wb,combinedMetadata,context);
  
    /**
     * Create second worksheet for dependent picklist
     * Known Issue - 1
     */
    //multiPicklistWorkSheet(wb,combinedMetadata,context);

    /**
     * Create third worksheet for simple picklist
     */
    simplePicklistWorkSheet(wb,combinedMetadata,context);

    /**
     * Create separate tab for each object with all field information
     */
    objectTabs(wb,combinedMetadata); 

    wb.write(fileName); 

    /**
     *  ####################### Methods started ###################
     */

    /**
     * Create separate tab for each object with all field information
     * @param wb 
     * @param combinedMetadata 
     */
    function objectTabs(wb,combinedMetadata: Array<objectDesc>){
        combinedMetadata.forEach(element => { 
            var ws =  wb.addWorksheet(element.name);
            let headers: String[] = ['Label','Name' ,'Help Text'  ,'Is Standard'  ,'Formula' ,'Max Length' ,'Type' ,'Is unique' ,'precision' ,'Scale' ,'Encrypted' ,'ExternalId' ,'PicklistValues' ,
                                        'Is Creatable' ,'Is Updatable' ,'Is Required', 'Restricted Picklist' ];
            addHeader(ws,headers,1,headerStyle);
            //context.ux.log(element);
     
            for(var i = 0; i< element.fields.length; i++){  
                var rowNumber = i+2 ;
                var isRestPickList = 'NA';
    
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
                //ws.cell(i+2,13).formula('="'+pVal+'"');
    
                addString(ws, rowNumber, 14, element.fields[i].createable ? "Yes" : "No" , "creatable" , element.fields[i]) ;
                addString(ws, rowNumber, 15, element.fields[i].updateable ? "Yes" : "No" , "updateable" , element.fields[i]) ;
                addString(ws, rowNumber, 16, element.fields[i].nillable ? "No" : "Yes" , "nillable" , element.fields[i]) ; 
    
                if(element.fields[i].type == 'picklist'){
                    if(element.fields[i].restrictedPicklist){
                        isRestPickList = 'Yes';
                    }else{
                        isRestPickList = 'No';
                    }
                }
                addString(ws, rowNumber, 17,isRestPickList, "Restricted Picklist" , element.fields[i]) ; 
            } 
        }); 
    }

    /**
     * Create a dedicated workbook for multi Picklists
     * @param wb Instance of workbook
     * @param combinedMetadata Full Metadata
     * @param context Salesforce CLI object context
     */
     function simplePicklistWorkSheet(wb, combinedMetadata : Array<objectDesc>,context){  
        var ws_Picklist = wb.addWorksheet("Picklist"); 
        let headers: String[] = ['Object Name', 'Field Name','Value','Is Active' ];
        addHeader(ws_Picklist,headers,1,headerStyle); 
        //header was row number 1
        var rowNum = 2;

        combinedMetadata.forEach(element => { 
            let objName = element.name; 
            let initialRowNum_obj = rowNum;
            let totalRows_obj = -1;

            element.fields.forEach(field =>{ 
                let initialRowNum_field :number = rowNum;
                let totalRows_field : number = -1;

                if(field.type == 'picklist'){ 
                    //context.ux.log( 'Found Picklist on object '+objName+' Field Name '+field.name);  
                    //context.ux.log(field); 
                    let pVal = field.picklistValues; 
                    field.picklistValues.forEach(option =>{ 
                        if(!field.controllerName){
                            let excelColumns: String[] = [objName, field.name, option.value, option.active ? "Yes":"No"];
                            addPickListToExcel(ws_Picklist,rowNum,excelColumns);  
                            rowNum++; 
                            totalRows_obj++;
                            totalRows_field++;
                        } 
                    });
                    //Merge Field API Name Column
                    let finalNum : number = initialRowNum_field + totalRows_field ;
                    
                    if( finalNum > initialRowNum_field){
                        //context.ux.log(initialRowNum_field+' , 2 , '+finalNum+' , 2 , true');
                        ws_Picklist.cell(initialRowNum_field ,2, finalNum ,2,true).string(field.name).style({ alignment: { vertical: 'top' } }); 
                    } 
                }
             });
             //Merge Object Columns
             let finalObjectColumn =  initialRowNum_obj + totalRows_obj ;
             if(finalObjectColumn > initialRowNum_obj){
                ws_Picklist.cell(initialRowNum_obj,1, finalObjectColumn ,1,true).string(element.name).style({ alignment: { vertical: 'top' } }); 
             }
             

        });
     }

     /**
      * Callback method to filter array and return only multi picklist metadata
      * @param field instance of field
      * @param index index of field
      * @param arr actual array of field
      * @returns 
      */
     function isMultiPicklist(field , index, arr) { 
        return field.controllerName ? true : false;
     } 

    /**
     * Create a dedicated workbook for multi Picklists
     * @param wb Instance of workbook
     * @param combinedMetadata Full Metadata
     * @param context Salesforce CLI object context
     */
    function multiPicklistWorkSheet(wb, combinedMetadata : Array<objectDesc>,context){  
        var ws_Picklist = wb.addWorksheet("Dependent Picklist"); 
        let headers: String[] = ['Object Name','Controlling Field Name','Dependent Field Name','Controlling Value','Value','Value Active', 'Is Multi Picklist' ];
        addHeader(ws_Picklist,headers,1,headerStyle); 
        //header was row number 1
        var rowNum = 2;
        var objectColumnNumber = 1 ; 
        

        let prevControllingField = null;
        let initialRowNum_cntrl_field :number = rowNum;  
        let totalRows_cntrl_field : number = -1;
        var controlingFieldColumnNumber = 2;

        let prevDependentField = null;
        let initialRowNum_Dependent_field :number = rowNum;  
        let totalRows_Dependent_field : number = -1;
        var depdepndentFieldColumnNumber = 3 ;

        let prevControllingValue = null;
        let initialRowNum_cntrl_Value :number = rowNum;  
        let totalRows_cntrl_Value : number = -1;
        var controlingValueColumnNumber = 4;
        
        


        combinedMetadata.forEach(element => {  
            let objName = element.name;  
            let initialRowNum_obj = rowNum; 
            let totalRows_obj = -1;  
            
            //context.ux.log('Length Before - '+element.fields.length);
            var lstMultiPicklistFields = element.fields.filter(isMultiPicklist); 
            //context.ux.log('Length After - '+lstMultiPicklistFields.length);

            lstMultiPicklistFields.forEach(field =>{ 
                let isMultiPicklist = 'H-No';

                if(field.type == 'picklist'){  
                    var sortedList = field.picklistValues.sort(function(a,b){
                        return a.validFor.toLowerCase().localeCompare(b.validFor.toLowerCase()) ; 
                    });

                    context.ux.log(field); 

                    sortedList.forEach(option =>{  
                        

                        if(prevDependentField == null ){
                            prevDependentField = field.name ;
                        }

                        //if(field.controllerName){ 
                            if(prevControllingField == null){
                                prevControllingField = field.controllerName;
                            }
                            if(prevControllingValue == null){
                                prevControllingValue = option.validFor;
                            }

                            isMultiPicklist = 'H-Yes';
                            let excelColumns: String[] = [objName,field.controllerName,field.name,option.validFor,option.value,option.active ? "Yes":"No",isMultiPicklist];
                            addPickListToExcel(ws_Picklist,rowNum,excelColumns);  
                             
                            //Logic to Merge Controlling Field Column 2
                            if(prevControllingField != field.controllerName ){ 
                                let finalControllingFieldCount : number = initialRowNum_cntrl_field + totalRows_cntrl_field; 
                                if(finalControllingFieldCount > initialRowNum_cntrl_field ){  
                                    ws_Picklist.cell(initialRowNum_cntrl_field,controlingFieldColumnNumber, finalControllingFieldCount ,controlingFieldColumnNumber,true).string(prevControllingField).style({ alignment: { vertical: 'top' } }); 
                                }
                                //Reset counters for controling field column
                                initialRowNum_cntrl_field = rowNum;
                                prevControllingField = field.controllerName;
                                totalRows_cntrl_field = -1; 
                            } 

                            //Logic to Merge Dependent Field Column 3
                            if(prevDependentField != field.name){
                                let finalDependentFieldCount : number = initialRowNum_Dependent_field + totalRows_Dependent_field;
                                if(finalDependentFieldCount > initialRowNum_Dependent_field){
                                    ws_Picklist.cell(initialRowNum_Dependent_field,depdepndentFieldColumnNumber, finalDependentFieldCount ,depdepndentFieldColumnNumber,true).string(prevDependentField).style({ alignment: { vertical: 'top' } }); 
                                }
                                //Reset counters for dependent field column
                                initialRowNum_Dependent_field = rowNum;
                                prevDependentField = field.name;
                                totalRows_Dependent_field = -1; 
                            } 

                            //Logic to Merge Controlling Value Column 4
                            //Commenting code as there is defect in sorting by Controlling Value. SO not merging that column
                            
                            if(prevControllingValue != option.validFor){
                                let finalControllingValueCount : number = initialRowNum_cntrl_Value + totalRows_cntrl_Value;
                                if(finalControllingValueCount > initialRowNum_cntrl_Value){
                                    ws_Picklist.cell(initialRowNum_cntrl_Value,controlingValueColumnNumber, finalControllingValueCount ,controlingValueColumnNumber,true).string(prevControllingValue).style({ alignment: { vertical: 'top' } }); 
                                }
                                //Reset counters for controlling value column
                                initialRowNum_cntrl_Value = rowNum;
                                prevControllingValue = option.validFor;
                                totalRows_cntrl_Value = -1; 
                            }  
                            

                            //Increment Next Row in Excel Sheet
                            rowNum++;
                            totalRows_obj++;
                            totalRows_cntrl_field++;   
                            totalRows_Dependent_field++;
                            totalRows_cntrl_Value++;
                        //} 
                    }); 
                }
                
             });

             //Merge all columns for same object
             let finalObjectRowCount : number = initialRowNum_obj + totalRows_obj ;
             if(finalObjectRowCount > initialRowNum_obj){
                ws_Picklist.cell(initialRowNum_obj,objectColumnNumber, finalObjectRowCount ,objectColumnNumber,true).string(element.name).style({ alignment: { vertical: 'top' } }); 
             }
             
        });
    }
    
    /**
     * Utility method to add whole row at a time for picklist in Excel sheet
     * @param ws_Picklist Worksheet instance
     * @param rowNum Row number to be used for adding
     * @param excelColumns List of all columns to be added
     */
    function addPickListToExcel(ws,rowNum,excelColumns){
        var colNum = 1;
        excelColumns.forEach(column=>{
            //if(column){
                ws.cell(rowNum,colNum).string(column) ;
                colNum++;
            //} 
        });
        
    }


    /**
     * 
     * @param ws Utility method to create header & default style
     * @param headers 
     * @param rowNumber 
     * @param headerStyle 
     */

    function addHeader(ws, headers,rowNumber,headerStyle){
        let coulmnNumber = 1 ;
        headers.forEach(element =>{
            ws.cell(rowNumber,coulmnNumber).string(element).style(headerStyle);
            coulmnNumber++;
        });

    }

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
    
    

    /**
     * Create first default worksheet with information about tool, version & author
     * @param wb Workbook
     * @param combinedMetadata Full Metadata Information
     * @param context Salesforce Context
     */
    function InformationWorkSheet(wb,combinedMetadata : Array<objectDesc>,context) {
 
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

    /**
     * Utility method to print tool version information
     * @param ws_info 
     * @param headerStyle 
     * @param rowNum 
     * @param colNum 
     * @param txt 
     */
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
                retVal = retVal+',\n'+ tmpVal ;
            }else{
                retVal = tmpVal ;
            }
            
        }
        return retVal ;
    }

}