import test from 'node:test';
import assert from 'node:assert/strict';
import {planInspector,combinedGeometry,geometryRect} from '../js/canvas-instance-inspector-plan.js';
const item=(patch={})=>({centerX:100,centerY:100,localWidth:80,localHeight:40,scale:1,angle:0,minScale:.5,maxScale:1.8,bounds:{left:8,right:492,top:8,bottom:368},...patch});
const near=(a,b)=>assert(Math.abs(a-b)<.0001,`${a} != ${b}`);
test('inspector clamps translation and proportionally scales about visible top-left',()=>{
 const original=item(),box=combinedGeometry([original]);
 const moved=planInspector([original],'x',-100);near(combinedGeometry(moved).x,8);near(combinedGeometry(moved).y,box.y);
 const scaled=planInspector([original],'width',120);near(scaled[0].scale,1.5);const r=combinedGeometry(scaled);near(r.width,120);near(r.height,60);near(r.x,box.x);near(r.y,box.y);
 near(planInspector([original],'height',400)[0].scale,1.8);assert.equal(original.scale,1);
});
test('mixed geometry scaling preserves relative placement and intersects limits',()=>{
 const items=[item(),item({centerX:240,centerY:180,localWidth:120,angle:25,maxScale:1.2})],box=combinedGeometry(items);
 const p=planInspector(items,'width',box.width*1.5);near(p[0].scale,1.2);near(p[1].scale,1.2);near(p[1].centerX-p[0].centerX,140*1.2);
});
test('rotation is absolute for one and relative rigid rotation for many',()=>{
 near(planInspector([item({angle:25})],'rotation',90)[0].angle,90);
 const items=[item(),item({centerX:200})],p=planInspector(items,'rotation',90);
 near(p[1].centerX-p[0].centerX,0);near(p[1].centerY-p[0].centerY,100);near(p[0].angle,90);
 const r=geometryRect(p[0]);assert(r.x>=8&&r.y>=8);
});
test('invalid or impossible plans are rejected without mutation',()=>{
 for(const v of [NaN,Infinity,'100',null,1e12])assert.equal(planInspector([item()],'x',v),null);
 for(const v of [0,-10])assert.equal(planInspector([item()],'width',v),null);
 assert.equal(planInspector([],'x',10),null);assert.equal(planInspector([null],'x',10),null);assert.equal(planInspector([item()],'scale',2),null);
 const wide=item({localWidth:450,centerX:250,localHeight:40,bounds:{left:8,right:492,top:8,bottom:100}});assert.equal(planInspector([wide],'rotation',90),null);
});
