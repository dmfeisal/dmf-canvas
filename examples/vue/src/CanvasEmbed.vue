<script setup>
import {ref,onMounted,onBeforeUnmount} from 'vue';
import {mountFrameworkHost} from './lib/framework-session.js';
const props=defineProps({name:{type:String,required:true}});
const host=ref(null);
let dispose=null;
onMounted(()=>{dispose=mountFrameworkHost(host.value,props.name);});
onBeforeUnmount(()=>{dispose?.();dispose=null;});
</script>

<template><div ref="host" class="framework-host" :data-framework-host="name"/></template>
