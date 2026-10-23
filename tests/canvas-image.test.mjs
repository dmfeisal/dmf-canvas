import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateImage} from '../js/canvas-instance-image-data.js';
import {validateObject} from '../js/canvas-instance-document.js';
const src='data:image/jpeg;base64,'+(await readFile(new URL('./fixtures/canvas-image.jpg',import.meta.url))).toString('base64');
const image=()=>({src,alt:'Blue and white test image',width:160,height:100});
test('image records retain bounded raster data but discard markup and metadata',()=>{
 const input={type:'image',image:{...image(),url:'https://invalid.test/image',html:'<script/>'},layout:{left:40,top:40,width:160,height:100,fontSize:18},state:{x:0,y:0,scale:1,angle:0,width:'160px',content:null}};
 const data=validateObject(input);assert.deepEqual(data.image,image());assert.equal(data.state.content,null);assert.equal(data.text,undefined);assert.notEqual(data.image,input.image);
});
test('image records reject remote active oversized mismatched and malformed sources',()=>{
 for(const patch of [{src:'https://invalid.test/image.jpg'},{src:'data:image/svg+xml;base64,PHN2Zy8+'},{src:'data:image/jpeg;base64,AAAA'},{src:'data:image/jpeg;base64,'+'A'.repeat(32768)},{width:161},{height:8192},{alt:'bad\0name'},{alt:'a'.repeat(121)}])assert.throws(()=>validateImage({...image(),...patch}));
});

test('transparent PNG records remain bounded and descriptions round-trip with legacy compatibility',async()=>{
 const png='data:image/png;base64,'+(await readFile(new URL('./fixtures/canvas-transparent.png',import.meta.url))).toString('base64'),value={src:png,alt:'Transparent blue rectangle',width:64,height:40};assert.deepEqual(validateImage(value),value);
 const record={type:'image',image:value,layout:{left:10,top:10,width:64,height:40,fontSize:18},state:{x:0,y:0,scale:1,angle:0,width:'64px',content:null}};
 assert.equal(validateObject(record).state.alt,value.alt);record.state.alt='Different';assert.throws(()=>validateObject(record),/mismatch/);
 const bytes=Buffer.from(png.split(',')[1],'base64');bytes.writeUInt32BE(100000,16);assert.throws(()=>validateImage({...value,src:'data:image/png;base64,'+bytes.toString('base64')}));
 assert.throws(()=>validateImage({...value,src:png.slice(0,-16)}));
});
