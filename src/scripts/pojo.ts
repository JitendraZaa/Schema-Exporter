/**
 * Simple old objects act like Java POJO classes
 */
 export interface dependentPicklLists{
     /**
      * Name of the object
      */
    objectName : string;

    /**
     * API Name of the field controlling picklist values
     */
    controllingFieldName : string;

    /**
     * Value of the picklist thats controlling
     */
    controllingValue: string;

    /**
     * API Name of the field being controlled i.e. dependent field
     */
    dependentFieldName: string;

    /**
     * Value of the picklist thats being controlled i.e. depdendnt value
     */
    dependentValue : string;
     
    /**
     * Is value of dependent picklist is active
     */
    isActive : boolean;
  }

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
  }

  export interface fieldInfo{
    label : string;
    name : string;
    custom : boolean;
    inlineHelpText : string ;
    calculatedFormula : string;
    length : number ;
    type : string;
    unique : string ;
    precision : number;
    scale : number;
    encrypted : boolean;
    externalId : boolean;
    picklistValues:Array<pickList>;
    updateable: boolean;
    nillable : boolean; 
    createable: boolean;
    aggregatable : boolean;
    aiPredictionField : boolean;
    autoNumber : boolean;
    calculated : boolean; 
    restrictedPicklist : boolean;
    referenceTo : Array<String>; 
    controllerName : string;
  }
  export interface pickList{
    label : string;
    value : string;
    active: boolean;
    defaultValue: string;
    validFor:string;
  }

  export interface objectDesc{
    name : string ;
    fields : Array<fieldInfo> ;
    recordTypes : Array<pageLayoutInfo> ;
  }

  export interface sobjectRes{
    encoding:string;
    maxBatchSize : number;
    sobjects : Array<sObject>;
  }


/**
 * Detail about recordtype & Layout
 */
export interface recordType{
  active : boolean;
  developerName : string;
  layoutId : string;
  name : string;
  recordTypeId : string;
}

/**
 * List of all Layouts associated with object
 */
export interface objectPageLayouts{
  recordTypeMappings : Array<recordType>;
  recordTypeSelectorRequired : boolean;
}

/**
 * List of fields & access on page layouts
 */
export interface pageLayoutInfo{
  fields? : Array<fieldInfoAdditional>;
  objectName? : string;
  recordTypeId? : string;
  recordTypeName? : string;
}

/**
 * Detailed information about fields on pagelayout
 */
export interface fieldInfoAdditional{
  fieldDetail? : fieldInfo;
  editableForNew? : boolean;
  editableForUpdate? : boolean;
  apiName? : string;
  required? : boolean;
}
