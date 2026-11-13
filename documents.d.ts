import type {CanvasPortableDocument,CanvasDocument} from './js/canvas-instance.js';
export type {CanvasPortableDocument};
export function validatePortableDocument(input:unknown):CanvasPortableDocument;
export function migrateLegacyDocument(input:CanvasDocument|unknown):CanvasPortableDocument;
export interface CanvasImportReport {sourceId:string;sourceType:string;status:'Converted'|'Unsupported';destinationIds:string[];reasons:string[];}
export function importExcalidraw(input:unknown):{adapter:'excalidraw';/** 2 since 0.3.0-alpha.3: converts rectangles, ellipses, diamonds and two-point lines/arrows. */adapterVersion:2;document:CanvasPortableDocument;report:CanvasImportReport[]};
